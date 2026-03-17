const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/change-password', auth, authController.changePassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
