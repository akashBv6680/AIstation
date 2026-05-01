'use strict';

require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./src/config/database');
const { seedAdmin } = require('./src/utils/seed');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`\n🚀 AI Station API running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MongoDB     : ${process.env.MONGODB_URI}\n`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
