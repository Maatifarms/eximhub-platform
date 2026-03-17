const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const adminController = require('../controllers/adminController');
const { importContactsCsv } = require('../import_contacts_lib');
const { importMarketIntelligenceCsv } = require('../import_market_intelligence_lib');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

router.post('/create-user', [auth, requireAdmin], adminController.createUser);

router.get('/companies', [auth, requireAdmin], async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM companies ORDER BY created_at DESC LIMIT 100');
  res.json({ success: true, data: rows });
});

router.post('/companies', [auth, requireAdmin], async (req, res) => {
  const { company_name, industry, country, website } = req.body;
  const [result] = await db.execute(
    'INSERT INTO companies (company_name, industry, country, website) VALUES (?, ?, ?, ?)',
    [company_name, industry, country, website]
  );
  res.json({ success: true, id: result.insertId });
});

router.get('/contacts', [auth, requireAdmin], async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 100');
  res.json({ success: true, data: rows });
});

router.post('/contacts', [auth, requireAdmin], async (req, res) => {
  const { company_id, full_name, title, email, phone } = req.body;
  const [result] = await db.execute(
    'INSERT INTO contacts (company_id, full_name, title, email, phone) VALUES (?, ?, ?, ?, ?)',
    [company_id, full_name, title, email, phone]
  );
  res.json({ success: true, id: result.insertId });
});

router.post('/upload/contacts', [auth, requireAdmin, upload.single('file')], async (req, res) => {
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

router.post('/upload/market-intelligence', [auth, requireAdmin, upload.single('file')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
  }

  const uploadedFilePath = req.file.path;
  const dryRun = String(req.body?.dryRun || '').toLowerCase() === 'true';

  try {
    const summary = await importMarketIntelligenceCsv(uploadedFilePath, { dryRun });
    return res.json({
      success: true,
      message: dryRun
        ? `Dry run complete. ${summary.rowsRead} rows parsed.`
        : `Market intelligence import complete. Inserted ${summary.rowsInserted}, updated ${summary.rowsUpdated}.`,
      data: summary,
    });
  } catch (error) {
    console.error('UPLOAD_MARKET_INTELLIGENCE_ERROR:', error);
    return res.status(500).json({
      success: false,
      message: `Market intelligence upload failed: ${error.message}`,
    });
  } finally {
    fs.promises.unlink(uploadedFilePath).catch(() => {});
  }
});

module.exports = router;
