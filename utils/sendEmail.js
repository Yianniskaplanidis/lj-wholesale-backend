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

// ✅ Admin Notification Email
const sendAdminEmail = async ({
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
}) => {
  const now = new Date().toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Australia/Sydney',
  });

  const approveLink = `https://lj-wholesale-backend.onrender.com/wholesale/approve?token=${token}`;
const declineLink = `https://lj-wholesale-backend.onrender.com/wholesale/decline?token=${token}`;

  const html = `
    <div style="font-family: Poppins, sans-serif; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 30px; max-width: 600px; margin: 30px auto; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://cdn.shopify.com/s/files/1/0935/0912/4390/files/Little_joy_Logo_Dark-01.png?v=1742865985" alt="Little Joy Logo" style="max-width: 140px;">
      </div>

      <h2 style="text-align: center; color: #618C02; margin-bottom: 30px;">📥 New Wholesale Signup Received</h2>

      <table style="width: 100%; font-size: 14px; line-height: 1.8;">
        <tr><td><strong>Business Name:</strong></td><td>${business_name}</td></tr>
        <tr><td><strong>Contact Name:</strong></td><td>${contact_name}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${contact_number}</td></tr>
        <tr><td><strong>ABN:</strong></td><td>${abn}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${contact_email}</td></tr>
        <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${message || '(none)'}</td></tr>
        <tr><td><strong>Marketing Consent:</strong></td><td>${accepts_marketing ? '✅ Yes' : '❌ No'}</td></tr>
        <tr><td><strong>Terms Accepted:</strong></td><td>${terms_accepted ? '✅ Yes' : '❌ No'}</td></tr>
      </table>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${approveLink}" style="display: inline-block; background-color: #618C02; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 12px;">
          <span style="color: #fff; font-size: 16px; vertical-align: middle;">✔</span> Approve
        </a>
        <a href="${declineLink}" style="display: inline-block; background-color: #D32F2F; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          <span style="color: #fff; font-size: 16px; vertical-align: middle;">✖</span> Decline
        </a>
      </div>

      <div style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
        <p>Submitted: ${now}</p>
        <p>From website: <a href="https://www.littlejoy.com.au" style="color: #618C02;">littlejoy.com.au</a></p>
        <p>Contact: <a href="mailto:info@sugarlean.com.au" style="color: #618C02;">info@sugarlean.com.au</a></p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Little Joy Wholesale" <${process.env.EMAIL_USER}>`,
    to: 'info@sugarlean.com.au',
    replyTo: 'info@sugarlean.com.au',
    subject: '📩 New Wholesale Application',
    html,
  });
};

const sendCustomerEmail = async ({ contact_email, contact_name }) => {
  const html = `
    <div style="font-family: Poppins, sans-serif; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 30px; max-width: 600px; margin: 30px auto; text-align: center; color: #000;">
      <img src="https://cdn.shopify.com/s/files/1/0935/0912/4390/files/Little_joy_Logo_Dark-01.png?v=1742865985" alt="Little Joy Logo" style="max-width: 120px; margin-bottom: 20px;">
      <h2 style="color: #618C02;">Thank you for your wholesale application!</h2>
      <p style="font-size: 16px; margin: 20px 0;">Hi <strong>${contact_name || 'there'}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6;">
        We’ve received your wholesale application and we’re reviewing your details.<br>
        Our team will get back to you shortly with next steps.<br><br>
        If you have any questions, feel free to contact us anytime.
      </p>
      <a href="https://www.littlejoy.com.au" style="display: inline-block; margin-top: 30px; padding: 12px 24px; background-color: #618C02; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Visit Our Store</a>
      <p style="margin-top: 40px; font-size: 12px; color: #999;">© 2025 Little Joy Confectionery. All rights reserved.<br>
      Contact us at <a href="mailto:info@sugarlean.com.au" style="color: #999;">info@sugarlean.com.au</a></p>
    </div>
  `;

  const mailOptions = {
    from: `"Little Joy Confectionery" <${process.env.EMAIL_USER}>`,
    to: contact_email,
    replyTo: 'info@sugarlean.com.au',
    subject: '🎉 Thanks for Applying to Little Joy Wholesale!',
    html,
  };

  await transporter.sendMail(mailOptions);
};

