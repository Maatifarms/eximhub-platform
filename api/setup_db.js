const mysql = require('mysql2/promise');
require('dotenv').config();

const TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
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
    website TEXT,
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
  `CREATE TABLE IF NOT EXISTS market_intelligence_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    row_hash CHAR(64) NOT NULL UNIQUE,
    shipment_date VARCHAR(50),
    hs_code VARCHAR(50),
    product_description TEXT,
    shipper_name VARCHAR(255),
    consignee_name VARCHAR(255),
    notify_party_name VARCHAR(255),
    std_quantity VARCHAR(100),
    std_unit VARCHAR(50),
    std_unit_rate_usd VARCHAR(100),
    estimated_fob_value_usd VARCHAR(100),
    estimated_unit_rate_usd VARCHAR(100),
    port_of_destination VARCHAR(255),
    country_of_destination VARCHAR(150),
    port_of_origin VARCHAR(255),
    shipment_mode VARCHAR(100),
    quantity_value VARCHAR(100),
    quantity_unit VARCHAR(50),
    value_in_fc VARCHAR(100),
    rate_in_fc VARCHAR(100),
    rate_currency VARCHAR(50),
    freight_value_usd VARCHAR(100),
    insurance_value_usd VARCHAR(100),
    trade_terms VARCHAR(100),
    gross_weight VARCHAR(100),
    gross_weight_unit VARCHAR(50),
    shipper_city VARCHAR(150),
    shipper_state VARCHAR(150),
    shipper_phone VARCHAR(100),
    shipper_email VARCHAR(255),
    shipper_contact_person VARCHAR(255),
    consignee_city VARCHAR(150),
    consignee_country VARCHAR(150),
    hs_description TEXT,
    hs2 VARCHAR(20),
    hs4 VARCHAR(20),
    shipment_month VARCHAR(50),
    source_record_id VARCHAR(100),
    iec VARCHAR(100),
    market_segment VARCHAR(100),
    source_file VARCHAR(255),
    source_product VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    company_name VARCHAR(255),
    interest VARCHAR(150),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  ['contacts', 'idx_contact_company_procurement', 'CREATE INDEX idx_contact_company_procurement ON contacts(company_id, is_procurement)'],
  ['contacts', 'idx_contact_title', 'CREATE INDEX idx_contact_title ON contacts(title(191))'],
  ['contacts', 'idx_contact_full_name', 'CREATE INDEX idx_contact_full_name ON contacts(full_name)'],
  ['reveals', 'idx_reveals_user_contact', 'CREATE INDEX idx_reveals_user_contact ON reveals(user_id, contact_id)'],
  ['reveals', 'idx_reveals_user_revealed_at', 'CREATE INDEX idx_reveals_user_revealed_at ON reveals(user_id, revealed_at)'],
  ['market_intelligence_records', 'idx_mi_country', 'CREATE INDEX idx_mi_country ON market_intelligence_records(country_of_destination)'],
  ['market_intelligence_records', 'idx_mi_hs_code', 'CREATE INDEX idx_mi_hs_code ON market_intelligence_records(hs_code)'],
  ['market_intelligence_records', 'idx_mi_shipper', 'CREATE INDEX idx_mi_shipper ON market_intelligence_records(shipper_name)'],
  ['market_intelligence_records', 'idx_mi_consignee', 'CREATE INDEX idx_mi_consignee ON market_intelligence_records(consignee_name)'],
  ['market_intelligence_records', 'idx_mi_segment', 'CREATE INDEX idx_mi_segment ON market_intelligence_records(market_segment)'],
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

async function ensureColumn(connection, dbName, tableName, columnName, definition, backfillStatement = null) {
  const [rows] = await connection.execute(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [dbName, tableName, columnName]
  );

  if (rows.length === 0) {
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition}`);
    console.log(`Added column ${tableName}.${columnName}.`);
  } else {
    console.log(`Column ${tableName}.${columnName} already exists.`);
  }

  if (backfillStatement) {
    await connection.query(backfillStatement);
  }
}

async function ensureTextColumn(connection, dbName, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT data_type AS data_type
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [dbName, tableName, columnName]
  );

  if (rows.length === 0) {
    return;
  }

  const currentType = String(rows[0].data_type || '').toLowerCase();
  if (currentType !== 'text' && currentType !== 'mediumtext' && currentType !== 'longtext') {
    await connection.query(`ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${columnName}\` TEXT`);
    console.log(`Converted ${tableName}.${columnName} to TEXT.`);
  } else {
    console.log(`Column ${tableName}.${columnName} type already sufficient.`);
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

    await ensureColumn(
      connection,
      dbName,
      'users',
      'role',
      "role ENUM('admin', 'user') NOT NULL DEFAULT 'user' AFTER email",
      "UPDATE users SET role = CASE WHEN subscription_tier = 'Admin' THEN 'admin' ELSE 'user' END"
    );

    await ensureTextColumn(connection, dbName, 'companies', 'website');

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
