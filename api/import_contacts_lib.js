const fs = require('fs');
const db = require('./db');

const PROCUREMENT_REGEX = /procurement|purchasing|sourcing|supply chain|vendor|category manager|strategic sourcing/i;

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function normalizeValue(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeWebsite(value) {
  const normalized = normalizeValue(value);
  if (!normalized) return null;

  const compact = normalized.replace(/\\/g, '').trim();
  if (compact.length === 0) return null;

  const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(compact);
  const looksLikeDomain = /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(compact);
  const hasWhitespace = /\s/.test(compact);

  if (hasWhitespace) return null;
  if (!looksLikeUrl && !looksLikeDomain) return null;

  return compact;
}

function sqlParams(values) {
  return values.map((value) => (value === undefined ? null : value));
}

function buildFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || null;
}

function createCompanyKey(companyName, website, country) {
  return [companyName || '', website || '', country || ''].map((part) => (part || '').toLowerCase()).join('|');
}

function createContactKey(companyId, email, linkedin, fullName, title) {
  if (email) return `email|${email.toLowerCase()}`;
  if (linkedin) return `linkedin|${linkedin.toLowerCase()}`;
  return `fallback|${companyId}|${(fullName || '').toLowerCase()}|${(title || '').toLowerCase()}`;
}

function readCsvRows(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row.');
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = normalizeValue(values[index]);
    });

    rows.push(row);
  }

  return rows;
}

async function ensureCompany(connection, companyCache, row) {
  const companyName = normalizeValue(row.company_name);
  const website = normalizeWebsite(row.website);
  const industry = normalizeValue(row.industry);
  const country = normalizeValue(row.country);

  if (!companyName) {
    throw new Error('Missing company_name in CSV row.');
  }

  const cacheKey = createCompanyKey(companyName, website, country);
  if (companyCache.has(cacheKey)) {
    return { companyId: companyCache.get(cacheKey), created: false };
  }

  let existing;
  if (website) {
    [existing] = await connection.execute(
      'SELECT id FROM companies WHERE company_name = ? AND IFNULL(website, "") = ? LIMIT 1',
      sqlParams([companyName, website])
    );
  } else {
    [existing] = await connection.execute(
      'SELECT id FROM companies WHERE company_name = ? AND IFNULL(country, "") = IFNULL(?, "") LIMIT 1',
      sqlParams([companyName, country])
    );
  }

  let companyId;
  let created = false;

  if (existing.length > 0) {
    companyId = existing[0].id;
    await connection.execute(
      `UPDATE companies
       SET industry = COALESCE(industry, ?),
           website = COALESCE(website, ?),
           country = COALESCE(country, ?)
       WHERE id = ?`,
      sqlParams([industry, website, country, companyId])
    );
  } else {
    const [result] = await connection.execute(
      `INSERT INTO companies (company_name, industry, website, country, product_keywords, company_keywords)
       VALUES (?, ?, ?, ?, ?, ?)`,
      sqlParams([companyName, industry, website, country, industry, companyName])
    );
    companyId = result.insertId;
    created = true;
  }

  companyCache.set(cacheKey, companyId);
  return { companyId, created };
}

async function importRows(rows, dryRun = false) {
  let connection;
  const summary = {
    rowsRead: rows.length,
    companiesCreated: 0,
    companiesReused: 0,
    contactsInserted: 0,
    contactsSkipped: 0,
    procurementContacts: 0,
  };

  const companyCache = new Map();
  const contactCache = new Set();

  try {
    if (!dryRun) {
      connection = await db.getConnection();
      await connection.beginTransaction();
    }

    for (const row of rows) {
      const firstName = normalizeValue(row.first_name);
      const lastName = normalizeValue(row.last_name);
      const title = normalizeValue(row.title);
      const linkedin = normalizeValue(row.linkedin);
      const email = normalizeValue(row.email);
      const phone = normalizeValue(row.phone);
      const fullName = buildFullName(firstName, lastName);

      if (!fullName || !title || !row.company_name) {
        summary.contactsSkipped += 1;
        continue;
      }

      let companyId;
      const companyCacheKey = createCompanyKey(row.company_name, row.website, row.country);
      const hadCompany = companyCache.has(companyCacheKey);

      if (dryRun) {
        companyId = hadCompany ? companyCache.get(companyCacheKey) : companyCache.size + 1;
        if (!hadCompany) {
          companyCache.set(companyCacheKey, companyId);
          summary.companiesCreated += 1;
        } else {
          summary.companiesReused += 1;
        }
      } else {
      const companyResult = await ensureCompany(connection, companyCache, row);
        companyId = companyResult.companyId;
        if (hadCompany || !companyResult.created) {
          summary.companiesReused += 1;
        } else {
          summary.companiesCreated += 1;
        }
      }

      const contactKey = createContactKey(companyId, email, linkedin, fullName, title);
      if (contactCache.has(contactKey)) {
        summary.contactsSkipped += 1;
        continue;
      }

      if (!dryRun) {
        let existingContact = [];
        if (email) {
          [existingContact] = await connection.execute('SELECT id FROM contacts WHERE email = ? LIMIT 1', sqlParams([email]));
        } else if (linkedin) {
          [existingContact] = await connection.execute('SELECT id FROM contacts WHERE linkedin = ? LIMIT 1', sqlParams([linkedin]));
        } else {
          [existingContact] = await connection.execute(
            'SELECT id FROM contacts WHERE company_id = ? AND full_name = ? AND title = ? LIMIT 1',
            sqlParams([companyId, fullName, title])
          );
        }

        if (existingContact.length > 0) {
          contactCache.add(contactKey);
          summary.contactsSkipped += 1;
          continue;
        }

        const isProcurement = PROCUREMENT_REGEX.test(title) ? 1 : 0;
        await connection.execute(
          `INSERT INTO contacts (
            company_id, first_name, last_name, full_name, title, linkedin, email, phone, industry, country, is_procurement
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          sqlParams([
            companyId,
            firstName,
            lastName,
            fullName,
            title,
            linkedin,
            email,
            phone,
            normalizeValue(row.industry),
            normalizeValue(row.country),
            isProcurement,
          ])
        );

        if (isProcurement) {
          summary.procurementContacts += 1;
        }
      } else if (PROCUREMENT_REGEX.test(title)) {
        summary.procurementContacts += 1;
      }

      contactCache.add(contactKey);
      summary.contactsInserted += 1;
    }

    if (!dryRun && connection) {
      await connection.commit();
    }

    return summary;
  } catch (error) {
    if (!dryRun && connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function importContactsCsv(filePath, options = {}) {
  const rows = readCsvRows(filePath);
  return importRows(rows, Boolean(options.dryRun));
}

module.exports = {
  PROCUREMENT_REGEX,
  readCsvRows,
  importRows,
  importContactsCsv,
};
