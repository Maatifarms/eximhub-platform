const db = require('./db');
const bcrypt = require('bcryptjs');

const usersToCreate = [
  { name: 'Program 1 Tester', email: 'test1@eximhub.pro', password: 'Eximhub@2026!', tier: 'Program 1', points: 500 },
  { name: 'Program 2 Tester', email: 'test2@eximhub.pro', password: 'Eximhub@2026!', tier: 'Program 2', points: 1200 },
  { name: 'Enterprise Tester', email: 'enterprise@eximhub.pro', password: 'Eximhub@2026!', tier: 'Enterprise', points: 10000 },
  { name: 'Super Admin', email: 'test@eximhub.pro', password: 'Eximhub@2026!', tier: 'Admin', points: 999999 },
];

async function setup() {
  for (const user of usersToCreate) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    try {
      await db.execute(
        `INSERT INTO users (name, email, password_hash, subscription_tier, points_balance, role) 
         VALUES (?, ?, ?, ?, ?, 'user') 
         ON DUPLICATE KEY UPDATE password_hash = ?, subscription_tier = ?, points_balance = ?`,
        [user.name, user.email, hashedPassword, user.tier, user.points, hashedPassword, user.tier, user.points]
      );
      console.log(`✅ User created/updated: ${user.email}`);
    } catch (e) {
      console.error(`❌ Failed to create user ${user.email}:`, e.message);
    }
  }
  process.exit(0);
}

setup();
