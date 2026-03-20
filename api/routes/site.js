const express = require('express');
const db = require('../db');
const { sendContactInquiryNotifications, sendWebsiteVisitNotification } = require('../services/emailService');
const { analyzeLead, enrichIpLocation, getClientIp } = require('../services/leadIntelligenceService');

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
    const ipAddress = getClientIp(req);
    const location = await enrichIpLocation(ipAddress);
    const leadAnalysis = await analyzeLead({
      name,
      email,
      phone,
      company_name: companyName,
      interest,
      message,
      page_path: '/contact',
    });

    const [result] = await db.execute(
      `INSERT INTO contact_inquiries (
        name, email, phone, company_name, interest, message, ip_address, city, region, country, user_agent, lead_score, lead_grade, ai_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        String(email).trim().toLowerCase(),
        phone ? String(phone).trim() : null,
        companyName ? String(companyName).trim() : null,
        interest ? String(interest).trim() : null,
        String(message).trim(),
        location.ip,
        location.city,
        location.region,
        location.country,
        req.headers['user-agent'] || null,
        leadAnalysis.score,
        leadAnalysis.leadGrade,
        leadAnalysis.aiSummary,
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
      ip_address: location.ip,
      city: location.city,
      region: location.region,
      country: location.country,
      lead_score: leadAnalysis.score,
      lead_grade: leadAnalysis.leadGrade,
      ai_summary: leadAnalysis.aiSummary,
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

router.post('/visit', async (req, res) => {
  try {
    const {
      sessionId,
      pagePath,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      visitorEmail,
      visitorName,
      companyName,
      phone,
      language,
      timezone,
      deviceType,
      metadata,
    } = req.body || {};

    const ipAddress = getClientIp(req);
    const location = await enrichIpLocation(ipAddress);
    const leadAnalysis = await analyzeLead({
      page_path: pagePath,
      referrer,
      interest: utmCampaign || utmSource,
      email: visitorEmail,
      name: visitorName,
      company_name: companyName,
      phone,
      message: metadata?.notes,
    });

    const [result] = await db.execute(
      `INSERT INTO website_visits (
        session_id, page_path, referrer, utm_source, utm_medium, utm_campaign,
        visitor_email, visitor_name, company_name, phone, country, region, city,
        ip_address, user_agent, language, timezone, device_type,
        lead_score, lead_grade, ai_summary, ai_intent, ai_urgency, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId ? String(sessionId).trim() : null,
        pagePath ? String(pagePath).trim() : '/',
        referrer ? String(referrer).trim() : null,
        utmSource ? String(utmSource).trim() : null,
        utmMedium ? String(utmMedium).trim() : null,
        utmCampaign ? String(utmCampaign).trim() : null,
        visitorEmail ? String(visitorEmail).trim().toLowerCase() : null,
        visitorName ? String(visitorName).trim() : null,
        companyName ? String(companyName).trim() : null,
        phone ? String(phone).trim() : null,
        location.country,
        location.region,
        location.city,
        location.ip,
        req.headers['user-agent'] || null,
        language ? String(language).trim() : null,
        timezone ? String(timezone).trim() : null,
        deviceType ? String(deviceType).trim() : null,
        leadAnalysis.score,
        leadAnalysis.leadGrade,
        leadAnalysis.aiSummary,
        leadAnalysis.aiIntent,
        leadAnalysis.aiUrgency,
        JSON.stringify(metadata || {}),
      ]
    );

    const visit = {
      id: result.insertId,
      page_path: pagePath ? String(pagePath).trim() : '/',
      referrer: referrer ? String(referrer).trim() : null,
      visitor_email: visitorEmail ? String(visitorEmail).trim().toLowerCase() : null,
      visitor_name: visitorName ? String(visitorName).trim() : null,
      company_name: companyName ? String(companyName).trim() : null,
      phone: phone ? String(phone).trim() : null,
      country: location.country,
      region: location.region,
      city: location.city,
      ip_address: location.ip,
      language: language ? String(language).trim() : null,
      timezone: timezone ? String(timezone).trim() : null,
      lead_score: leadAnalysis.score,
      lead_grade: leadAnalysis.leadGrade,
      ai_summary: leadAnalysis.aiSummary,
      ai_intent: leadAnalysis.aiIntent,
      ai_urgency: leadAnalysis.aiUrgency,
    };

    const shouldNotify = Boolean(visit.visitor_email || visit.phone || visit.company_name || visit.lead_score >= 55);
    if (shouldNotify) {
      sendWebsiteVisitNotification(visit).catch((error) => {
        console.error('WEBSITE_VISIT_EMAIL_ERROR:', error);
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Visit captured',
      data: { visitId: result.insertId, leadGrade: leadAnalysis.leadGrade },
    });
  } catch (error) {
    console.error('WEBSITE_VISIT_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to capture visit' });
  }
});

module.exports = router;
