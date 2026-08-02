const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../../controllers/admin/statController');
const { verifyAdmin } = require('../../middlewares/adminAuth');

router.get('/stats', verifyAdmin, getAdminStats);

module.exports = router;
