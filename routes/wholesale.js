const express = require('express');
const router = express.Router();
const {
  sendAdminEmail,
  sendCustomerEmail,
  sendApprovalEmail,
  sendDeclineEmail
} = require('../utils/sendEmail');

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

  if (!business_name || !contact_name || !contact_number || !abn || !contact_email || !address || (terms_accepted !== true && terms_accepted !== 'true')) {
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
      token
    });

    await sendCustomerEmail({ contact_email, contact_name });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).json({ error: 'Email failed to send.' });
  }
});

// Approval route
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

// Decline route
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

// Corrected Send wholesale order route with validation middleware
router.post('/send-order', validateOrder, async (req, res) => {
  try {
    const order = req.body;

    await sendOrderEmail({
      order,
      to: [process.env.ADMIN_EMAIL, order.email],
    });

    res.json({ message: 'Order emails sent successfully.' });
  } catch (error) {
    console.error('Failed to send order emails:', error);
    res.status(500).json({ error: 'Failed to send order emails' });
  }
});

module.exports = router;
