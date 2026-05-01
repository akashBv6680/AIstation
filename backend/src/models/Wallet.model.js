'use strict';

const mongoose = require('mongoose');

/**
 * Wallet — keyed by phone number.
 * minutesBalance tracks remaining credit (1 credit = 1 minute).
 * Credits never expire (business policy). Override if needed.
 */
const walletSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone must be 10 digits'],
    },
    minutesBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMinutesPurchased: { type: Number, default: 0 },
    totalMinutesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

walletSchema.methods.credit = async function (minutes) {
  this.minutesBalance += minutes;
  this.totalMinutesPurchased += minutes;
  return this.save();
};

walletSchema.methods.debit = async function (minutes) {
  if (this.minutesBalance < minutes) throw new Error('Insufficient credits');
  this.minutesBalance -= minutes;
  this.totalMinutesUsed += minutes;
  return this.save();
};

module.exports = mongoose.model('Wallet', walletSchema);
