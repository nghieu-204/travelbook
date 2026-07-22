const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, activateUser, deleteUser, updateProfile } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Admin protected routes for User management
router.get('/admin/users', verifyToken, verifyAdmin, getAllUsers);
router.put('/admin/users/:id/status', verifyToken, verifyAdmin, updateUserStatus);
router.put('/admin/users/:id/activate', verifyToken, verifyAdmin, activateUser);
router.delete('/admin/users/:id', verifyToken, verifyAdmin, deleteUser);

// Profile routes (for logged in admin/user)
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
