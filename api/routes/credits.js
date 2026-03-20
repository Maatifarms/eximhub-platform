const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// REVEAL CONTACTS (Supports Bulk Reveal from Search Results)
router.post('/reveal', auth, async (req, res) => {
    const userId = req.user.id;
    const { contactIds } = req.body; // Expecting an array [id1, id2, ...]

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
        return res.status(400).json({ success: false, message: "No contacts selected for reveal." });
    }

    try {
        // 1. Filter out already revealed contacts
        const [alreadyRevealed] = await db.execute(
            'SELECT contact_id FROM reveals WHERE user_id = ? AND contact_id IN (?)',
            [userId, contactIds]
        );
        const alreadyRevealedIds = alreadyRevealed.map(r => r.contact_id);
        const newContactIds = contactIds.filter(id => !alreadyRevealedIds.includes(id));

        if (newContactIds.length === 0) {
            // Already revealed all, just return them
            const [contacts] = await db.query('SELECT * FROM contacts WHERE id IN (?)', [contactIds]);
            return res.json({ success: true, message: "Already revealed", data: contacts });
        }

        const count = newContactIds.length;

        // 2. Check Daily Limit (50/day)
        const [dailyCount] = await db.execute(
            'SELECT COUNT(*) as count FROM reveals WHERE user_id = ? AND DATE(revealed_at) = CURDATE()',
            [userId]
        );
        if (dailyCount[0].count + count > 50) {
            return res.status(403).json({ success: false, message: `Action would exceed daily reveal limit (50). Remaining: ${50 - dailyCount[0].count}` });
        }

        // 3. Check Points
        const [users] = await db.execute('SELECT points_balance FROM users WHERE id = ?', [userId]);
        if (users[0].points_balance < count) {
            return res.status(402).json({ success: false, message: `Insufficient points. ${count} points required.` });
        }

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Deduct points only for NEW reveals
            await conn.execute('UPDATE users SET points_balance = points_balance - ? WHERE id = ?', [count, userId]);

            for (const contactId of newContactIds) {
                await conn.execute(
                    'INSERT IGNORE INTO reveals (user_id, contact_id, points_used) VALUES (?, ?, 1)',
                    [userId, contactId]
                );
            }

            await conn.commit();

            const [revealedContacts] = await conn.query('SELECT * FROM contacts WHERE id IN (?)', [contactIds]);
            res.json({ success: true, message: `${count} new contacts revealed`, data: revealedContacts });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    } catch (e) {
        console.error('REVEAL ERROR:', e);
        res.status(500).json({ success: false, message: "Server error during reveal" });
    }
});

// Balance Check
router.get('/balance', auth, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT points_balance, subscription_tier FROM users WHERE id = ?', [req.user.id]);
        res.json({ success: true, data: users[0] });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// 4. GET MY CONTACTS (Library)
router.get('/my-contacts', auth, async (req, res) => {
    const userId = req.user.id;
    try {
        const [reveals] = await db.execute(`
            SELECT 
                c.*, co.company_name, co.industry as company_industry, co.website, co.company_size,
                r.revealed_at 
            FROM reveals r
            LEFT JOIN contacts c ON r.contact_id = c.id
            LEFT JOIN companies co ON c.company_id = co.id
            WHERE r.user_id = ?
            ORDER BY r.revealed_at DESC
        `, [userId]);

        res.json({ success: true, data: reveals });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Failed to fetch library" });
    }
});

module.exports = router;
