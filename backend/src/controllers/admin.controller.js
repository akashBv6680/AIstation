'use strict';

const Transaction = require('../models/Transaction.model');
const Session = require('../models/Session.model');
const Contact = require('../models/Contact.model');
const Workstation = require('../models/Workstation.model');

async function getDashboard(req, res) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    activeSessions,
    txToday,
    unreadContacts,
    recentTransactions,
  ] = await Promise.all([
    Session.countDocuments({ status: { $in: ['active', 'paused'] } }),
    Transaction.find({ status: 'paid', createdAt: { $gte: todayStart } }).lean(),
    Contact.countDocuments({ read: false }),
    Transaction.find({ status: 'paid' }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const revenueToday = txToday.reduce((sum, t) => sum + t.amount, 0) / 100; // paise → ₹
  const minutesSoldToday = txToday.reduce((sum, t) => sum + t.minutes, 0);

  return res.json({
    success: true,
    activeSessions,
    revenueToday,
    txToday: txToday.length,
    minutesSoldToday,
    unreadContacts,
    recentTransactions,
  });
}

async function getWorkstations(req, res) {
  const workstations = await Workstation.find().sort({ id: 1 }).lean();

  // Enrich with active session phone if busy
  const enriched = await Promise.all(
    workstations.map(async (ws) => {
      if (ws.currentSessionId) {
        const sess = await Session.findById(ws.currentSessionId).lean();
        return { ...ws, phone: sess?.phone, remainingMin: sess?.minutesAllocated - sess?.minutesUsed };
      }
      return ws;
    })
  );

  return res.json({ success: true, workstations: enriched });
}

async function getTransactions(req, res) {
  const { page = 1, limit = 50, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Transaction.countDocuments(filter);

  return res.json({ success: true, transactions, total, page: Number(page) });
}

async function getContacts(req, res) {
  const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100).lean();
  // Mark as read
  await Contact.updateMany({ read: false }, { read: true });
  return res.json({ success: true, contacts });
}

async function seedWorkstations(req, res) {
  const { count = 5, location = 'Main Floor' } = req.body;
  const ops = [];
  for (let i = 1; i <= count; i++) {
    const id = `WS-${String(i).padStart(2, '0')}`;
    ops.push({
      updateOne: {
        filter: { id },
        update: {
          $setOnInsert: {
            id,
            label: `Workstation ${i}`,
            location,
            status: 'free',
            tools: ['ChatGPT Plus', 'Claude Pro', 'Gemini Ultra', 'Midjourney'],
          },
        },
        upsert: true,
      },
    });
  }
  await Workstation.bulkWrite(ops);
  return res.json({ success: true, message: `${count} workstations ensured.` });
}

module.exports = { getDashboard, getWorkstations, getTransactions, getContacts, seedWorkstations };
