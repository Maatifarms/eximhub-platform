const db = require('../db');

const statements = [
  `CREATE TABLE IF NOT EXISTS website_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100),
    page_path VARCHAR(255),
    referrer TEXT,
    utm_source VARCHAR(120),
    utm_medium VARCHAR(120),
    utm_campaign VARCHAR(120),
    visitor_email VARCHAR(255),
    visitor_name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(100),
    country VARCHAR(120),
    region VARCHAR(120),
    city VARCHAR(120),
    ip_address VARCHAR(100),
    user_agent TEXT,
    language VARCHAR(80),
    timezone VARCHAR(120),
    device_type VARCHAR(80),
    lead_score INT DEFAULT 0,
    lead_grade VARCHAR(20),
    ai_summary VARCHAR(255),
    ai_intent VARCHAR(120),
    ai_urgency VARCHAR(50),
    metadata_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
];

const alterStatements = [
  `ALTER TABLE contact_inquiries ADD COLUMN ip_address VARCHAR(100) NULL`,
  `ALTER TABLE contact_inquiries ADD COLUMN city VARCHAR(120) NULL`,
  `ALTER TABLE contact_inquiries ADD COLUMN region VARCHAR(120) NULL`,
  `ALTER TABLE contact_inquiries ADD COLUMN country VARCHAR(120) NULL`,
  `ALTER TABLE contact_inquiries ADD COLUMN user_agent TEXT NULL`,
  `ALTER TABLE contact_inquiries ADD COLUMN lead_score INT DEFAULT 0`,
  `ALTER TABLE contact_inquiries ADD COLUMN lead_grade VARCHAR(20) NULL`,
  `ALTER TABLE contact_inquiries ADD COLUMN ai_summary VARCHAR(255) NULL`,
];

async function ensureRuntimeSchema() {
  for (const statement of statements) {
    await db.query(statement);
  }

  for (const statement of alterStatements) {
    try {
      await db.query(statement);
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
  }
}

module.exports = {
  ensureRuntimeSchema,
};
