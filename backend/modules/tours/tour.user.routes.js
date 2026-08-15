const express = require('express');
const router = express.Router();
const {
    getTours, getTourById, seedData,
    getMetadata, getFiltersMetadata
} = require('./tour.user.controller');
const { getHierarchy } = require('./location.controller');

// Public routes
router.get('/tours', getTours);

// Advanced Filter Metadata
router.get('/tours/filters-metadata', getFiltersMetadata);

router.get('/tours/:id', getTourById);
router.post('/seed', seedData);

// Location / Destination routes (Hybrid V1.5)
router.get('/metadata', getMetadata);
router.get('/locations/hierarchy', getHierarchy);

module.exports = router;
