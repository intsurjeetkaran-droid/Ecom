/**
 * User Model
 * -------------------------------------------------
 * Represents a registered user in the marketplace.
 *
 * Roles:
 *   - buyer  → default role on registration
 *   - seller → buyer can upgrade to seller
 *   - admin  → created manually in DB
 *
 * Security:
 *   - Password is hashed with bcrypt before saving
 *   - matchPassword() is used for login comparison
 * -------------------------------------------------
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer', // every new user starts as a buyer
    },
    avatar: {
      type: String,
      default: '',
    },
    isBlocked: {
      type: Boolean,
      default: false, // admin can block/unblock users
    },
    // ── Seller payment details (UPI / bank) ──
    // Sellers fill this so buyers know where to pay
    paymentDetails: {
      upiId:      { type: String, default: '', trim: true },
      bankName:   { type: String, default: '', trim: true },
      accountNo:  { type: String, default: '', trim: true },
      ifscCode:   { type: String, default: '', trim: true },
      qrImageB64: { type: String, default: '' }, // base64 data URI of QR code image
    },
  },
  { timestamps: true }
);

// ─── Pre-save Hook ────────────────────────────────
// Hash password only when it is new or modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  console.log(`[User] Hashing password for: ${this.email}`);
  this.password = await bcrypt.hash(this.password, 10);
});

// ─── Instance Method ──────────────────────────────
// Compare plain-text password with stored hash during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
