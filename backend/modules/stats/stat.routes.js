const express = require('express');
const router = express.Router();
const { getAdminStats, exportDashboardExcel } = require('./stat.controller');
const { verifyAdmin } = require('../../middlewares/adminAuth');

router.get('/stats', verifyAdmin, getAdminStats);
router.get('/reports/dashboard-summary', verifyAdmin, exportDashboardExcel);

module.exports = router;
