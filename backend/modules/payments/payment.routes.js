const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

// VNPay Routes
router.post('/payments/vnpay-url', paymentController.createVNPayPayment);
router.post('/payments/vnpay-ipn', paymentController.vnpayIpn);
router.get('/payments/vnpay-ipn', paymentController.vnpayIpn);
router.get('/payments/vnpay-return', paymentController.vnpayReturn);

module.exports = router;
