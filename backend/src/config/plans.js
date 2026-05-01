'use strict';

// All amounts in paise (1 INR = 100 paise) for Razorpay compatibility.
// Override via .env if needed.

const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    amount: parseInt(process.env.PLAN_STARTER_AMOUNT || '15000', 10),   // ₹150
    minutes: parseInt(process.env.PLAN_STARTER_MINUTES || '100', 10),
    description: '100 minutes on any AI tool',
  },
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    amount: parseInt(process.env.PLAN_EXPLORER_AMOUNT || '50000', 10),  // ₹500
    minutes: parseInt(process.env.PLAN_EXPLORER_MINUTES || '360', 10),
    description: '~6 hours + cloud save',
  },
  pro: {
    id: 'pro',
    name: 'Pro Pass',
    amount: parseInt(process.env.PLAN_PRO_AMOUNT || '120000', 10),      // ₹1200
    minutes: parseInt(process.env.PLAN_PRO_MINUTES || '1200', 10),
    description: '~20 hours + priority seat',
  },
};

function getPlan(id) {
  return PLANS[id] || null;
}

module.exports = { PLANS, getPlan };
