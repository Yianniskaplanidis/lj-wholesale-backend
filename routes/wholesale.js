const express = require('express');
const router = express.Router();
const { sendAdminEmail, sendCustomerEmail } = require('../utils/sendEmail');

// ✅ POST /wholesale/signup — new wholesale registration
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

  // ✅ Validate required fields and terms checkbox
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
    // ✅ Send styled email to Little Joy team
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

    // ✅ Send confirmation to the applicant
    await sendCustomerEmail({ contact_email, contact_name });

    res.status(200).json({ success: true, message: 'Signup successful.' });
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).json({ error: 'Email failed to send.' });
  }
});

module.exports = router;
