require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' : 'NOT SET');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

// Simple in-memory counter (reset on server restart)
// Replace this with a DB or file storage for persistence
const submissionCounters = {};

function formatCurrency(num) {
  if (typeof num !== 'number' || isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

function formatSubmissionNumber(customerNumber, increment) {
  const prefix = customerNumber && customerNumber.toUpperCase().startsWith('CUS')
    ? customerNumber.toUpperCase()
    : `CUS${(customerNumber || '00000').toUpperCase()}`;
  return `${prefix}-${String(increment).padStart(6, '0')}`;
}

function generateOrderEmailHTML(order) {
  const mainGreen = '#618C02';
  const lightGreen = '#f4fbe1';
  const border = '#d3e3bc';

  const submissionNumber = order.submissionNumber || 'Undefined-000001';
  const submissionDate = order.submissionDate || new Date().toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  let total = 0;
  const productRows = order.products.map((p, i) => {
    const qty = p.qty || 0;
    const unit = p.unitPrice || p.unit_price || 0;
    const subtotal = qty * unit;
    total += subtotal;

    return `
      <tr style="background-color: white;">
        <td style="padding:12px; border:1px solid ${border}; text-align:center;">${i + 1}</td>
        <td style="padding:12px; border:1px solid ${border};">${p.name}</td>
        <td style="padding:12px; border:1px solid ${border}; text-align:center;">${p.refNo}</td>
        <td style="padding:12px; border:1px solid ${border}; text-align:center;">${qty}</td>
        <td style="padding:12px; border:1px solid ${border}; text-align:right;">${formatCurrency(unit)}</td>
        <td style="padding:12px; border:1px solid ${border}; text-align:right;">${formatCurrency(subtotal)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: Poppins, sans-serif; padding: 30px; background: #fff;">
      <div style="text-align:center; margin-bottom: 24px;">
        <img src="https://cdn.shopify.com/s/files/1/0935/0912/4390/files/Little_joy_Logo_Dark-01.png?v=1742865985" style="max-width:160px;" alt="Little Joy Logo">
      </div>

      <h2 style="color:${mainGreen}; font-size: 20px; margin-bottom: 12px;">Customer Information</h2>
      <div style="background-color:${lightGreen}; border:1px solid ${border}; border-radius: 8px; padding:16px; margin-bottom: 30px;">
        <p><strong>Business Name:</strong> ${order.businessName}</p>
        <p><strong>Contact Name:</strong> ${order.contactName}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Customer Number:</strong> ${order.customerNumber}</p>
        <p><strong>Address:</strong> ${order.address}</p>
      </div>

      <h2 style="color:${mainGreen}; font-size: 20px; margin-bottom: 12px;">Order Summary</h2>
      <table style="width: 100%; border-collapse: collapse; border:1px solid ${border};">
        <thead>
          <tr style="background-color: ${mainGreen}; color: #fff;">
            <th colspan="3" style="padding: 14px; text-align: left;">Submission Date: ${submissionDate}</th>
            <th colspan="3" style="padding: 14px; text-align: right;">Submission Number: ${submissionNumber}</th>
          </tr>
          <tr style="background-color: ${lightGreen}; color: #333;">
            <th style="padding:10px; border:1px solid ${border}; text-align:center;">#</th>
            <th style="padding:10px; border:1px solid ${border}; text-align:left;">Product</th>
            <th style="padding:10px; border:1px solid ${border}; text-align:center;">Ref No.</th>
            <th style="padding:10px; border:1px solid ${border}; text-align:center;">Qty</th>
            <th style="padding:10px; border:1px solid ${border}; text-align:right;">Unit Price</th>
            <th style="padding:10px; border:1px solid ${border}; text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
        <tfoot>
          <tr style="background-color: ${lightGreen}; font-weight: bold;">
            <td colspan="5" style="padding:14px; border:1px solid ${border}; text-align:right;"><strong>Total:</strong></td>
            <td style="padding:14px; border:1px solid ${border}; text-align:right;"><strong>${formatCurrency(total)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <!-- Removed thank you message as requested -->
    </div>
  `;
}

async function sendOrderEmail({ order, to }) {
  if (!to || to.length === 0) throw new Error('Recipient email(s) required');
  if (!order || !order.products) throw new Error('Order data is invalid or missing');

  // Generate submission number increment per customerNumber
  const customerNumber = order.customerNumber || 'UNKNOWN';
  submissionCounters[customerNumber] = (submissionCounters[customerNumber] || 0) + 1;
  const submissionNumber = formatSubmissionNumber(customerNumber, submissionCounters[customerNumber]);

  // Attach submission info to order
  order.submissionNumber = submissionNumber;
  order.submissionDate = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' });

  try {
    const html = generateOrderEmailHTML(order);

    for (const recipient of to) {
      await transporter.sendMail({
        from: `"Little Joy Wholesale" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `Little Joy Wholesale Order Confirmation - ${submissionNumber}`,
        html,
      });
      console.log(`✅ Email sent to ${recipient}`);
    }
  } catch (err) {
    console.error('❌ Failed to send order emails:', err);
    throw new Error('Failed to send order emails');
  }
}

module.exports = {
  sendOrderEmail,
  generateOrderEmailHTML,
};
