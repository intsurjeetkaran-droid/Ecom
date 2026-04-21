/**
 * User Controller  –  Module 2: User Management
 * -------------------------------------------------
 * Handles profile viewing, editing, role upgrade,
 * and admin-level user management (block/unblock).
 *
 * Routes:
 *   GET  /api/users/profile        → getProfile()      [any authenticated user]
 *   PUT  /api/users/profile        → updateProfile()   [any authenticated user]
 *   PUT  /api/users/become-seller  → becomeSeller()    [buyer only]
 *   GET  /api/users                → getAllUsers()      [admin only]
 *   PUT  /api/users/:id/block      → toggleBlock()     [admin only]
 * -------------------------------------------------
 */

const User = require('../models/User');

// ─── Get Profile ──────────────────────────────────
/**
 * GET /api/users/profile
 * Returns the currently authenticated user's profile.
 * Password is already excluded by the protect middleware.
 */
const getProfile = async (req, res) => {
  try {
    console.log(`[User] Get profile → id: ${req.user._id}, email: ${req.user.email}`);
    res.json(req.user);
  } catch (err) {
    console.error('[User] getProfile error:', err.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// ─── Update Profile ───────────────────────────────
/**
 * PUT /api/users/profile
 * Body: { name?, avatar? }
 *
 * - Only name and avatar can be updated here
 * - Email and role changes are not allowed via this endpoint
 */
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    // ── Validation ──
    if (!name || !name.trim()) {
      console.warn(`[User] updateProfile failed: name is required → id: ${req.user._id}`);
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), avatar: avatar || req.user.avatar },
      { new: true, runValidators: true }
    ).select('-password');

    console.log(`[User] Profile updated → id: ${updatedUser._id}, name: ${updatedUser.name}`);
    res.json(updatedUser);
  } catch (err) {
    console.error('[User] updateProfile error:', err.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// ─── Become Seller ────────────────────────────────
/**
 * PUT /api/users/become-seller
 *
 * - Only buyers can upgrade to seller
 * - Sellers and admins are rejected
 * - One account = one role at a time (per guide rules)
 */
const becomeSeller = async (req, res) => {
  try {
    // ── Role guard ──
    if (req.user.role !== 'buyer') {
      console.warn(`[User] becomeSeller rejected: already ${req.user.role} → id: ${req.user._id}`);
      return res.status(400).json({
        message: `You are already a ${req.user.role}. Only buyers can upgrade to seller.`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { role: 'seller' },
      { new: true }
    ).select('-password');

    console.log(`[User] Role upgraded to seller → id: ${updatedUser._id}, email: ${updatedUser.email}`);
    res.json({ message: 'Congratulations! You are now a seller.', user: updatedUser });
  } catch (err) {
    console.error('[User] becomeSeller error:', err.message);
    res.status(500).json({ message: 'Server error upgrading role' });
  }
};

// ─── Get All Users (Admin) ────────────────────────
/**
 * GET /api/users
 * Admin only — returns all users with pagination support.
 * Query params: ?page=1&limit=20&search=name&role=buyer|seller
 */
const getAllUsers = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const skip   = (page - 1) * limit;
    const search = req.query.search?.trim() || '';
    const role   = req.query.role?.trim()   || '';

    // Build query
    const query = {};
    if (role && ['buyer', 'seller', 'admin'].includes(role)) query.role = role;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    console.log(`[User] Admin fetched users → total: ${total}, page: ${page}, search: "${search}", role: "${role}"`);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[User] getAllUsers error:', err.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// ─── Toggle Block (Admin) ─────────────────────────
/**
 * PUT /api/users/:id/block
 * Admin only — toggles the isBlocked flag on a user.
 *
 * Rules:
 *   - Admin cannot block themselves
 *   - Admin cannot block other admins
 */
const toggleBlock = async (req, res) => {
  try {
    // ── Prevent self-block ──
    if (req.params.id === req.user._id.toString()) {
      console.warn(`[User] toggleBlock rejected: admin tried to block themselves → id: ${req.user._id}`);
      return res.status(400).json({ message: 'You cannot block your own account' });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      console.warn(`[User] toggleBlock: user not found → id: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // ── Prevent blocking another admin ──
    if (target.role === 'admin') {
      console.warn(`[User] toggleBlock rejected: cannot block admin → id: ${target._id}`);
      return res.status(403).json({ message: 'Admin accounts cannot be blocked' });
    }

    target.isBlocked = !target.isBlocked;
    await target.save();

    const action = target.isBlocked ? 'blocked' : 'unblocked';
    console.log(`[User] User ${action} by admin → targetId: ${target._id}, email: ${target.email}`);
    res.json({ message: `User has been ${action}`, user: { id: target._id, email: target.email, isBlocked: target.isBlocked } });
  } catch (err) {
    console.error('[User] toggleBlock error:', err.message);
    res.status(500).json({ message: 'Server error toggling block status' });
  }
};

module.exports = { getProfile, updateProfile, becomeSeller, getAllUsers, toggleBlock };
