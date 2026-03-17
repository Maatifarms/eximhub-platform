const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');
const { importContactsCsv } = require('../import_contacts_lib');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const isAdmin = async (req, res, next) => {
  try {
    const [users] = await db.execute('SELECT subscription_tier FROM users WHERE id = ?', [req.user.id]);
    if (users[0] && (users[0].subscription_tier === 'Enterprise' || users[0].subscription_tier === 'Admin')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Admin access required. Tier must be 'Enterprise' or 'Admin'.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Admin check failed' });
  }
};

router.get('/companies', [auth, isAdmin], async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM companies ORDER BY created_at DESC LIMIT 100');
  res.json({ success: true, data: rows });
});

router.post('/companies', [auth, isAdmin], async (req, res) => {
  const { company_name, industry, country, website } = req.body;
  const [result] = await db.execute(
    'INSERT INTO companies (company_name, industry, country, website) VALUES (?, ?, ?, ?)',
    [company_name, industry, country, website]
  );
  res.json({ success: true, id: result.insertId });
});

router.get('/contacts', [auth, isAdmin], async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 100');
  res.json({ success: true, data: rows });
});

router.post('/contacts', [auth, isAdmin], async (req, res) => {
  const { company_id, full_name, title, email, phone } = req.body;
  const [result] = await db.execute(
    'INSERT INTO contacts (company_id, full_name, title, email, phone) VALUES (?, ?, ?, ?, ?)',
    [company_id, full_name, title, email, phone]
  );
  res.json({ success: true, id: result.insertId });
});

router.post('/upload/contacts', [auth, isAdmin, upload.single('file')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
  }

  const uploadedFilePath = req.file.path;

  try {
    const summary = await importContactsCsv(uploadedFilePath);
    return res.json({
      success: true,
      message: `Ingestion complete. Inserted ${summary.contactsInserted} contacts across ${summary.companiesCreated} new companies.`,
      data: summary,
    });
  } catch (error) {
    console.error('UPLOAD_CONTACTS_ERROR:', error);
    return res.status(500).json({
      success: false,
      message: `Upload processing failed: ${error.message}`,
    });
  } finally {
    fs.promises.unlink(uploadedFilePath).catch(() => {});
  }
});

module.exports = router;
