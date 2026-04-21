/**
 * Payment Model  –  Module 6: Payment (Manual UPI)
 * -------------------------------------------------
 * Records a completed payment transaction.
 * A Payment record is created when the seller CONFIRMS
 * the buyer's payment proof (order status → 'paid').
 *
 * This is a permanent audit trail of all payments.
 *
 * Status:
 *   paid      → seller confirmed the payment
 *   failed    → seller rejected the payment
 *   refunded  → future use (manual refund tracking)
 *
 * Rules:
 *   - One Payment record per order
 *   - Created automatically when seller confirms
 *   - Admin can view all payment records
 * -------------------------------------------------
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
      unique: true, // one payment record per order
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    // UPI transaction ID submitted by buyer
    transactionId: {
      type: String,
      default: '',
      trim: true,
    },
    // Base64 data URI of payment screenshot uploaded by buyer
    screenshotB64: {
      type: String,
      default: '',
    },
    // Payment method used (UPI, bank transfer, etc.)
    method: {
      type: String,
      enum: ['upi', 'bank_transfer', 'cash', 'other'],
      default: 'upi',
    },
    status: {
      type: String,
      enum: ['paid', 'failed', 'refunded'],
      default: 'paid',
    },
    // Optional note from seller on confirmation
    sellerNote: {
      type: String,
      default: '',
    },
    // When seller confirmed the payment
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes for fast queries ──
paymentSchema.index({ buyer:  1, createdAt: -1 });
paymentSchema.index({ seller: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
