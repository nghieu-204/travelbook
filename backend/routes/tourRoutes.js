const express = require('express');
const router = express.Router();
const { getTours, getTourById, seedData, createTour, updateTour, deleteTour } = require('../controllers/tourController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Public routes
router.get('/tours', getTours);
router.get('/tours/:id', getTourById);
router.post('/seed', seedData);

// Admin protected routes
router.post('/tours', verifyToken, verifyAdmin, createTour);
router.put('/tours/:id', verifyToken, verifyAdmin, updateTour);
router.delete('/tours/:id', verifyToken, verifyAdmin, deleteTour);

module.exports = router;
