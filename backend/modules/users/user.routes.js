const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { updateProfile, getProfile, changePassword, uploadAvatar } = require('./user.user.controller');
const { getAllUsers, updateUserStatus, resetUserPassword, getUserDetails, updateUserDetails } = require('./user.admin.controller');
const { verifyToken } = require('../../middlewares/userAuth');
const { verifyAdmin } = require('../../middlewares/adminAuth');

// -- Multer Config --
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/avatars/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// -- User Routes --
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/profile/password', verifyToken, changePassword);
router.post('/profile/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

// -- Admin Routes --
router.get('/admin/users', verifyToken, verifyAdmin, getAllUsers);
router.get('/admin/users/:id/details', verifyToken, verifyAdmin, getUserDetails);
router.put('/admin/users/:id', verifyToken, verifyAdmin, updateUserDetails);
router.put('/admin/users/:id/status', verifyToken, verifyAdmin, updateUserStatus);
router.post('/admin/users/:id/reset-password', verifyToken, verifyAdmin, resetUserPassword);

module.exports = router;
