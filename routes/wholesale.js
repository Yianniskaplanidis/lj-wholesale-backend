const express = require('express');
const router = express.Router();
const {
  sendAdminEmail,
  sendCustomerEmail,
  sendApprovalEmail,
  sendDeclineEmail
} = require('./utils/sendSignupEmail');

const { sendOrderEmail } = require('../utils/sendOrderEmail');
const validateOrder = require('../middleware/validateOrder');
const crypto = require('crypto');

const SECRET_KEY = process.env.ACTION_SECRET || 'replace_this_secret';

function createSignedToken(email) {
  const timestamp = Date.now();
  const data = `${email}:${timestamp}`;
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return `${email}:${timestamp}:${hash}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(':');
  if (parts.length !== 3) return null;
  const [email, timestamp, hash] = parts;

  const expected = crypto.createHmac('sha256', SECRET_KEY).update(`${email}:${timestamp}`).digest('hex');

  const now = Date.now();
  const isValid = expected === hash && now - parseInt(timestamp) < 10 * 60 * 1000;
  return isValid ? email : null;
}

// Signup route
// Signup route
router.post('/signup', async (req, res) => {
  const {
    business_name,
    contact_name,
    contact_number,
    abn,
    contact_email,
    street_address,
    street_address_2,
    city,
    state,
    postcode,
    country,
    message,
    accepts_marketing,
    terms_accepted
  } = req.body;

  if (
    !business_name || !contact_name || !contact_number || !abn || !contact_email ||
    !street_address || !city || !state || !postcode || !country ||
    (terms_accepted !== true && terms_accepted !== 'true')
  ) {
    return res.status(400).json({ error: 'Missing required fields or terms not accepted.' });
  }

  const address = {
    street_address,
    street_address_2,
    city,
    state,
    postcode,
    country
  };

  try {
    const token = createSignedToken(contact_email);

    // ✅ Send both emails in parallel
    await Promise.all([
      sendAdminEmail({
        business_name,
        contact_name,
        contact_number,
        abn,
        contact_email,
        address,
        message,
        accepts_marketing,
        terms_accepted,
        token
      }),
      sendCustomerEmail({ contact_email, contact_name })
    ]);


    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).json({ error: 'Email failed to send.' });
  }
});

// Send wholesale order route
router.post('/send-order', validateOrder, async (req, res) => {
  try {
    const order = req.body;

    // 🔢 Calculate total if not provided
    let total = 0;
    for (const p of order.products) {
      const qty = Number(p.qty) || 0;
      const unit = Number(p.unit_price) || 0;
      total += qty * unit;
    }
    order.total = parseFloat(total.toFixed(2));

    order.submissionDate = order.submissionDate || new Date().toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    order.submissionNumber = order.submissionNumber || 'Undefined-000001';

    const adminEmail = process.env.ADMIN_EMAIL || 'info@sugarlean.com.au';

    await sendOrderEmail({
      order,
      to: [adminEmail, order.email],
    });

    res.json({ message: 'Order emails sent successfully.' });
  } catch (error) {
    console.error('Failed to send order emails:', error);
    res.status(500).json({ error: 'Failed to send order emails', details: error.message });
  }
});

module.exports = router;
