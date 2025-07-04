const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

// ✅ Send email to admin
const sendAdminEmail = async ({
  business_name,
  contact_name,
  contact_number,
  abn,
  contact_email,
  address = {},
  message,
  accepts_marketing,
  terms_accepted,
  token
}) => {
  const {
    street_address = 'undefined',
    street_address_2 = '(none)',
    city = 'undefined',
    state = 'undefined',
    postcode = 'undefined',
    country = 'undefined'
  } = address;

  const now = new Date().toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Australia/Sydney',
  });

  const html = `
    <div style="font-family: Poppins, sans-serif; background: #fff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 30px; max-width: 600px; margin: 30px auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://cdn.shopify.com/s/files/1/0935/0912/4390/files/Little_joy_Logo_Dark-01.png?v=1742865985" alt="Little Joy Logo" style="max-width: 140px;">
      </div>
      <h2 style="text-align: center; color: #618C02;">📥 New Wholesale Signup</h2>
      <table style="font-size: 14px; line-height: 1.8; margin: 0 auto;">
        <tr><td><strong>Business Name:</strong></td><td>${business_name}</td></tr>
        <tr><td><strong>Contact Name:</strong></td><td>${contact_name}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${contact_number}</td></tr>
        <tr><td><strong>ABN:</strong></td><td>${abn}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${contact_email}</td></tr>
        <tr><td><strong>Street Address:</strong></td><td>${street_address}</td></tr>
        <tr><td><strong>Address Line 2:</strong></td><td>${street_address_2}</td></tr>
        <tr><td><strong>City:</strong></td><td>${city}</td></tr>
        <tr><td><strong>State:</strong></td><td>${state}</td></tr>
        <tr><td><strong>Postcode:</strong></td><td>${postcode}</td></tr>
        <tr><td><strong>Country:</strong></td><td>${country}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${message || '(none)'}</td></tr>
        <tr><td><strong>Marketing Consent:</strong></td><td>${accepts_marketing ? '✅ Yes' : '❌ No'}</td></tr>
        <tr><td><strong>Terms Accepted:</strong></td><td>${terms_accepted ? '✅ Yes' : '❌ No'}</td></tr>
      </table>
      <div style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
        <p>Submitted: ${now}</p>
        <p><a href="https://www.littlejoy.com.au" style="color: #618C02;">littlejoy.com.au</a></p>
      </div>
    </div>
  `;

  console.time('sendAdminEmail');
  await transporter.sendMail({
    from: `"Little Joy Wholesale" <${process.env.EMAIL_USER}>`,
    to: 'info@sugarlean.com.au',
    replyTo: 'info@sugarlean.com.au',
    subject: '📩 New Wholesale Application',
    html,
  });
  console.timeEnd('sendAdminEmail');
};

// ✅ Send confirmation to customer
const sendCustomerEmail = async ({ contact_email, contact_name }) => {
  const html = `
    <div style="font-family: Poppins, sans-serif; background: #fff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 30px; max-width: 600px; margin: 30px auto; text-align: center;">
      <img src="https://cdn.shopify.com/s/files/1/0935/0912/4390/files/Little_joy_Logo_Dark-01.png?v=1742865985" alt="Little Joy Logo" style="max-width: 120px; margin-bottom: 20px;">
      <h2 style="color: #618C02;">Thank you for your wholesale application!</h2>
      <p style="font-size: 14px;">Hi <strong>${contact_name || 'there'}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6;">
        We’ve received your wholesale application and are reviewing your details.<br>
        Our team will get back to you shortly.<br><br>
        If you have any questions, contact us anytime.
      </p>
      <a href="https://www.littlejoy.com.au" style="margin-top: 30px; padding: 12px 24px; background-color: #618C02; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Visit Our Store</a>
      <p style="margin-top: 40px; font-size: 12px; color: #999;">© 2025 Little Joy Confectionery</p>
      <p style="font-size: 12px; color: #999;">Contact: <a href="mailto:info@sugarlean.com.au" style="color: #999;">info@sugarlean.com.au</a></p>
    </div>
  `;

  console.time('sendCustomerEmail');
  await transporter.sendMail({
    from: `"Little Joy Confectionery" <${process.env.EMAIL_USER}>`,
    to: contact_email,
    replyTo: 'info@sugarlean.com.au',
    subject: '🎉 Thanks for Applying to Little Joy Wholesale!',
    html,
  });
  console.timeEnd('sendCustomerEmail');
};

module.exports = {
  sendAdminEmail,
  sendCustomerEmail,
};
