'use strict';

const mongoose = require('mongoose');

const workstationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true }, // e.g. "WS-01"
    label: { type: String, trim: true },
    location: { type: String, trim: true },  // branch/room name
    status: {
      type: String,
      enum: ['free', 'busy', 'maintenance'],
      default: 'free',
    },
    currentSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
    tools: [{ type: String }],  // tools available at this station
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workstation', workstationSchema);
