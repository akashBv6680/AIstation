'use strict';

const User = require('../models/User.model');
const Workstation = require('../models/Workstation.model');

const DEFAULT_WORKSTATIONS = [
  { id: 'WS-01', label: 'Workstation 1', location: 'Main Floor', tools: ['ChatGPT Plus', 'Claude Pro', 'Gemini Ultra', 'Midjourney'] },
  { id: 'WS-02', label: 'Workstation 2', location: 'Main Floor', tools: ['ChatGPT Plus', 'Claude Pro', 'Sora', 'Midjourney'] },
  { id: 'WS-03', label: 'Workstation 3', location: 'Main Floor', tools: ['Claude Pro', 'Gemini Ultra', 'Runway ML'] },
  { id: 'WS-04', label: 'Workstation 4', location: 'Private Pod', tools: ['ChatGPT Plus', 'Claude Pro', 'Cursor Pro', 'Windsurf'] },
  { id: 'WS-05', label: 'Workstation 5', location: 'Private Pod', tools: ['ChatGPT Plus', 'Copilot', 'Cursor Pro'] },
];

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@aistation.in';
  const password = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe@123';

  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({ email, passwordHash: password, role: 'admin', name: 'Admin' });
    console.log(`✅ Admin user created: ${email}  (change the password immediately!)`);
  }

  // Seed default workstations if none exist
  const wsCount = await Workstation.countDocuments();
  if (wsCount === 0) {
    await Workstation.insertMany(DEFAULT_WORKSTATIONS);
    console.log(`✅ ${DEFAULT_WORKSTATIONS.length} default workstations seeded.`);
  }
}

module.exports = { seedAdmin };
