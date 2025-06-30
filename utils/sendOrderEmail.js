const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { ciphers: 'SSLv3' },
});

function buildOrderEmailHTML({
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
}) {
  const orderRowsHTML = orderItems.map((item, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #c4d59f; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #c4d59f;">${item.productName}</td>
      <td style="padding: 8px; border: 1px solid #c4d59f; text-align: center;">${item.refNo}</td>
      <td style="padding: 8px; border: 1px solid #c4d59f; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border: 1px solid #c4d59f; text-align: right;">${item.unitPrice}</td>
      <td style="padding: 8px; border: 1px solid #c4d59f; text-align: right;">${item.subtotal}</td>
    </tr>
  `).join('');

  return `
  <div style="font-family: Arial, sans-serif; color: #1f4922; max-width: 700px; margin: auto; padding: 20px;">
    <h2 style="color: #4d7700; font-family: 'Comic Sans MS', cursive, sans-serif;">Customer Information</h2>
    <div style="background-color: #f4f9e4; border: 1px solid #c4d59f; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
      <p><strong>Business Name:</strong> ${businessName}</p>
      <p><strong>Contact Name:</strong> ${contactName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Customer Number:</strong> ${customerNumber}</p>
      <p><strong>Address:</strong> ${address}</p>
    </div>

    <h2 style="color: #4d7700; font-family: 'Comic Sans MS', cursive, sans-serif;">Order Summary</h2>

    <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
      <thead>
        <tr style="background-color: #618c02; color: white; font-weight: bold;">
          <th style="padding: 10px; border: 1px solid #618c02; text-align: left;" colspan="3">
            Submission Date: <span style="font-weight: 600;">${submissionDate}</span>
          </th>
          <th style="padding: 10px; border: 1px solid #618c02; text-align: right;" colspan="3">
            Submission Number: <span style="font-weight: 600;">${submissionNumber}</span>
          </th>
        </tr>
        <tr style="background-color: #f4f9e4; font-weight: 600;">
          <th style="padding: 8px; border: 1px solid #c4d59f;">#</th>
          <th style="padding: 8px; border: 1px solid #c4d59f; text-align: left;">Product</th>
          <th style="padding: 8px; border: 1px solid #c4d59f;">Ref No.</th>
          <th style="padding: 8px; border: 1px solid #c4d59f;">Qty</th>
          <th style="padding: 8px; border: 1px solid #c4d59f; text-align: right;">Unit Price</th>
          <th style="padding: 8px; border: 1px solid #c4d59f; text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${orderRowsHTML}
        <tr style="background-color: #f4f9e4; font-weight: bold;">
          <td colspan="5" style="padding: 8px; border: 1px solid #c4d59f; text-align: right;">Total:</td>
          <td style="padding: 8px; border: 1px solid #c4d59f; text-align: right;">${total}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin-top: 30px; font-size: 13px; color: #555;">
      If you need to make any changes to your order, please contact us at 
      <a href="mailto:info@sugarlean.com.au" style="color: #618c02; text-decoration: none;">info@sugarlean.com.au</a> as soon as possible.
    </p>

    <footer style="margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; text-align: center;">
      &copy; 2025 Little Joy Confectionery. All rights reserved.
    </footer>
  </div>
  `;
}

async function sendOrderEmail(data) {
  const html = buildOrderEmailHTML(data);

  const mailOptions = {
    from: `"Little Joy Wholesale" <${process.env.EMAIL_USER}>`,
    to: data.to,
    subject: data.subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOrderEmail };
