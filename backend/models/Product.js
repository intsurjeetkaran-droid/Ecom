/**
 * Product Model  –  Module 3: Product Management
 * -------------------------------------------------
 * Represents a product listed by a seller.
 *
 * Status flow:
 *   pending  → (admin approves) → approved  [visible to buyers]
 *   pending  → (admin rejects)  → rejected  [not visible]
 *   approved → (seller edits)   → pending   [re-review required]
 *
 * Rules:
 *   - Only sellers can create products
 *   - All products start as 'pending'
 *   - Only 'approved' products are visible to buyers
 * -------------------------------------------------
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [{ type: String }], // base64 data URIs (e.g. "data:image/jpeg;base64,...")
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // every new product awaits admin approval
    },
  },
  { timestamps: true }
);

// ── Index for fast approved-product queries with search ──
productSchema.index({ status: 1, title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
