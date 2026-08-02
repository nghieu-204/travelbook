const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('../../controllers/user/userController');
const { verifyToken } = require('../../middlewares/userAuth');

// Profile routes (for logged in admin/user)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
