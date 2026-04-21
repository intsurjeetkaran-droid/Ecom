/**
 * Auth Middleware  –  Module 1: Authentication
 * -------------------------------------------------
 * protect()  →  Verifies JWT and attaches req.user
 *               to every protected route.
 *
 * Usage:
 *   router.get('/profile', protect, handler)
 * -------------------------------------------------
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: protect
 *
 * 1. Reads Bearer token from Authorization header
 * 2. Verifies token signature and expiry
 * 3. Loads user from DB (excludes password)
 * 4. Blocks access if user is blocked
 * 5. Attaches user to req.user for downstream handlers
 */
const protect = async (req, res, next) => {
  // ── Extract token from header ──
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[Auth Middleware] No token provided');
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ── Verify token ──
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Load user from DB ──
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.warn(`[Auth Middleware] Token valid but user not found → id: ${decoded.id}`);
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // ── Blocked account check ──
    if (user.isBlocked) {
      console.warn(`[Auth Middleware] Blocked user attempted access → ${user.email}`);
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    // ── Attach user to request ──
    req.user = user;
    next();
  } catch (err) {
    // Handles TokenExpiredError, JsonWebTokenError, etc.
    console.warn(`[Auth Middleware] Token verification failed: ${err.message}`);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = { protect };
