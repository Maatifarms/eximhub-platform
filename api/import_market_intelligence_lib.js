const fs = require('fs');
const readline = require('readline');
const db = require('./db');

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
  return values;
}

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function normalizeValue(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function sqlParams(values) {
  return values.map((value) => (value === undefined ? null : value));
}

async function readCsvRows(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  let pending = '';
  const rows = [];

  for await (const rawLine of rl) {
    const line = pending ? `${pending}\n${rawLine}` : rawLine;
    const quoteCount = (line.match(/"/g) || []).length;

    if (quoteCount % 2 === 1) {
      pending = line;
      continue;
    }

    pending = '';
    const cleanedLine = rows.length === 0 && !headers ? line.replace(/^\uFEFF/, '') : line;
    const parsed = parseCsvLine(cleanedLine);

    if (!headers) {
      headers = parsed.map(normalizeHeader);
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      row[header] = normalizeValue(parsed[index]);
    });
    rows.push(row);
  }

  if (pending) {
    const parsed = parseCsvLine(pending);
    if (!headers) {
      headers = parsed.map(normalizeHeader);
    } else {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = normalizeValue(parsed[index]);
      });
      rows.push(row);
    }
  }

  if (!headers) {
    throw new Error('CSV must contain a header row.');
  }

  return rows;
}

async function importRows(rows, dryRun = false) {
  const summary = {
    rowsRead: rows.length,
    rowsInserted: 0,
    rowsUpdated: 0,
    rowsSkipped: 0,
  };

  let connection;

  try {
    if (!dryRun) {
      connection = await db.getConnection();
      await connection.beginTransaction();
    }

    for (const row of rows) {
      if (!row.eximhub_row_hash || !row.product_description) {
        summary.rowsSkipped += 1;
        continue;
      }

      if (dryRun) {
        summary.rowsInserted += 1;
        continue;
      }

      const params = sqlParams([
        row.eximhub_row_hash,
        row.date,
        row.hs_code,
        row.product_description,
        row.shipper_name,
        row.consignee_name,
        row.notify_party || row.notify_party_name,
        row.standard_qty || row.std_quantity,
        row.standard_unit || row.std_unit,
        row.standard_unit_rate || row.std_unit_rate || row.standard_unit_rate_$,
        row.estimated_f_o_b_value || row.estimated_f_o_b_value_$,
        row.estimated_unit_rate || row.estimated_unit_rate_$,
        row.port_of_destination,
        row.country_of_destination,
        row.port_of_origin,
        row.shipment_mode,
        row.qty || row.quantity,
        row.unit,
        row.value_in_fc,
        row.rate_in_fc,
        row.rate_currency,
        row.freight_value || row.freight_value_$,
        row.insurance_value || row.insurance_value_$,
        row.terms,
        row.gross_weight,
        row.gross_weight_unit,
        row.shipper_city,
        row.shipper_state,
        row.shipper_phone,
        row.shipper_email,
        row.shipper_contact_person,
        row.consignee_city,
        row.consignee_country || row.country_of_destination,
        row.hs_description,
        row.hs2,
        row.hs4,
        row.month,
        row.record_id,
        row.iec,
        row.eximhub_market_segment,
        row.eximhub_source_file,
        row.eximhub_source_product,
      ]);

      const [result] = await connection.execute(
        `INSERT INTO market_intelligence_records (
          row_hash, shipment_date, hs_code, product_description, shipper_name, consignee_name, notify_party_name,
          std_quantity, std_unit, std_unit_rate_usd, estimated_fob_value_usd, estimated_unit_rate_usd,
          port_of_destination, country_of_destination, port_of_origin, shipment_mode, quantity_value, quantity_unit,
          value_in_fc, rate_in_fc, rate_currency, freight_value_usd, insurance_value_usd, trade_terms,
          gross_weight, gross_weight_unit, shipper_city, shipper_state, shipper_phone, shipper_email,
          shipper_contact_person, consignee_city, consignee_country, hs_description, hs2, hs4, shipment_month,
          source_record_id, iec, market_segment, source_file, source_product
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          shipment_date = VALUES(shipment_date),
          hs_code = VALUES(hs_code),
          product_description = VALUES(product_description),
          shipper_name = VALUES(shipper_name),
          consignee_name = VALUES(consignee_name),
          notify_party_name = VALUES(notify_party_name),
          std_quantity = VALUES(std_quantity),
          std_unit = VALUES(std_unit),
          std_unit_rate_usd = VALUES(std_unit_rate_usd),
          estimated_fob_value_usd = VALUES(estimated_fob_value_usd),
          estimated_unit_rate_usd = VALUES(estimated_unit_rate_usd),
          port_of_destination = VALUES(port_of_destination),
          country_of_destination = VALUES(country_of_destination),
          port_of_origin = VALUES(port_of_origin),
          shipment_mode = VALUES(shipment_mode),
          quantity_value = VALUES(quantity_value),
          quantity_unit = VALUES(quantity_unit),
          value_in_fc = VALUES(value_in_fc),
          rate_in_fc = VALUES(rate_in_fc),
          rate_currency = VALUES(rate_currency),
          freight_value_usd = VALUES(freight_value_usd),
          insurance_value_usd = VALUES(insurance_value_usd),
          trade_terms = VALUES(trade_terms),
          gross_weight = VALUES(gross_weight),
          gross_weight_unit = VALUES(gross_weight_unit),
          shipper_city = VALUES(shipper_city),
          shipper_state = VALUES(shipper_state),
          shipper_phone = VALUES(shipper_phone),
          shipper_email = VALUES(shipper_email),
          shipper_contact_person = VALUES(shipper_contact_person),
          consignee_city = VALUES(consignee_city),
          consignee_country = VALUES(consignee_country),
          hs_description = VALUES(hs_description),
          hs2 = VALUES(hs2),
          hs4 = VALUES(hs4),
          shipment_month = VALUES(shipment_month),
          source_record_id = VALUES(source_record_id),
          iec = VALUES(iec),
          market_segment = VALUES(market_segment),
          source_file = VALUES(source_file),
          source_product = VALUES(source_product)`,
        params
      );

      if (result.affectedRows === 1) {
        summary.rowsInserted += 1;
      } else {
        summary.rowsUpdated += 1;
      }
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
    if (connection) connection.release();
  }
}

async function importMarketIntelligenceCsv(filePath, options = {}) {
  const rows = await readCsvRows(filePath);
  return importRows(rows, Boolean(options.dryRun));
}

module.exports = {
  importMarketIntelligenceCsv,
  importRows,
  readCsvRows,
};
