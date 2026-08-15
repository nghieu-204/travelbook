const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    adminLogin, 
    sendOtp, 
    confirmResetPassword, 
    forgotPassword 
} = require('./auth.controller');

// User Auth Routes
router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', confirmResetPassword);
router.post('/forgot-password', forgotPassword);

// Admin Auth Routes
router.post('/admin/login', adminLogin);

module.exports = router;
