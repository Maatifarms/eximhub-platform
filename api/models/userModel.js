const db = require('../db');

async function findByEmail(email) {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function createUser({
  name = null,
  email,
  passwordHash,
  role = 'user',
  phone = null,
  country = null,
  companyName = null,
  subscriptionTier = 'trial',
  pointsBalance = 100,
  googleId = null,
}) {
  const [result] = await db.execute(
    `INSERT INTO users (
      name, email, password_hash, role, phone, country, company_name, subscription_tier, points_balance, google_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, phone, country, companyName, subscriptionTier, pointsBalance, googleId]
  );

  return findById(result.insertId);
}

async function updatePassword(userId, passwordHash) {
  await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

async function linkGoogleAccount(userId, googleId) {
  await db.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, userId]);
  return findById(userId);
}

async function findByGoogleId(googleId) {
  const [rows] = await db.execute('SELECT * FROM users WHERE google_id = ? LIMIT 1', [googleId]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  findByEmail,
  findByGoogleId,
  findById,
  linkGoogleAccount,
  updatePassword,
};
