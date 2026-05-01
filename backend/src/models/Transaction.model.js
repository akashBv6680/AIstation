'use strict';

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    plan: { type: String, required: true },           // starter | explorer | pro
    amount: { type: Number, required: true },          // in paise
    minutes: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    // Razorpay fields
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
    // Metadata
    notes: { type: String },
  },
  { timestamps: true }
);

transactionSchema.index({ phone: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
