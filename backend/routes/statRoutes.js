const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/statController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

router.get('/admin/stats', verifyToken, verifyAdmin, getAdminStats);

module.exports = router;
