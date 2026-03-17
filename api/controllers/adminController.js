const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function createUser(req, res) {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be admin or user' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await userModel.findByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({
      name: name ? String(name).trim() : normalizedEmail.split('@')[0],
      email: normalizedEmail,
      passwordHash,
      role,
      subscriptionTier: role === 'admin' ? 'Admin' : 'trial',
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('ADMIN_CREATE_USER_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  createUser,
};
