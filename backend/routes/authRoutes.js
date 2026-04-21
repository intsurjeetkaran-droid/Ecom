/**
 * Auth Routes  –  Module 1: Authentication
 * -------------------------------------------------
 * POST /api/auth/register  → Register new user
 * POST /api/auth/login     → Login existing user
 * POST /api/auth/logout    → Logout (protected)
 * -------------------------------------------------
 */

const express  = require('express');
const router   = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Protected — requires valid JWT
// Client must delete token after this call
router.post('/logout', protect, logout);

module.exports = router;
