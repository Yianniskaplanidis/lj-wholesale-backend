// utils/sendOrderEmail.js
require('dotenv').config(); // ensure .env is loaded here or in your main server.js before this module loads
const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' : 'NOT SET');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false, // use STARTTLS for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

function formatCurrency(num) {
  return `$${num.toFixed(2)}`;
}

function generateOrderEmailHTML(order) {
  const mainGreen = '#618C02';
  const lightGreenBg = '#E1EDC1';  // your brand light green
  const lightBorder = '#d3e3bc';

  const productRows = order.products.map((p, i) => `
    <tr style="background-color: white;">
      <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:center;">${i + 1}</td>
      <td style="padding:12px; border: 1px solid ${lightBorder};">${p.name}</td>
      <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:center;">${p.refNo}</td>
      <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:center;">${p.qty}</td>
      <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:right;">${formatCurrency(p.unitPrice)}</td>
      <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:right;">${formatCurrency(p.qty * p.unitPrice)}</td>
    </tr>
  `).join('');

  return `
  <div style="font-family: 'Poppins', sans-serif; color: #3c3c3c; padding: 25px; background-color: #fafafa; max-width: 700px; margin: auto;">

    <!-- LOGO -->
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://www.littlejoy.com.au/cdn/shop/files/littlejoy-logo.png" alt="Little Joy Logo" style="max-width: 160px; height: auto;">
    </div>

    <!-- CUSTOMER INFO -->
    <h2 style="color: ${mainGreen}; font-weight: 700; font-size: 24px; margin-bottom: 20px;">Customer Information</h2>
    <div style="background-color: #f9fbe9; border: 1px solid ${lightBorder}; border-radius: 8px; padding: 20px;">
      <p><strong>Business Name:</strong> ${order.businessName}</p>
      <p><strong>Contact Name:</strong> ${order.contactName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Customer Number:</strong> ${order.customerNumber}</p>
      <p><strong>Address:</strong> ${order.address}</p>
    </div>

    <!-- ORDER SUMMARY -->
    <h2 style="color: ${mainGreen}; font-weight: 700; font-size: 24px; margin: 40px 0 20px;">Little Joy Wholesale Order Summary</h2>
    <table style="border-collapse: collapse; width: 100%; border: 1px solid ${lightBorder};">
      <thead>
        <tr>
          <th colspan="3" style="background-color: ${mainGreen}; color: white; padding: 16px; text-align: left; font-weight: 600;">
            Submission Date: <strong>${order.submissionDate}</strong>
          </th>
          <th colspan="3" style="background-color: ${mainGreen}; color: white; padding: 16px; text-align: right; font-weight: 600; font-size: 13px;">
            Submission Number: <strong>${order.submissionNumber}</strong>
          </th>
        </tr>
        <tr style="background-color: ${lightGreenBg}; color: #3c3c3c; font-weight: 600; font-size: 14px;">
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: center;">#</th>
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: left;">Product</th>
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: center;">Ref No.</th>
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: center;">Qty</th>
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: right;">Unit Price</th>
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
      <tfoot>
        <tr style="background-color: ${lightGreenBg}; font-weight: 700;">
          <td colspan="5" style="padding: 14px; border: 1px solid ${lightBorder}; text-align: right;">Total:</td>
          <td style="padding: 14px; border: 1px solid ${lightBorder}; text-align: right;">${formatCurrency(order.total)}</td>
        </tr>
      </tfoot>
    </table>

    <p style="margin-top: 30px; text-align: center; font-style: italic; color: #666;">Thank you for your order!</p>
  </div>
  `;
}



async function sendOrderEmail({ order, to }) {
  if (!to || to.length === 0) throw new Error('Recipient email(s) required');
  if (!order) throw new Error('Order data required');

  const html = generateOrderEmailHTML(order);

  for (const recipient of to) {
    try {
      await transporter.sendMail({
        from: `"Little Joy Wholesale" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `Wholesale Order Confirmation - ${order.submissionNumber}`,
        html,
      });
      console.log(`Order email sent to ${recipient}`);
    } catch (err) {
      console.error(`Failed to send order email to ${recipient}:`, err);
      throw err;
    }
  }
}

module.exports = { sendOrderEmail, generateOrderEmailHTML };
