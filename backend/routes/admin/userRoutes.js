const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, resetUserPassword, getUserDetails, updateUserDetails } = require('../../controllers/admin/userController');
const { verifyAdmin } = require('../../middlewares/adminAuth');

router.get('/users', verifyAdmin, getAllUsers);
router.get('/users/:id/details', verifyAdmin, getUserDetails);
router.put('/users/:id', verifyAdmin, updateUserDetails);
router.put('/users/:id/status', verifyAdmin, updateUserStatus);
router.post('/users/:id/reset-password', verifyAdmin, resetUserPassword);

module.exports = router;
