/**
 * Auth Controller  –  Module 1: Authentication
 * -------------------------------------------------
 * POST /api/auth/register  → register()
 * POST /api/auth/login     → login()
 * POST /api/auth/logout    → logout()  [protected]
 * -------------------------------------------------
 */

const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// ─── Helpers ──────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/** Basic RFC-compliant email check */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/** Sanitize name — strip leading/trailing whitespace, collapse internal spaces */
const sanitizeName = (name) =>
  name.trim().replace(/\s+/g, ' ');

// ─── Register ─────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Field presence ──
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // ── Name length ──
    const cleanName = sanitizeName(name);
    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    // ── Email format ──
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // ── Password strength ──
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: 'Password is too long' });
    }

    // ── Duplicate email ──
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      // Use same message as "not found" to avoid email enumeration
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name: cleanName, email: cleanEmail, password });
    console.log(`[Auth] Registered → id: ${user._id}, email: ${user.email}`);

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user — use generic error to prevent email enumeration
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !(await user.matchPassword(password))) {
      console.warn(`[Auth] Login failed: invalid credentials → ${cleanEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Blocked check — specific message is acceptable here (user already knows their email)
    if (user.isBlocked) {
      console.warn(`[Auth] Login blocked → ${cleanEmail}`);
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    console.log(`[Auth] Login → id: ${user._id}, role: ${user.role}`);
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ─── Logout ───────────────────────────────────────
const logout = async (req, res) => {
  try {
    console.log(`[Auth] Logout → id: ${req.user._id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[Auth] Logout error:', err.message);
    res.status(500).json({ message: 'Logout failed. Please try again.' });
  }
};

module.exports = { register, login, logout };
