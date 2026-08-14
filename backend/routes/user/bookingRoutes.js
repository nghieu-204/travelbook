const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUser, cancelBooking } = require('../../controllers/user/bookingController');
// Public & user routes
router.post('/bookings', createBooking);
router.get('/bookings/user/:userId', getBookingsByUser);
router.post('/bookings/cancel/:id', cancelBooking);

module.exports = router;
