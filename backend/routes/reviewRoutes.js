const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Route kiểm tra điều kiện đánh giá (chỉ sau khi đặt hàng và trải nghiệm)
router.get('/reviews/check-eligibility', reviewController.checkEligibility);

// Route lấy danh sách nhận xét của 1 tour
router.get('/reviews/tour/:tourId', reviewController.getReviewsByTour);

// Route gửi nhận xét & đánh giá mới
router.post('/reviews', reviewController.createReview);

module.exports = router;
