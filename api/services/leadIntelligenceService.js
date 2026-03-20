const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^127\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

function normalizeString(value) {
  return String(value || '').trim();
}

function isPrivateIp(ip) {
  const candidate = normalizeString(ip);
  if (!candidate) return true;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(candidate));
}

async function enrichIpLocation(ip) {
  if (!ip || isPrivateIp(ip)) {
    return {
      ip: ip || null,
      city: null,
      region: null,
      country: null,
      country_code: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: null,
      source: 'local_or_private_ip',
    };
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`IP lookup failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.success) {
      throw new Error(payload.message || 'IP lookup unsuccessful');
    }

    return {
      ip,
      city: payload.city || null,
      region: payload.region || null,
      country: payload.country || null,
      country_code: payload.country_code || null,
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      timezone: payload.timezone?.id || null,
      isp: payload.connection?.isp || null,
      source: 'ipwhois',
    };
  } catch (error) {
    console.error('IP_GEO_LOOKUP_ERROR:', error.message);
    return {
      ip,
      city: null,
      region: null,
      country: null,
      country_code: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: null,
      source: 'lookup_failed',
    };
  }
}

function buildLeadSignals(payload = {}) {
  const interest = normalizeString(payload.interest).toLowerCase();
  const message = normalizeString(payload.message).toLowerCase();
  const pagePath = normalizeString(payload.page_path).toLowerCase();
  const referrer = normalizeString(payload.referrer).toLowerCase();

  const highIntentTerms = ['enterprise', 'pricing', 'buyer', 'export', 'import', 'hs code', 'gst', 'supplier', 'market'];
  const directTerms = ['quote', 'demo', 'call', 'contact', 'pricing', 'trial', 'subscription'];

  const matchedHighIntent = highIntentTerms.filter((term) =>
    interest.includes(term) || message.includes(term) || pagePath.includes(term)
  );
  const matchedDirect = directTerms.filter((term) => message.includes(term) || pagePath.includes(term));

  let score = 20;
  if (payload.email) score += 15;
  if (payload.phone) score += 10;
  if (payload.company_name) score += 10;
  if (payload.message && normalizeString(payload.message).length > 30) score += 10;
  if (pagePath.includes('pricing')) score += 10;
  if (referrer && !referrer.includes('eximhub')) score += 5;
  score += matchedHighIntent.length * 5;
  score += matchedDirect.length * 5;

  const leadGrade = score >= 65 ? 'hot' : score >= 40 ? 'warm' : 'cold';

  return {
    score,
    leadGrade,
    matchedSignals: [...new Set([...matchedHighIntent, ...matchedDirect])],
  };
}

async function buildOpenAiLeadSummary(payload, fallback) {
  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SMALL_MODEL || 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'You classify website leads for an Indian import-export platform. Return strict JSON with keys summary, intent, urgency, lead_grade. Keep summary under 25 words.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify(payload),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'lead_summary',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                summary: { type: 'string' },
                intent: { type: 'string' },
                urgency: { type: 'string' },
                lead_grade: { type: 'string' },
              },
              required: ['summary', 'intent', 'urgency', 'lead_grade'],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error ${response.status}`);
    }

    const result = await response.json();
    const raw = result.output_text || '{}';
    return JSON.parse(raw);
  } catch (error) {
    console.error('OPENAI_LEAD_SUMMARY_ERROR:', error.message);
    return fallback;
  }
}

async function analyzeLead(payload = {}) {
  const signals = buildLeadSignals(payload);
  const fallback = {
    summary: `${signals.leadGrade.toUpperCase()} lead with ${signals.score} score`,
    intent: normalizeString(payload.interest) || 'general inquiry',
    urgency: signals.leadGrade === 'hot' ? 'high' : signals.leadGrade === 'warm' ? 'medium' : 'low',
    lead_grade: signals.leadGrade,
  };

  const ai = await buildOpenAiLeadSummary(payload, fallback);

  return {
    score: signals.score,
    leadGrade: signals.leadGrade,
    matchedSignals: signals.matchedSignals,
    aiSummary: ai.summary || fallback.summary,
    aiIntent: ai.intent || fallback.intent,
    aiUrgency: ai.urgency || fallback.urgency,
  };
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '')
    .split(',')
    .map((entry) => entry.trim())
    .find(Boolean);

  return (
    forwarded ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.socket?.remoteAddress ||
    null
  );
}

module.exports = {
  analyzeLead,
  enrichIpLocation,
  getClientIp,
};
