const express = require('express');
const router = express.Router();
const recommendController = require('./recommend.controller');

// Route gợi ý tour cá nhân hóa theo ID người dùng / email
router.get('/recommendations', recommendController.getRecommendations);

// Route lấy top tour phổ biến nhất
router.get('/recommendations/popular', recommendController.getPopularRecommendations);

// Route lấy các tour liên quan đến 1 tour cụ thể
router.get('/recommendations/related/:tourId', recommendController.getRelatedTours);

// Route API Tracking hành vi người dùng
router.post('/recommendations/tracking', recommendController.trackInteraction);

module.exports = router;
