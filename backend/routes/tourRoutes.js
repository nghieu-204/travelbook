const express = require('express');
const router = express.Router();
const { 
  getTours, getTourById, seedData, createTour, updateTour, deleteTour, 
  getMetadata, createTourV2, getTourV2ById, updateTourV2,
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
router.delete('/tours/:id', verifyToken, verifyAdmin, deleteTour);

// V2 routes
router.get('/metadata', getMetadata);
router.get('/locations/hierarchy', getHierarchy);
router.get('/tours/v2/:id', getTourV2ById);
router.put('/tours/v2/:id', verifyToken, verifyAdmin, updateTourV2);
router.post('/tours/v2', verifyToken, verifyAdmin, createTourV2);
router.post('/destinations', verifyToken, verifyAdmin, createDestination);
router.put('/destinations/:id', verifyToken, verifyAdmin, updateDestination);
router.delete('/destinations/:id', verifyToken, verifyAdmin, deleteDestination);

router.post('/tags', verifyToken, verifyAdmin, createTag);
router.put('/tags/:id', verifyToken, verifyAdmin, updateTag);
router.delete('/tags/:id', verifyToken, verifyAdmin, deleteTag);

module.exports = router;
