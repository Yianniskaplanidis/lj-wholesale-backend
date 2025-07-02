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
  const headerGreen = '#648100';  // darker green like example
  const lightGreenBg = '#f4fbe1';
  const lightBorder = '#d3e3bc';

  const productRows = order.products.map((p, i) => `
  <tr style="background-color: white;">
    <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:center; font-family: 'Poppins', sans-serif;">${i + 1}</td>
    <td style="padding:12px; border: 1px solid ${lightBorder}; font-family: 'Poppins', sans-serif;">${p.name}</td>
    <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:center; font-family: 'Poppins', sans-serif;">${p.refNo}</td>
    <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:center; font-family: 'Poppins', sans-serif;">${p.qty}</td>
    <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:right; font-family: 'Poppins', sans-serif;">${formatCurrency(p.unitPrice)}</td>
    <td style="padding:12px; border: 1px solid ${lightBorder}; text-align:right; font-family: 'Poppins', sans-serif;">${formatCurrency(p.qty * p.unitPrice)}</td>
  </tr>
`).join('');


  return `
  <div style="font-family: 'Poppins', sans-serif; color: #3c3c3c; padding: 25px; background-color: #fafafa; max-width: 700px; margin: auto;">
    <h2 style="color: ${mainGreen}; font-weight: 700; font-size: 24px; margin-bottom: 20px;">Customer Information</h2>
    <div style="background-color: #f9fbe9; border: 1px solid ${lightBorder}; border-radius: 8px; padding: 20px;">
      <p><strong>Business Name:</strong> ${order.businessName}</p>
      <p><strong>Contact Name:</strong> ${order.contactName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Customer Number:</strong> ${order.customerNumber}</p>
      <p><strong>Address:</strong> ${order.address}</p>
    </div>

    <h2 style="color: ${mainGreen}; font-weight: 700; font-size: 24px; margin: 40px 0 20px;">Order Summary</h2>
    <table style="border-collapse: collapse; width: 100%; border: 1px solid ${lightBorder};">
      <thead>
  <tr>
    <th style="background-color: #618C02; color: white; padding: 16px; font-weight: 700; width: 50%; border: 1px solid #d3e3bc; text-align: left; vertical-align: middle;">
      Submission Date: <strong>02 July 2025</strong>
    </th>
    <th style="background-color: #618C02; color: white; padding: 16px; font-weight: 700; width: 50%; border: 1px solid #d3e3bc; text-align: right; vertical-align: middle;">
      Submission Number: <strong>CUS123456-000001</strong>
    </th>
  </tr>
  <tr style="background-color: #f4fbe1; font-weight: 700; font-size: 14px; color: #3c3c3c;">
    <th style="padding: 12px; border: 1px solid #d3e3bc; text-align: center; width: 5%;">#</th>
    <th style="padding: 12px; border: 1px solid #d3e3bc; text-align: left; width: 45%;">Product</th>
    <th style="padding: 12px; border: 1px solid #d3e3bc; text-align: center; width: 15%;">Ref No.</th>
    <th style="padding: 12px; border: 1px solid #d3e3bc; text-align: center; width: 10%;">Qty</th>
    <th style="padding: 12px; border: 1px solid #d3e3bc; text-align: right; width: 15%;">Unit Price</th>
    <th style="padding: 12px; border: 1px solid #d3e3bc; text-align: right; width: 15%;">Subtotal</th>
  </tr>
</thead>

      <tbody>
        ${productRows}
      </tbody>
      <tfoot>
        <tr style="background-color: ${lightGreenBg}; font-weight: 700; font-size: 14px;">
          <td colspan="5" style="padding: 14px; border: 1px solid ${lightBorder}; text-align: right;">Total:</td>
          <td style="padding: 14px; border: 1px solid ${lightBorder}; text-align: right;">${formatCurrency(order.total)}</td>
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
