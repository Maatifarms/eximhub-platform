let cachedTransporter = null;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  );
}

function getTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  // Lazy require so the app can still run before SMTP is configured.
  const nodemailer = require('nodemailer');
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

async function sendMail(message) {
  const transporter = getTransporter();
  if (!transporter) {
    return { skipped: true, reason: 'smtp_not_configured' };
  }

  await transporter.sendMail(message);
  return { skipped: false };
}

function getFrontendBaseUrl() {
  return process.env.FRONTEND_BASE_URL || 'https://eximhub.pro';
}

function getSalesEmail() {
  return process.env.SALES_EMAIL || 'rupesh2510@gmail.com';
}

async function sendSignupWelcomeEmail(user) {
  const pricingUrl = `${getFrontendBaseUrl()}/pricing`;
  const salesEmail = getSalesEmail();

  const userMail = sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Welcome to EximHub - your buyer discovery access is ready',
    text: [
      `Hello ${user.name || 'there'},`,
      '',
      'Your EximHub account is live and your 100 free credits are ready.',
      'You can now explore buyers, suppliers, and market intelligence from one place.',
      '',
      `Upgrade here when you are ready: ${pricingUrl}`,
      '',
      'Need help choosing a plan?',
      'Email: info@eximhub.pro',
      'Phone: +91 9169658628',
      '',
      'EximHub Team',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #132535;">
        <h2>Welcome to EximHub</h2>
        <p>Hello ${user.name || 'there'},</p>
        <p>Your EximHub account is live and your <strong>100 free credits</strong> are ready.</p>
        <p>You can now explore buyers, suppliers, and market intelligence from one place.</p>
        <p>
          <a href="${pricingUrl}" style="display:inline-block;padding:12px 18px;background:#0ea5a3;color:#fff;text-decoration:none;border-radius:6px;">
            Upgrade Your Access
          </a>
        </p>
        <p>Need help choosing a plan? Reply to this email or contact us at <strong>info@eximhub.pro</strong>.</p>
        <p>Phone: +91 9169658628</p>
        <p>EximHub Team</p>
      </div>
    `,
  });

  const adminMail = sendMail({
    from: process.env.SMTP_FROM,
    to: salesEmail,
    subject: `New EximHub signup: ${user.name || user.email}`,
    text: [
      'A new user signed up on EximHub.',
      '',
      `Name: ${user.name || 'N/A'}`,
      `Email: ${user.email}`,
      `Role: ${user.role || 'user'}`,
      '',
      `Follow up here: ${pricingUrl}`,
    ].join('\n'),
  });

  const [userResult, adminResult] = await Promise.allSettled([userMail, adminMail]);
  return { userResult, adminResult };
}

async function sendContactInquiryNotifications(inquiry) {
  const salesEmail = getSalesEmail();
  const siteUrl = getFrontendBaseUrl();

  const adminMail = sendMail({
    from: process.env.SMTP_FROM,
    to: salesEmail,
    replyTo: inquiry.email,
    subject: `New EximHub inquiry from ${inquiry.name}`,
    text: [
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone || 'N/A'}`,
      `Company: ${inquiry.company_name || 'N/A'}`,
      `Interest: ${inquiry.interest || 'N/A'}`,
      `Location: ${[inquiry.city, inquiry.region, inquiry.country].filter(Boolean).join(', ') || 'N/A'}`,
      `IP: ${inquiry.ip_address || 'N/A'}`,
      `Lead Score: ${inquiry.lead_score ?? 'N/A'}`,
      `Lead Grade: ${inquiry.lead_grade || 'N/A'}`,
      `AI Summary: ${inquiry.ai_summary || 'N/A'}`,
      '',
      inquiry.message || '',
    ].join('\n'),
  });

  const userMail = sendMail({
    from: process.env.SMTP_FROM,
    to: inquiry.email,
    subject: 'We received your EximHub inquiry',
    text: [
      `Hello ${inquiry.name},`,
      '',
      'Thanks for contacting EximHub. Our team will review your request and get back to you shortly.',
      '',
      `In the meantime, you can review our plans here: ${siteUrl}/pricing`,
      '',
      'Contact:',
      'Email: info@eximhub.pro',
      'Phone: +91 9169658628',
      '',
      'EximHub Team',
    ].join('\n'),
  });

  const [adminResult, userResult] = await Promise.allSettled([adminMail, userMail]);
  return { adminResult, userResult };
}

async function sendWebsiteVisitNotification(visit) {
  const salesEmail = getSalesEmail();
  return sendMail({
    from: process.env.SMTP_FROM,
    to: salesEmail,
    subject: `Website visitor: ${visit.page_path || '/'} (${visit.lead_grade || 'new'})`,
    text: [
      `Page: ${visit.page_path || '/'}`,
      `Name: ${visit.visitor_name || 'N/A'}`,
      `Email: ${visit.visitor_email || 'N/A'}`,
      `Phone: ${visit.phone || 'N/A'}`,
      `Company: ${visit.company_name || 'N/A'}`,
      `Location: ${[visit.city, visit.region, visit.country].filter(Boolean).join(', ') || 'N/A'}`,
      `IP: ${visit.ip_address || 'N/A'}`,
      `Language: ${visit.language || 'N/A'}`,
      `Timezone: ${visit.timezone || 'N/A'}`,
      `Referrer: ${visit.referrer || 'Direct / Unknown'}`,
      `Lead Score: ${visit.lead_score ?? 'N/A'}`,
      `Lead Grade: ${visit.lead_grade || 'N/A'}`,
      `Intent: ${visit.ai_intent || 'N/A'}`,
      `Urgency: ${visit.ai_urgency || 'N/A'}`,
      `AI Summary: ${visit.ai_summary || 'N/A'}`,
    ].join('\n'),
  });
}

module.exports = {
  isEmailConfigured,
  sendContactInquiryNotifications,
  sendSignupWelcomeEmail,
  sendWebsiteVisitNotification,
};
