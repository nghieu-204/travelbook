const express = require('express');
const router = express.Router();
const { register, login, sendOtp, confirmResetPassword, forgotPassword } = require('../../controllers/user/authController');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', confirmResetPassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;
