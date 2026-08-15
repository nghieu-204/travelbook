const express = require('express');
const router = express.Router();
const {
    createTour, updateTour, updateTourStatus, deleteTour,
    createCountry, updateCountry, deleteCountry,
    createRegion, updateRegion, deleteRegion,
    createDestination, updateDestination, deleteDestination,
    createLandmark, updateLandmark, deleteLandmark,
    createTag, updateTag, deleteTag
} = require('./tour.admin.controller');
const { verifyAdmin } = require('../../middlewares/adminAuth');

// Admin protected routes
router.post('/tours', verifyAdmin, createTour);
router.put('/tours/:id', verifyAdmin, updateTour);
router.put('/tours/:id/status', verifyAdmin, updateTourStatus);
router.delete('/tours/:id', verifyAdmin, deleteTour);

// Location / Region routes
router.post('/regions', verifyAdmin, createRegion);
router.put('/regions/:id', verifyAdmin, updateRegion);
router.delete('/regions/:id', verifyAdmin, deleteRegion);

// Location / Country routes
router.post('/countries', verifyAdmin, createCountry);
router.put('/countries/:id', verifyAdmin, updateCountry);
router.delete('/countries/:id', verifyAdmin, deleteCountry);

// Location / Destination routes
router.post('/destinations', verifyAdmin, createDestination);
router.put('/destinations/:id', verifyAdmin, updateDestination);
router.delete('/destinations/:id', verifyAdmin, deleteDestination);

// Location / Landmark routes
router.post('/landmarks', verifyAdmin, createLandmark);
router.put('/landmarks/:id', verifyAdmin, updateLandmark);
router.delete('/landmarks/:id', verifyAdmin, deleteLandmark);

// Tags routes
router.post('/tags', verifyAdmin, createTag);
router.put('/tags/:id', verifyAdmin, updateTag);
router.delete('/tags/:id', verifyAdmin, deleteTag);

module.exports = router;
