const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('./user.user.controller');
const { getAllUsers, updateUserStatus, resetUserPassword, getUserDetails, updateUserDetails } = require('./user.admin.controller');
const { verifyToken } = require('../../middlewares/userAuth');
const { verifyAdmin } = require('../../middlewares/adminAuth');

// -- User Routes --
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// -- Admin Routes --
router.get('/admin/users', verifyToken, verifyAdmin, getAllUsers);
router.get('/admin/users/:id/details', verifyToken, verifyAdmin, getUserDetails);
router.put('/admin/users/:id', verifyToken, verifyAdmin, updateUserDetails);
router.put('/admin/users/:id/status', verifyToken, verifyAdmin, updateUserStatus);
router.post('/admin/users/:id/reset-password', verifyToken, verifyAdmin, resetUserPassword);

module.exports = router;
