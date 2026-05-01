'use strict';

const Session = require('../models/Session.model');
const Wallet = require('../models/Wallet.model');
const Workstation = require('../models/Workstation.model');

async function startSession(req, res) {
  const { phone, workstationId } = req.body;

  // Check for existing active session on this workstation
  const existing = await Session.findOne({ workstationId, status: { $in: ['active', 'paused'] } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Workstation already has an active session.' });
  }

  // Check wallet balance
  const wallet = await Wallet.findOne({ phone });
  if (!wallet || wallet.minutesBalance <= 0) {
    return res.status(402).json({ success: false, message: 'Insufficient credits. Please top up.' });
  }

  // Create session
  const session = await Session.create({
    phone,
    workstationId,
    minutesAllocated: wallet.minutesBalance,
    status: 'active',
  });

  // Mark workstation busy
  await Workstation.findOneAndUpdate(
    { id: workstationId },
    { status: 'busy', currentSessionId: session._id },
    { upsert: true }
  );

  return res.status(201).json({
    success: true,
    sessionId: session._id,
    minutesRemaining: wallet.minutesBalance,
    workstationId,
    startedAt: session.startedAt,
  });
}

async function pauseSession(req, res) {
  const session = await Session.findById(req.params.id);
  if (!session || session.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Session not active.' });
  }

  session.status = 'paused';
  session.pausedAt = new Date();
  session.lastPauseStart = new Date();
  await session.save();

  return res.json({ success: true, message: 'Session paused.' });
}

async function resumeSession(req, res) {
  const session = await Session.findById(req.params.id);
  if (!session || session.status !== 'paused') {
    return res.status(400).json({ success: false, message: 'Session not paused.' });
  }

  // Accumulate paused duration
  if (session.lastPauseStart) {
    session.pausedDurationMs += Date.now() - session.lastPauseStart.getTime();
    session.lastPauseStart = null;
  }

  session.status = 'active';
  session.pausedAt = null;
  await session.save();

  return res.json({ success: true, message: 'Session resumed.' });
}

async function endSession(req, res) {
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }
  if (session.status === 'ended') {
    return res.status(400).json({ success: false, message: 'Session already ended.' });
  }

  // Accumulate any final pause
  if (session.status === 'paused' && session.lastPauseStart) {
    session.pausedDurationMs += Date.now() - session.lastPauseStart.getTime();
  }

  const minutesUsed = session.minutesUsedCalc();
  session.status = 'ended';
  session.endedAt = new Date();
  session.minutesUsed = minutesUsed;
  await session.save();

  // Debit wallet (best-effort — never block session end)
  try {
    const wallet = await Wallet.findOne({ phone: session.phone });
    if (wallet) await wallet.debit(Math.min(minutesUsed, wallet.minutesBalance));
  } catch (err) {
    console.warn('Wallet debit failed:', err.message);
  }

  // Free workstation
  await Workstation.findOneAndUpdate(
    { id: session.workstationId },
    { status: 'free', currentSessionId: null }
  );

  return res.json({
    success: true,
    sessionId: session._id,
    minutesUsed,
    endedAt: session.endedAt,
  });
}

async function sessionStatus(req, res) {
  const session = await Session.findById(req.params.id).lean();
  if (!session) return res.status(404).json({ success: false, message: 'Not found' });

  const wallet = await Wallet.findOne({ phone: session.phone }).lean();

  return res.json({
    success: true,
    sessionId: session._id,
    status: session.status,
    minutesRemaining: wallet?.minutesBalance ?? 0,
    minutesAllocated: session.minutesAllocated,
    minutesUsed: session.minutesUsed,
    startedAt: session.startedAt,
  });
}

async function listSessions(req, res) {
  const { workstationId, status, limit = 50 } = req.query;
  const filter = {};
  if (workstationId) filter.workstationId = workstationId;
  if (status) filter.status = status;

  const sessions = await Session.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  return res.json({ success: true, sessions });
}

module.exports = { startSession, pauseSession, resumeSession, endSession, sessionStatus, listSessions };
