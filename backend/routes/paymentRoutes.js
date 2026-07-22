const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route tạo mã QR thanh toán MoMo
router.post('/payments/momo-qr', paymentController.createMoMoPayment);

// Route xác nhận thanh toán trực tuyến thành công
router.post('/payments/confirm', paymentController.confirmOnlinePayment);

module.exports = router;
