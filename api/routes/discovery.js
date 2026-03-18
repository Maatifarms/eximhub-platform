const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/directory', auth, async (req, res) => {
    const query = String(req.query.query || '').trim();
    const industry = String(req.query.industry || '').trim();
    const country = String(req.query.country || '').trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
    const offset = (page - 1) * limit;

    try {
        let whereSql = 'WHERE 1 = 1';
        const params = [];

        if (query) {
            whereSql += ' AND (c.company_name LIKE ? OR c.industry LIKE ? OR c.country LIKE ?)';
            params.push(`%${query}%`, `%${query}%`, `%${query}%`);
        }

        if (industry) {
            whereSql += ' AND c.industry = ?';
            params.push(industry);
        }

        if (country) {
            whereSql += ' AND c.country = ?';
            params.push(country);
        }

        const [rows] = await db.query(
            `
            SELECT
                c.id,
                c.company_name,
                c.industry,
                c.website,
                c.company_size,
                c.country,
                COUNT(ct.id) AS contact_count,
                SUM(CASE WHEN ct.is_procurement = 1 THEN 1 ELSE 0 END) AS procurement_contact_count
            FROM companies c
            LEFT JOIN contacts ct ON ct.company_id = c.id
            ${whereSql}
            GROUP BY c.id, c.company_name, c.industry, c.website, c.company_size, c.country
            ORDER BY procurement_contact_count DESC, contact_count DESC, c.company_name ASC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

        const [[countRow]] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM companies c
            ${whereSql}
            `,
            params
        );

        res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total: countRow.total,
                totalPages: Math.max(Math.ceil(countRow.total / limit), 1),
            },
        });
    } catch (e) {
        console.error('DIRECTORY ERROR:', e);
        res.status(500).json({ success: false, message: 'Failed to fetch directory', error: e.message });
    }
});

router.get('/contacts/:id', auth, async (req, res) => {
    const contactId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (!Number.isInteger(contactId) || contactId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid contact id' });
    }

    try {
        const [rows] = await db.query(
            `
            SELECT
                c.id,
                c.company_id,
                c.first_name,
                c.last_name,
                c.full_name,
                c.title,
                c.email,
                c.phone,
                c.linkedin,
                c.country,
                c.industry,
                c.is_procurement,
                co.company_name,
                co.website,
                co.company_size,
                co.country AS company_country,
                co.industry AS company_industry,
                EXISTS(
                    SELECT 1
                    FROM reveals r
                    WHERE r.user_id = ? AND r.contact_id = c.id
                ) AS is_revealed
            FROM contacts c
            JOIN companies co ON co.id = c.company_id
            WHERE c.id = ?
            LIMIT 1
            `,
            [userId, contactId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (e) {
        console.error('CONTACT PROFILE ERROR:', e);
        res.status(500).json({ success: false, message: 'Failed to fetch contact', error: e.message });
    }
});

// Discovery Search: Search-as-Reveal logic (Procurement Discovery)
router.post('/search', auth, async (req, res) => {
    const { industry, country, product_keyword, company_name, limit = 2 } = req.body;
    const userId = req.user.id;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Find suitable procurement contacts that haven't been revealed to this user yet
        let selectSql = `
            SELECT 
                c.id, 
                c.full_name, 
                c.title, 
                c.email,
                c.phone,
                c.linkedin,
                comp.company_name, 
                comp.industry, 
                comp.country,
                comp.website
            FROM contacts c
            JOIN companies comp ON c.company_id = comp.id
            WHERE c.is_procurement = 1
        `;
        const params = [];

        if (country) {
            selectSql += " AND comp.country = ?";
            params.push(country);
        }
        if (industry) {
            selectSql += " AND comp.industry = ?";
            params.push(industry);
        }
        if (company_name) {
            selectSql += " AND comp.company_name LIKE ?";
            params.push(`%${company_name}%`);
        }
        if (product_keyword) {
            selectSql += " AND (comp.product_keywords LIKE ? OR comp.company_name LIKE ? OR c.title LIKE ?)";
            params.push(`%${product_keyword}%`, `%${product_keyword}%`, `%${product_keyword}%`);
        }

        // Exclude already revealed contacts for this user
        selectSql += ` AND c.id NOT IN (SELECT contact_id FROM reveals WHERE user_id = ?)`;
        params.push(userId);

        // Stable ordering performs much better than ORDER BY RAND() as the dataset grows.
        selectSql += " ORDER BY comp.company_name ASC, c.id ASC LIMIT ?";
        params.push(parseInt(limit));

        const [contacts] = await connection.query(selectSql, params);

        if (contacts.length === 0) {
            await connection.rollback();
            return res.json({ success: true, data: [], message: "No new contacts found matching your criteria." });
        }

        // 2. Check points balance
        const [userRows] = await connection.query('SELECT points_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
        const currentBalance = userRows[0].points_balance;
        const cost = contacts.length;

        if (currentBalance < cost) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Insufficient points. You need ${cost} points but only have ${currentBalance}.` });
        }

        // 3. Deduct points
        await connection.query('UPDATE users SET points_balance = points_balance - ? WHERE id = ?', [cost, userId]);

        // 4. Log into reveals
        for (const contact of contacts) {
            await connection.query('INSERT INTO reveals (user_id, contact_id, points_used) VALUES (?, ?, 1)', [userId, contact.id]);
        }

        // 5. Log trends (optional but nice)
        if (industry || product_keyword) {
            await connection.execute(
                'INSERT INTO search_trends (keyword, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
                [ (product_keyword || industry).toLowerCase().trim() ]
            );
        }

        await connection.commit();
        res.json({ success: true, data: contacts, points_deducted: cost });

    } catch (e) {
        if (connection) await connection.rollback();
        console.error('SEARCH ERROR:', e);
        res.status(500).json({ success: false, message: "Search failed", error: e.message });
    } finally {
        if (connection) connection.release();
    }
});

// Trending Insights Endpoint
router.get('/trends', async (req, res) => {
    try {
        const [keywords] = await db.execute('SELECT keyword, count FROM search_trends ORDER BY count DESC LIMIT 10');
        const [countries] = await db.execute('SELECT country, COUNT(*) as count FROM companies GROUP BY country ORDER BY count DESC LIMIT 5');
        const [industries] = await db.execute('SELECT industry, COUNT(*) as count FROM companies GROUP BY industry ORDER BY count DESC LIMIT 5');

        res.json({
            success: true,
            data: { keywords, countries, industries }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Failed to fetch trends" });
    }
});

// Market Intelligence Analytics (Aggregated from logs)
router.get('/analytics', async (req, res) => {
    try {
        const [topIndustries] = await db.query(`
            SELECT industry as keyword, COUNT(*) as count 
            FROM companies 
            GROUP BY industry
            ORDER BY count DESC LIMIT 5
        `);

        const [topCountries] = await db.query(`
            SELECT country, COUNT(*) as count 
            FROM companies 
            GROUP BY country 
            ORDER BY count DESC LIMIT 5
        `);

        const [trendingProducts] = await db.query(`
            SELECT keyword, count 
            FROM search_trends 
            WHERE keyword NOT IN (SELECT DISTINCT industry FROM companies WHERE industry IS NOT NULL)
            ORDER BY count DESC LIMIT 5
        `);

        res.json({
            success: true,
            data: { topIndustries, topCountries, trendingProducts }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Analytics failed" });
    }
});

module.exports = router;
