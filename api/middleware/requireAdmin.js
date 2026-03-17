module.exports = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.subscription_tier === 'Admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Admin access required',
  });
};
