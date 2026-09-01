const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createTour, updateTour, updateTourStatus, deleteTour, uploadTourImages, uploadItineraryImages,
    createCountry, updateCountry, deleteCountry,
    createRegion, updateRegion, deleteRegion,
    createDestination, updateDestination, deleteDestination,
    createLandmark, updateLandmark, deleteLandmark,
    createTag, updateTag, deleteTag
} = require('./tour.admin.controller');
const { verifyAdmin } = require('../../middlewares/adminAuth');

// -- Multer Config cho Tour Images --
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/tours/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'tour-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Chỉ hỗ trợ file ảnh (jpeg, jpg, png, webp)!"));
    }
});

// -- Multer Config cho Itinerary Images --
const itineraryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        const dir = path.join(__dirname, '../../uploads/tours/itinerary/');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'itin-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadItinerary = multer({ 
    storage: itineraryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: upload.fileFilter
});

// Admin protected routes
router.post('/tours/upload-images', verifyAdmin, upload.array('images', 20), uploadTourImages);
router.post('/tours/upload-itinerary-images', verifyAdmin, uploadItinerary.array('images', 20), uploadItineraryImages);
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