const sendApprovalEmail = async ({
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
}) => {
  const now = new Date().toLocaleString('en-AU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Australia/Sydney',
  });

  const approveLink = `https://lj-wholesale-backend.onrender.com/wholesale/approve?token=${token}`;
  const declineLink = `https://lj-wholesale-backend.onrender.com/wholesale/decline?token=${token}`;

  const html = `
    <div style="font-family: Poppins, sans-serif; background: #ffffff; border: 1px solid #eee; border-radius: 16px; padding: 30px; max-width: 640px; margin: 30px auto; color: #000;">
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://cdn.shopify.com/s/files/1/0935/0912/4390/files/Little_joy_Logo_Leaf-11.png?v=1741143803" alt="Little Joy Logo" style="height: 45px;">
      </div>

      <h2 style="text-align: center; color: #618C02; margin-bottom: 30px;">📥 New Wholesale Signup Received</h2>

      <table style="width: 100%; font-size: 15px; line-height: 1.8;">
        <tr><td><strong>Business Name:</strong></td><td>${business_name}</td></tr>
        <tr><td><strong>Contact Name:</strong></td><td>${contact_name}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${contact_number}</td></tr>
        <tr><td><strong>ABN:</strong></td><td>${abn}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${contact_email}</td></tr>
        <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${message || '(none)'}</td></tr>
        <tr><td><strong>Marketing Consent:</strong></td><td>${accepts_marketing ? '✅ Yes' : '❌ No'}</td></tr>
        <tr><td><strong>Terms Accepted:</strong></td><td>${terms_accepted ? '✅ Yes' : '❌ No'}</td></tr>
      </table>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${approveLink}" style="background-color: #618C02; color: white; padding: 10px 24px; text-decoration: none; font-weight: 600; border-radius: 6px; margin-right: 10px;">✔️ Approve</a>
        <a href="${declineLink}" style="background-color: #D32F2F; color: white; padding: 10px 24px; text-decoration: none; font-weight: 600; border-radius: 6px;">❌ Decline</a>
      </div>

      <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
        <p>Submitted: ${now}</p>
        <p>From website: <a href="https://www.littlejoy.com.au" style="color: #618C02;">littlejoy.com.au</a></p>
        <p>Contact: <a href="mailto:info@sugarlean.com.au" style="color: #618C02;">info@sugarlean.com.au</a></p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Little Joy Wholesale" <${process.env.EMAIL_USER}>`,
    to: 'graphics@sugarlessco.com',
    subject: '✅ Wholesale Signup Approved – Full Details',
    html,
  });
};

const sendDeclineEmail = async ({ email }) => {
  const html = `
    <div style="font-family: Poppins, sans-serif; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 30px; max-width: 600px; margin: 30px auto; color: #000; text-align: center;">
      <img src="https://cdn.shopify.com/s/files/1/0935/0912/4390/files/Little_joy_Logo_Leaf-11.png?v=1741143803" style="height: 50px; margin-bottom: 20px;">
      <h2 style="color: #618C02;">Wholesale Application Update</h2>
      <p style="font-size: 15px; line-height: 1.6;">
        Thank you for applying for a wholesale account with Little Joy Confectionery.<br><br>
        After reviewing your application, we’re unable to proceed at this time.<br><br>
        If you believe this may be a mistake or have questions, please feel free to contact us at <a href="mailto:info@sugarlean.com.au">info@sugarlean.com.au</a>.
      </p>
      <p style="margin-top: 30px;">Warm regards,<br><strong>The Little Joy Team</strong></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Little Joy Wholesale" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Little Joy Wholesale Application – Update',
    html,
  });
};

module.exports = {
  sendAdminEmail,
  sendCustomerEmail,
  sendApprovalEmail,
  sendDeclineEmail,
};
