'use strict';

const crypto = require('crypto');
const razorpayService = require('../services/razorpay.service');
const Wallet = require('../models/Wallet.model');
const Transaction = require('../models/Transaction.model');
const { getPlan } = require('../config/plans');

async function createOrder(req, res) {
  const { planId, phone } = req.body;

  const plan = getPlan(planId);
  if (!plan) {
    return res.status(400).json({ success: false, message: `Unknown plan: ${planId}` });
  }

  // Create a pending transaction record first
  const tx = await Transaction.create({
    phone,
    plan: plan.id,
    amount: plan.amount,
    minutes: plan.minutes,
    status: 'pending',
  });

  // Create Razorpay order
  const order = await razorpayService.createOrder({
    amount: plan.amount,
    currency: 'INR',
    receipt: tx._id.toString(),
    notes: { phone, plan: plan.id },
  });

  // Save orderId to transaction
  tx.orderId = order.id;
  await tx.save();

  return res.json({
    success: true,
    orderId: order.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: plan.amount,
    currency: 'INR',
    plan: plan.name,
    txId: tx._id,
  });
}

async function verifyPayment(req, res) {
  const { orderId, paymentId, signature, phone } = req.body;

  // Verify Razorpay signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dev_secret')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSig !== signature && process.env.NODE_ENV === 'production') {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Find pending transaction
  const tx = await Transaction.findOne({ orderId, status: 'pending' });
  if (!tx) {
    return res.status(404).json({ success: false, message: 'Transaction not found or already processed' });
  }

  // Mark paid
  tx.status = 'paid';
  tx.paymentId = paymentId;
  tx.signature = signature;
  await tx.save();

  // Credit wallet
  let wallet = await Wallet.findOne({ phone });
  if (!wallet) wallet = new Wallet({ phone, minutesBalance: 0 });
  await wallet.credit(tx.minutes);

  return res.json({
    success: true,
    message: `${tx.minutes} minutes added to your wallet.`,
    minutesAdded: tx.minutes,
    minutesBalance: wallet.minutesBalance,
  });
}

async function getBalance(req, res) {
  const { phone } = req.params;
  const wallet = await Wallet.findOne({ phone }).lean();

  if (!wallet) {
    return res.json({ success: true, phone, minutesRemaining: 0 });
  }

  return res.json({
    success: true,
    phone,
    minutesRemaining: wallet.minutesBalance,
    totalPurchased: wallet.totalMinutesPurchased,
    totalUsed: wallet.totalMinutesUsed,
  });
}

module.exports = { createOrder, verifyPayment, getBalance };
