const express = require('express');
const db = require('../db');
const { sendContactInquiryNotifications } = require('../services/emailService');

const router = express.Router();

router.post('/contact', async (req, res) => {
  const { name, email, phone, companyName, interest, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required',
    });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO contact_inquiries (
        name, email, phone, company_name, interest, message
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        String(email).trim().toLowerCase(),
        phone ? String(phone).trim() : null,
        companyName ? String(companyName).trim() : null,
        interest ? String(interest).trim() : null,
        String(message).trim(),
      ]
    );

    const inquiry = {
      id: result.insertId,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      company_name: companyName ? String(companyName).trim() : null,
      interest: interest ? String(interest).trim() : null,
      message: String(message).trim(),
    };

    sendContactInquiryNotifications(inquiry).catch((error) => {
      console.error('CONTACT_INQUIRY_EMAIL_ERROR:', error);
    });

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. Our team will contact you shortly.',
      data: { inquiryId: result.insertId },
    });
  } catch (error) {
    console.error('CONTACT_INQUIRY_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit inquiry' });
  }
});

module.exports = router;
