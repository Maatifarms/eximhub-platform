const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      subscription_tier: user.subscription_tier,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};
