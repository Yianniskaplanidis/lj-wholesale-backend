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
  const lightGreenBg = '#f4fbe1';
  const lightBorder = '#d3e3bc';

  const productRows = order.products.map((p, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#f9fbe9' : 'white'};">
      <td style="padding:8px; border: 1px solid ${lightBorder}; text-align:center;">${i + 1}</td>
      <td style="padding:8px; border: 1px solid ${lightBorder};">${p.name}</td>
      <td style="padding:8px; border: 1px solid ${lightBorder}; text-align:center;">${p.refNo}</td>
      <td style="padding:8px; border: 1px solid ${lightBorder}; text-align:center;">${p.qty}</td>
      <td style="padding:8px; border: 1px solid ${lightBorder}; text-align:right;">${formatCurrency(p.unitPrice)}</td>
      <td style="padding:8px; border: 1px solid ${lightBorder}; text-align:right;">${formatCurrency(p.qty * p.unitPrice)}</td>
    </tr>
  `).join('');

  return `
  <div style="font-family: Arial, sans-serif; color: #3c3c3c; padding: 20px; background-color: #fafafa;">
    <h2 style="color: ${mainGreen}; font-family: 'Comic Sans MS', cursive, sans-serif;">Customer Information</h2>
    <div style="background-color: #f9fbe9; border: 1px solid ${lightBorder}; border-radius: 8px; padding: 15px; max-width: 600px;">
      <p><strong>Business Name:</strong> ${order.businessName}</p>
      <p><strong>Contact Name:</strong> ${order.contactName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Customer Number:</strong> ${order.customerNumber}</p>
      <p><strong>Address:</strong> ${order.address}</p>
    </div>

    <h2 style="color: ${mainGreen}; font-family: 'Comic Sans MS', cursive, sans-serif; margin-top: 30px;">Order Summary</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 700px;">
      <thead>
        <tr style="background-color: ${mainGreen}; color: white;">
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: left;">Submission Date: ${order.submissionDate}</th>
          <th style="padding: 12px; border: 1px solid ${lightBorder}; text-align: right;">Submission Number: ${order.submissionNumber}</th>
        </tr>
        <tr style="background-color: ${lightGreenBg}; color: #3c3c3c; font-weight: bold;">
          <th style="padding: 8px; border: 1px solid ${lightBorder}; width: 5%;">#</th>
          <th style="padding: 8px; border: 1px solid ${lightBorder}; width: 45%;">Product</th>
          <th style="padding: 8px; border: 1px solid ${lightBorder}; width: 15%;">Ref No.</th>
          <th style="padding: 8px; border: 1px solid ${lightBorder}; width: 10%;">Qty</th>
          <th style="padding: 8px; border: 1px solid ${lightBorder}; width: 15%;">Unit Price</th>
          <th style="padding: 8px; border: 1px solid ${lightBorder}; width: 15%;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
      <tfoot>
        <tr style="background-color: ${lightGreenBg}; font-weight: bold;">
          <td colspan="5" style="padding: 10px; border: 1px solid ${lightBorder}; text-align: right;">Total:</td>
          <td style="padding: 10px; border: 1px solid ${lightBorder}; text-align: right;">${formatCurrency(order.total)}</td>
        </tr>
      </tfoot>
    </table>
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
