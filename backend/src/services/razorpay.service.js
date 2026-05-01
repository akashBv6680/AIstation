'use strict';

/**
 * Razorpay service wrapper.
 * In development (no keys set), returns a mock order so the kiosk can still
 * be tested without real credentials.
 */

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {
  Razorpay = null;
}

function getInstance() {
  if (
    !Razorpay ||
    !process.env.RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_XXXX')
  ) {
    return null; // dev / unconfigured
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function createOrder({ amount, currency = 'INR', receipt, notes }) {
  const rzp = getInstance();

  if (!rzp) {
    // Mock order for local development
    console.warn('⚠️  Razorpay not configured — returning mock order.');
    return {
      id: `mock_order_${Date.now()}`,
      amount,
      currency,
      receipt,
      status: 'created',
    };
  }

  return rzp.orders.create({ amount, currency, receipt, notes });
}

async function fetchPayment(paymentId) {
  const rzp = getInstance();
  if (!rzp) return null;
  return rzp.payments.fetch(paymentId);
}

module.exports = { createOrder, fetchPayment };
