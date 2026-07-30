const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUser, getAllBookings, updateBookingStatus, updatePaymentStatus, updateBookingDetails, sendInvoiceManual } = require('../controllers/bookingController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Public & user routes
router.post('/bookings', createBooking);
router.get('/bookings/user/:userId', getBookingsByUser);

// Admin protected routes
router.get('/bookings', verifyToken, verifyAdmin, getAllBookings);
router.put('/bookings/:id', verifyToken, verifyAdmin, updateBookingDetails);
router.put('/bookings/:id/status', verifyToken, verifyAdmin, updateBookingStatus);
router.put('/bookings/:id/payment-status', verifyToken, verifyAdmin, updatePaymentStatus);
router.post('/bookings/:id/send-invoice', verifyToken, verifyAdmin, sendInvoiceManual);

module.exports = router;
