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
        const count = contactIds.length;

        // 1. Check Daily Limit (50/day)
        const [dailyCount] = await db.execute(
            'SELECT COUNT(*) as count FROM reveals WHERE user_id = ? AND DATE(revealed_at) = CURDATE()',
            [userId]
        );
        if (dailyCount[0].count + count > 50) {
            // Log High Severity Abuse Attempt
            await db.execute(
                'INSERT INTO security_logs (user_id, action, details, severity) VALUES (?, ?, ?, ?)',
                [userId, 'REVEAL_LIMIT_EXCEEDED', `Attempted to reveal ${count} contacts. Daily total would be ${dailyCount[0].count + count}`, 'high']
            );
            return res.status(403).json({ success: false, message: `Action would exceed daily reveal limit (50). Remaining: ${50 - dailyCount[0].count}` });
        }

        // 2. Check Points
        const [users] = await db.execute('SELECT points_balance FROM users WHERE id = ?', [userId]);
        if (users[0].points_balance < count) {
            return res.status(402).json({ success: false, message: `Insufficient points. ${count} points required.` });
        }

        // 3. Start Transaction for Atomic Reveal
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Deduct total points
            await conn.execute('UPDATE users SET points_balance = points_balance - ? WHERE id = ?', [count, userId]);

            // Insert reveal records (Ignore if already revealed)
            for (const contactId of contactIds) {
                await conn.execute(
                    'INSERT IGNORE INTO reveals (user_id, contact_id, points_used) VALUES (?, ?, 1)',
                    [userId, contactId]
                );
            }

            await conn.commit();

            // Fetch the full contact data for the revealed IDs
            const [revealedContacts] = await conn.query(
                'SELECT * FROM contacts WHERE id IN (?)',
                [contactIds]
            );

            res.json({ success: true, message: `${count} contacts revealed`, data: revealedContacts });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    } catch (e) {
        console.error('REVEAL ERROR:', e);
        res.status(500).json({ success: false, message: "Server error during reveal", error: e.message });
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
            JOIN contacts c ON r.contact_id = c.id
            JOIN companies co ON c.company_id = co.id
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
