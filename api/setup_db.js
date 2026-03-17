const mysql = require('mysql2/promise');
require('dotenv').config();

const TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    google_id VARCHAR(255),
    country VARCHAR(100),
    company_name VARCHAR(255),
    subscription_tier ENUM('trial', 'Program 1', 'Program 2', 'Enterprise', 'Admin') DEFAULT 'trial',
    points_balance INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    company_size VARCHAR(50),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    product_keywords TEXT,
    company_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    title VARCHAR(255),
    department VARCHAR(100),
    linkedin VARCHAR(255),
    email VARCHAR(255),
    phone TEXT,
    mobile TEXT,
    industry VARCHAR(100),
    country VARCHAR(100),
    is_procurement TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS reveals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    contact_id INT,
    points_used INT DEFAULT 1,
    revealed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tier VARCHAR(100),
    price INT,
    points_granted INT
  )`,
  `CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INT DEFAULT 500,
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    payment_id VARCHAR(255),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
  )`,
  `CREATE TABLE IF NOT EXISTS search_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    keyword VARCHAR(255),
    country_filter VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS search_trends (
    keyword VARCHAR(100) PRIMARY KEY,
    count INT DEFAULT 1,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS security_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    details TEXT,
    severity ENUM('low', 'medium', 'high') DEFAULT 'low',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
];

const INDEX_DEFINITIONS = [
  ['companies', 'idx_company_industry', 'CREATE INDEX idx_company_industry ON companies(industry)'],
  ['companies', 'idx_company_country', 'CREATE INDEX idx_company_country ON companies(country)'],
  ['companies', 'idx_company_name', 'CREATE INDEX idx_company_name ON companies(company_name)'],
  ['contacts', 'idx_contact_company_id', 'CREATE INDEX idx_contact_company_id ON contacts(company_id)'],
  ['contacts', 'idx_contact_is_procurement', 'CREATE INDEX idx_contact_is_procurement ON contacts(is_procurement)'],
  ['contacts', 'idx_contact_industry', 'CREATE INDEX idx_contact_industry ON contacts(industry)'],
  ['contacts', 'idx_contact_country', 'CREATE INDEX idx_contact_country ON contacts(country)'],
];

const TRIGGER_NAME = 'before_contact_insert';
const TRIGGER_STATEMENT = `
CREATE TRIGGER before_contact_insert
BEFORE INSERT ON contacts
FOR EACH ROW
BEGIN
  IF NEW.title REGEXP 'procurement|purchasing|sourcing|supply chain|vendor|category manager|strategic sourcing' THEN
    SET NEW.is_procurement = 1;
  END IF;
END`;

async function ensureIndex(connection, dbName, tableName, indexName, statement) {
  const [rows] = await connection.execute(
    `SELECT 1
     FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = ? AND index_name = ?
     LIMIT 1`,
    [dbName, tableName, indexName]
  );

  if (rows.length === 0) {
    await connection.query(statement);
    console.log(`Created index ${indexName}.`);
  } else {
    console.log(`Index ${indexName} already exists.`);
  }
}

async function ensureTrigger(connection, dbName) {
  const [rows] = await connection.execute(
    `SELECT 1
     FROM information_schema.triggers
     WHERE trigger_schema = ? AND trigger_name = ?
     LIMIT 1`,
    [dbName, TRIGGER_NAME]
  );

  if (rows.length === 0) {
    await connection.query(TRIGGER_STATEMENT);
    console.log(`Created trigger ${TRIGGER_NAME}.`);
  } else {
    console.log(`Trigger ${TRIGGER_NAME} already exists.`);
  }
}

async function setup() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      multipleStatements: true,
    });

    console.log('Connected to MySQL server.');

    const dbName = process.env.DB_NAME || 'eximhub_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" checked/created.`);

    await connection.changeUser({ database: dbName });
    console.log(`Using database "${dbName}".`);

    for (const statement of TABLE_STATEMENTS) {
      await connection.query(statement);
    }
    console.log('Tables verified successfully.');

    for (const [tableName, indexName, statement] of INDEX_DEFINITIONS) {
      await ensureIndex(connection, dbName, tableName, indexName, statement);
    }

    await ensureTrigger(connection, dbName);

    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables.map((table) => Object.values(table)[0]).join(', '));
  } catch (error) {
    console.error('Setup failed:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();
