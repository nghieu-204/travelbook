const express = require('express');
const router = express.Router();
const { getAllBookings, updateBookingStatus, updatePaymentStatus, updateBookingDetails, sendInvoiceManual } = require('../../controllers/admin/bookingController');
const { verifyAdmin } = require('../../middlewares/adminAuth');

router.get('/bookings', verifyAdmin, getAllBookings);
router.put('/bookings/:id', verifyAdmin, updateBookingDetails);
router.put('/bookings/:id/status', verifyAdmin, updateBookingStatus);
router.put('/bookings/:id/payment-status', verifyAdmin, updatePaymentStatus);
router.post('/bookings/:id/send-invoice', verifyAdmin, sendInvoiceManual);

module.exports = router;
