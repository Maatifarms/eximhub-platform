const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Signup Logic
router.post('/signup', async (req, res) => {
    const { name, email, password, phone, country, company_name } = req.body;

    try {
        // Check if user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: "Email already registered" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user with Phase 1 logic: 100 points, trial tier
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, phone, country, company_name, points_balance, subscription_tier) VALUES (?, ?, ?, ?, ?, ?, 100, "trial")',
            [name || null, email, password_hash, phone || null, country || null, company_name || null]
        );

        const userId = result.insertId;
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ 
            success: true, 
            message: "Registration successful", 
            data: { id: userId, token, name, email, points_balance: 100, subscription_tier: "trial" } 
        });
    } catch (e) {
        console.error('SIGNUP ERROR:', e);
        res.status(500).json({ success: false, message: "Server error", error: e.message });
    }
});

// Login Logic
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            data: {
                id: user.id,
                token,
                name: user.name,
                email: user.email,
                points_balance: user.points_balance,
                subscription_tier: user.subscription_tier
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

const auth = require('../middleware/auth');

// Change Password
router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid current password" });

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        res.json({ success: true, message: "Password updated successfully" });
    } catch (e) {
        console.error('CHANGE_PASSWORD_ERROR:', e);
        res.status(500).json({ success: false, message: "Server error: " + e.message });
    }
});

// Reset Password (Mock/Stub for verification)
router.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ success: false, message: "Email not found" });

        // In a real app, send email here. For local setup, we just confirm logic.
        res.json({ success: true, message: "Password reset link sent to " + email });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
