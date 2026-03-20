const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); // Use bcryptjs as found on VPS
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const apiEnvPath = '/root/eximhub-platform/api/.env';

async function run() {
  // 1. Update SMTP config in .env if missing
  const envContent = fs.readFileSync(apiEnvPath, 'utf8');
  if (!envContent.includes('SMTP_HOST')) {
    console.log('Appending SMTP config to .env...');
    const smtpConfig = `
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@eximhub.pro
SMTP_PASS=Passgmail@1
SMTP_FROM=info@eximhub.pro
SALES_EMAIL=rupesh2510@gmail.com
`;
    fs.appendFileSync(apiEnvPath, smtpConfig);
  }

  // Reload dotenv to pick up those new variables
  dotenv.config({ path: apiEnvPath });

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'eximhub_app',
    password: process.env.DB_PASS || 'EximhubDb@2026!',
    database: process.env.DB_NAME || 'eximhub_db'
  });

  const email = 'rupesh2510@gmail.com';
  const name = 'Rupesh Admin';
  const pass = 'Eximhub@2026!';
  const hashedPassword = await bcrypt.hash(pass, 10);

  console.log(`Checking for admin: ${email}...`);
  const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    console.log('User found, upgrading...');
    await connection.execute('UPDATE users SET role = "admin", subscription_tier = "Admin", points_balance = 999999, password_hash = ? WHERE email = ?', [hashedPassword, email]);
    console.log('ADMIN_UPDATED');
  } else {
    console.log('Creating new admin...');
    await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, subscription_tier, points_balance) VALUES (?, ?, ?, "admin", "Admin", 999999)',
      [name, email, hashedPassword]
    );
    console.log('ADMIN_CREATED');
  }

  const testEmail = 'test@eximhub.pro';
  await connection.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, testEmail]);
  console.log('TEST_PASS_RESET');

  await connection.close();
}

run().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
