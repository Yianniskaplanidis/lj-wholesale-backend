const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const sendEmail = require('../utils/sendEmail');

// POST /wholesale/signup — new wholesale registration
=======
const { sendAdminEmail, sendCustomerEmail } = require('../utils/sendEmail');

>>>>>>> 1dbe1e6 (Initial commit with updated styled email)
router.post('/signup', async (req, res) => {
  const {
    business_name,
    contact_name,
    contact_number,
    abn,
    contact_email,
    address,
    message,
<<<<<<< HEAD
  } = req.body;

  // ✅ Check for missing fields
  if (!business_name || !contact_name || !contact_number || !abn || !contact_email || !address) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // ✅ Send notification to Little Joy team
    await sendEmail({
      to: 'info@sugarlean.com.au',
      subject: 'New Wholesale Signup',
      html: `
        <h2>New Wholesale Signup Request</h2>
        <p><strong>Business Name:</strong> ${business_name}</p>
        <p><strong>Contact Name:</strong> ${contact_name}</p>
        <p><strong>Phone:</strong> ${contact_number}</p>
        <p><strong>ABN:</strong> ${abn}</p>
        <p><strong>Email:</strong> ${contact_email}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Message:</strong> ${message || '—'}</p>
      `,
    });

    // ✅ Send confirmation to the customer
    await sendEmail({
      to: contact_email,
      subject: 'Thanks for applying!',
      html: `
        <p>Hi ${contact_name},</p>
        <p>Thanks for signing up for a wholesale account with <strong>Little Joy</strong>.</p>
        <p>We’ll review your application and get in touch shortly.</p>
        <p>– The Little Joy Team</p>
      `,
    });

    res.status(200).json({ message: 'Signup successful.' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
=======
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
    await sendAdminEmail({
      business_name,
      contact_name,
      contact_number,
      abn,
      contact_email,
      address,
      message,
      accepts_marketing,
      terms_accepted
    });

    await sendCustomerEmail({ contact_email, contact_name });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).json({ error: 'Email failed to send.' });
>>>>>>> 1dbe1e6 (Initial commit with updated styled email)
  }
});

module.exports = router;
