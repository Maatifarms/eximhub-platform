const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { sendSignupWelcomeEmail } = require('../services/emailService');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function buildAuthPayload(user) {
  const token = createToken(user);

  return {
    success: true,
    token,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points_balance: user.points_balance,
      subscription_tier: user.subscription_tier,
      token,
    },
  };
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
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
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
    });

    sendSignupWelcomeEmail(user).catch((emailError) => {
      console.error('SIGNUP_WELCOME_EMAIL_ERROR:', emailError);
    });

    return res.status(201).json(buildAuthPayload(user));
  } catch (error) {
    console.error('SIGNUP_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(normalizeEmail(email));
    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json(buildAuthPayload(user));
  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    const user = await userModel.findById(req.user.id);
    if (!user || !user.password_hash) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.id, newHash);

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('CHANGE_PASSWORD_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await userModel.findByEmail(normalizeEmail(email));
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    return res.json({ success: true, message: `Password reset link sent to ${user.email}` });
  } catch (error) {
    console.error('RESET_PASSWORD_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function googleLogin(req, res) {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    return res.status(501).json({
      success: false,
      message: 'Google login is prepared, but token verification/account linking is not implemented yet.',
      data: {
        googleTokenPreview: String(googleToken).slice(0, 12),
      },
    });
  } catch (error) {
    console.error('GOOGLE_LOGIN_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  changePassword,
  googleLogin,
  login,
  resetPassword,
  signup,
};
