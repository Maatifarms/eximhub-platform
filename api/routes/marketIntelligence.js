const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/search', auth, async (req, res) => {
  try {
    const {
      keyword,
      hsCode,
      country,
      shipperName,
      consigneeName,
      marketSegment,
      port,
      shipmentMode,
      limit = 25,
    } = req.body;

    let sql = `
      SELECT
        id,
        shipment_date,
        hs_code,
        product_description,
        shipper_name,
        consignee_name,
        country_of_destination,
        port_of_destination,
        port_of_origin,
        shipment_mode,
        quantity_value,
        quantity_unit,
        estimated_fob_value_usd,
        std_unit_rate_usd,
        market_segment,
        source_product
      FROM market_intelligence_records
      WHERE 1 = 1
    `;

    const params = [];

    if (keyword) {
      sql += ' AND (product_description LIKE ? OR hs_description LIKE ? OR source_product LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (hsCode) {
      sql += ' AND hs_code = ?';
      params.push(hsCode);
    }
    if (country) {
      sql += ' AND country_of_destination LIKE ?';
      params.push(`%${country}%`);
    }
    if (shipperName) {
      sql += ' AND shipper_name LIKE ?';
      params.push(`%${shipperName}%`);
    }
    if (consigneeName) {
      sql += ' AND consignee_name LIKE ?';
      params.push(`%${consigneeName}%`);
    }
    if (marketSegment) {
      sql += ' AND market_segment = ?';
      params.push(marketSegment);
    }
    if (port) {
      sql += ' AND (port_of_destination LIKE ? OR port_of_origin LIKE ?)';
      params.push(`%${port}%`, `%${port}%`);
    }
    if (shipmentMode) {
      sql += ' AND shipment_mode LIKE ?';
      params.push(`%${shipmentMode}%`);
    }

    sql += ' ORDER BY shipment_date DESC, id DESC LIMIT ?';
    params.push(Math.min(parseInt(limit, 10) || 25, 100));

    console.log('MARKET_INTELLIGENCE_SEARCH_PARAMS:', { keyword, hsCode, country, shipperName, consigneeName, marketSegment, port, shipmentMode, limit });
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('MARKET_INTELLIGENCE_SEARCH_ERROR:', error);
    res.status(500).json({ success: false, message: 'Market intelligence search failed' });
  }
});

router.get('/overview', auth, async (req, res) => {
  try {
    const [[totals], [topCountries], [topProducts], [topShippers], [segments]] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) AS total_records,
          COUNT(DISTINCT consignee_name) AS unique_buyers,
          COUNT(DISTINCT shipper_name) AS unique_shippers,
          COUNT(DISTINCT country_of_destination) AS active_countries,
          COUNT(DISTINCT hs_code) AS active_hs_codes
        FROM market_intelligence_records
      `),
      db.query(`
        SELECT country_of_destination AS label, COUNT(*) AS count
        FROM market_intelligence_records
        WHERE country_of_destination IS NOT NULL AND country_of_destination <> ''
        GROUP BY country_of_destination
        ORDER BY count DESC
        LIMIT 8
      `),
      db.query(`
        SELECT product_description AS label, COUNT(*) AS count
        FROM market_intelligence_records
        WHERE product_description IS NOT NULL AND product_description <> ''
        GROUP BY product_description
        ORDER BY count DESC
        LIMIT 8
      `),
      db.query(`
        SELECT shipper_name AS label, COUNT(*) AS count
        FROM market_intelligence_records
        WHERE shipper_name IS NOT NULL AND shipper_name <> ''
        GROUP BY shipper_name
        ORDER BY count DESC
        LIMIT 8
      `),
      db.query(`
        SELECT market_segment AS label, COUNT(*) AS count
        FROM market_intelligence_records
        GROUP BY market_segment
        ORDER BY count DESC
      `),
    ]);

    const data = {
      totals: totals[0] || {},
      topCountries,
      topProducts,
      topShippers,
      segments,
    };
    
    console.log('MARKET_INTELLIGENCE_OVERVIEW_DATA:', { 
      count: data.totals.total_records, 
      countries: data.topCountries.length 
    });

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('MARKET_INTELLIGENCE_OVERVIEW_ERROR:', error);
    res.status(500).json({ success: false, message: 'Market intelligence overview failed' });
  }
});

module.exports = router;
