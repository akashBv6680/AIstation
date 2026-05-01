'use strict';

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    workstationId: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'ended'],
      default: 'active',
    },
    startedAt: { type: Date, default: Date.now },
    pausedAt: { type: Date },
    endedAt: { type: Date },
    minutesAllocated: { type: Number, required: true },   // at session start
    minutesUsed: { type: Number, default: 0 },
    // Accumulates paused durations so timer is accurate
    pausedDurationMs: { type: Number, default: 0 },
    lastPauseStart: { type: Date },
  },
  { timestamps: true }
);

sessionSchema.index({ phone: 1, status: 1 });
sessionSchema.index({ workstationId: 1, status: 1 });

/**
 * Compute elapsed active seconds (excludes paused time).
 */
sessionSchema.methods.activeSeconds = function () {
  const now = Date.now();
  let elapsed = now - this.startedAt.getTime() - this.pausedDurationMs;
  if (this.status === 'paused' && this.lastPauseStart) {
    elapsed -= (now - this.lastPauseStart.getTime());
  }
  return Math.max(0, Math.floor(elapsed / 1000));
};

sessionSchema.methods.minutesUsedCalc = function () {
  return Math.ceil(this.activeSeconds() / 60);
};

module.exports = mongoose.model('Session', sessionSchema);
