const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'eximhub_db'
  });

  const email = 'rupesh2510@gmail.com';
  const name = 'Admin Rupesh';
  const pass = 'Eximhub@2026!';
  const hashedPassword = await bcrypt.hash(pass, 10);

  console.log(`Checking for user: ${email}...`);
  const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    console.log(`User ${email} found, updating to admin...`);
    await connection.execute('UPDATE users SET role = "admin", subscription_tier = "Admin", points_balance = 999999, password_hash = ? WHERE email = ?', [hashedPassword, email]);
    console.log('ADMIN_UPDATED');
  } else {
    console.log(`User ${email} NOT found, creating new admin...`);
    await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, subscription_tier, points_balance) VALUES (?, ?, ?, "admin", "Admin", 999999)',
      [name, email, hashedPassword]
    );
    console.log('ADMIN_CREATED');
  }

  const testEmail = 'test@eximhub.pro';
  console.log(`Resetting password for: ${testEmail}...`);
  await connection.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, testEmail]);
  console.log('TEST_PASS_RESET');

  await connection.close();
}

run().catch(err => {
  console.error('SCRIPT_FAILED:', err);
  process.exit(1);
});
