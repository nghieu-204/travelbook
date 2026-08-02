const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUser } = require('../../controllers/user/bookingController');
// Public & user routes
router.post('/bookings', createBooking);
router.get('/bookings/user/:userId', getBookingsByUser);

module.exports = router;
