'use strict';

const nodemailer = require('nodemailer');

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // Dev fallback — log to console only
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendMail(opts) {
  const transport = createTransport();
  if (!transport) {
    console.log('[EMAIL - dev mode, not sent]', opts.subject, '→', opts.to);
    return;
  }
  return transport.sendMail({ from: process.env.EMAIL_FROM, ...opts });
}

async function sendContactNotification({ name, email, phone, message, interest }) {
  return sendMail({
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `[AI Station] New contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nInterest: ${interest}\n\n${message}`,
    html: `
      <h2>New enquiry — AI Station</h2>
      <table style="font-family:sans-serif;font-size:14px">
        <tr><td><b>Name</b></td><td>${name}</td></tr>
        <tr><td><b>Email</b></td><td>${email}</td></tr>
        <tr><td><b>Phone</b></td><td>${phone || '—'}</td></tr>
        <tr><td><b>Interest</b></td><td>${interest}</td></tr>
      </table>
      <p style="margin-top:16px">${message}</p>
    `,
  });
}

async function sendContactAck({ name, email }) {
  return sendMail({
    to: email,
    subject: "Thanks for reaching out — AI Station",
    text: `Hi ${name},\n\nWe've received your message and will get back to you within 24 hours.\n\n— AI Station Team`,
    html: `
      <div style="font-family:sans-serif;max-width:480px">
        <h2>Thanks, ${name}! 👋</h2>
        <p>We've received your message and will get back to you within <b>24 hours</b>.</p>
        <p style="color:#888;font-size:13px">— AI Station Team</p>
      </div>
    `,
  });
}

async function sendPaymentReceipt({ phone, plan, amount, minutes }) {
  // Phone-based receipt — can extend to email if user provides one during payment
  console.log(`[RECEIPT] Phone: ${phone} | Plan: ${plan} | ₹${amount / 100} | ${minutes} min`);
}

module.exports = { sendMail, sendContactNotification, sendContactAck, sendPaymentReceipt };
