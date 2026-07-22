const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUser, getAllBookings, updateBookingStatus, sendInvoiceManual } = require('../controllers/bookingController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Public & user routes
router.post('/bookings', createBooking);
router.get('/bookings/user/:userId', getBookingsByUser);

// Admin protected routes
router.get('/bookings', verifyToken, verifyAdmin, getAllBookings);
router.put('/bookings/:id/status', verifyToken, verifyAdmin, updateBookingStatus);
router.post('/bookings/:id/send-invoice', verifyToken, verifyAdmin, sendInvoiceManual);

module.exports = router;
