const express = require('express');
const router = express.Router();
const recommendController = require('./recommend.controller');

// Route danh sách tour vừa xem gần đây
router.get('/suggestions/recently-viewed', recommendController.getRecentlyViewed);

// Route gợi ý tour cá nhân hóa theo ID người dùng / email
router.get('/suggestions/personalized', recommendController.getPersonalized);

// Route lấy top tour phổ biến nhất
router.get('/suggestions/popular', recommendController.getPopularRecommendations);

// Route lấy các tour liên quan đến 1 tour cụ thể
router.get('/suggestions/related/:tourId', recommendController.getRelatedTours);

// Route API Tracking hành vi người dùng
router.post('/suggestions/tracking', recommendController.trackInteraction);

module.exports = router;
