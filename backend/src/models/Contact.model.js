'use strict';

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    interest: {
      type: String,
      enum: ['individual', 'team', 'franchise', 'partnership', 'other'],
      default: 'individual',
    },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    notes: { type: String },  // internal admin notes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
