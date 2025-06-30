const express = require('express');
const router = express.Router();
const {
  sendAdminEmail,
  sendCustomerEmail,
  sendApprovalEmail,
  sendDeclineEmail
} = require('../utils/sendEmail');

const { sendOrderEmail } = require('../utils/sendOrderEmail'); // Import your new order email util
const crypto = require('crypto');

// Shared secret key for signing (keep safe)
const SECRET_KEY = process.env.ACTION_SECRET || 'replace_this_secret';

// 🔒 Create signed token
function createSignedToken(email) {
  const timestamp = Date.now();
  const data = `${email}:${timestamp}`;
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return `${email}:${timestamp}:${hash}`;
}

// 🔒 Verify signed token
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(':');
  if (parts.length !== 3) return null;
  const [email, timestamp, hash] = parts;

  const expected = crypto.createHmac('sha256', SECRET_KEY)
    .update(`${email}:${timestamp}`)
    .digest('hex');

  // Check hash and 10 min expiration
  const now = Date.now();
  const isValid = expected === hash && now - parseInt(timestamp) < 10 * 60 * 1000;
  return isValid ? email : null;
}

// ✅ POST /wholesale/signup
router.post('/signup', async (req, res) => {
  const {
    business_name,
    contact_name,
    contact_number,
    abn,
    contact_email,
    address,
    message,
    accepts_marketing,
    terms_accepted
  } = req.body;

  if (
    !business_name ||
    !contact_name ||
    !contact_number ||
    !abn ||
    !contact_email ||
    !address ||
    (terms_accepted !== true && terms_accepted !== 'true')
  ) {
    return res.status(400).json({ error: 'Missing required fields or terms not accepted.' });
  }

  try {
    const token = createSignedToken(contact_email);

    await sendAdminEmail({
      business_name,
      contact_name,
      contact_number,
      abn,
      contact_email,
      address,
      message,
      accepts_marketing,
      terms_accepted,
      token // ✅ Include token in admin email for action buttons
    });

    await sendCustomerEmail({ contact_email, contact_name });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).json({ error: 'Email failed to send.' });
  }
});

// ✅ GET /wholesale/approve?token=...
router.get('/approve', async (req, res) => {
  const { token } = req.query;
  const email = verifyToken(token);
  if (!email) return res.status(403).send('Invalid or expired token.');

  try {
    await sendApprovalEmail({ email });
    res.send('✅ Approval email sent to graphics team.');
  } catch (err) {
    console.error('Approval Email Error:', err);
    res.status(500).send('Failed to send approval email.');
  }
});

// ✅ GET /wholesale/decline?token=...
router.get('/decline', async (req, res) => {
  const { token } = req.query;
  const email = verifyToken(token);
  if (!email) return res.status(403).send('Invalid or expired token.');

  try {
    await sendDeclineEmail({ email });
    res.send('❌ Decline email sent to applicant.');
  } catch (err) {
    console.error('Decline Email Error:', err);
    res.status(500).send('Failed to send decline email.');
  }
});

// NEW ROUTE: POST /wholesale/order
router.post('/order', async (req, res) => {
  try {
    const {
      businessName,
      contactName,
      email,
      phone,
      customerNumber,
      address,
      submissionDate,
      submissionNumber,
      orderItems,
      total,
    } = req.body;

    if (!email || !orderItems || !orderItems.length) {
      return res.status(400).json({ error: 'Missing required order information.' });
    }

    // Send order emails (admin and customer)
    await sendOrderEmail({
      to: 'info@sugarlean.com.au',
      subject: `New Wholesale Order from ${businessName || contactName}`,
      businessName,
      contactName,
      email,
      phone,
      customerNumber,
      address,
      submissionDate,
      submissionNumber,
      orderItems,
      total,
    });

    await sendOrderEmail({
      to: email,
      subject: 'Your Wholesale Order Confirmation',
      businessName,
      contactName,
      email,
      phone,
      customerNumber,
      address,
      submissionDate,
      submissionNumber,
      orderItems,
      total,
    });

    res.json({ success: true, message: 'Order submitted and confirmation emails sent.' });
  } catch (err) {
    console.error('Order submission error:', err);
    res.status(500).json({ error: 'Failed to submit order.' });
  }
});

module.exports = router;
