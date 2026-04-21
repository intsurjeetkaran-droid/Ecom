/**
 * Admin Routes  –  Module 7: Admin Panel
 * -------------------------------------------------
 * GET /api/admin/analytics  → Full platform analytics  [admin only]
 * -------------------------------------------------
 */

const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { role }    = require('../middleware/roleMiddleware');
const { getAnalytics } = require('../controllers/adminController');

router.get('/analytics', protect, role('admin'), getAnalytics);

module.exports = router;
