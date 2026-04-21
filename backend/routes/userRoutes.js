/**
 * User Routes  –  Module 2: User Management
 * -------------------------------------------------
 * GET  /api/users/profile        → View own profile       [authenticated]
 * PUT  /api/users/profile        → Edit own profile       [authenticated]
 * PUT  /api/users/become-seller  → Upgrade role to seller [buyer only]
 * GET  /api/users                → List all users         [admin only]
 * PUT  /api/users/:id/block      → Block / unblock user   [admin only]
 * -------------------------------------------------
 */

const express = require('express');
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  becomeSeller,
  getAllUsers,
  toggleBlock,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { role }    = require('../middleware/roleMiddleware');

// ── Authenticated user routes ──
router.get('/profile',       protect, getProfile);
router.put('/profile',       protect, updateProfile);

// ── Buyer → Seller upgrade (buyers only) ──
// Note: /become-seller must be defined BEFORE /:id routes to avoid conflict
router.put('/become-seller', protect, role('buyer'), becomeSeller);

// ── Admin-only routes ──
router.get('/',              protect, role('admin'), getAllUsers);
router.put('/:id/block',     protect, role('admin'), toggleBlock);

module.exports = router;
