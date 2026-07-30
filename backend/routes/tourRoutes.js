const express = require('express');
const router = express.Router();
const {
    getTours, getTourById, seedData, createTour, updateTour, updateTourStatus, deleteTour,
    getMetadata,
    createDestination, updateDestination, deleteDestination,
    createTag, updateTag, deleteTag
} = require('../controllers/tourController');
const { getHierarchy } = require('../controllers/locationController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Public routes
router.get('/tours', getTours);
router.get('/tours/:id', getTourById);
router.post('/seed', seedData);

// Admin protected routes
router.post('/tours', verifyToken, verifyAdmin, createTour);
router.put('/tours/:id', verifyToken, verifyAdmin, updateTour);
router.put('/tours/:id/status', verifyToken, verifyAdmin, updateTourStatus);
router.delete('/tours/:id', verifyToken, verifyAdmin, deleteTour);

// Location / Destination routes (Hybrid V1.5)
router.get('/metadata', getMetadata);
router.get('/locations/hierarchy', getHierarchy);
router.post('/destinations', verifyToken, verifyAdmin, createDestination);
router.put('/destinations/:id', verifyToken, verifyAdmin, updateDestination);
router.delete('/destinations/:id', verifyToken, verifyAdmin, deleteDestination);

// Tags routes
router.post('/tags', verifyToken, verifyAdmin, createTag);
router.put('/tags/:id', verifyToken, verifyAdmin, updateTag);
router.delete('/tags/:id', verifyToken, verifyAdmin, deleteTag);

module.exports = router;
