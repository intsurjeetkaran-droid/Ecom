/**
 * Order Model  –  Module 5: Order Management
 * -------------------------------------------------
 * Represents a purchase initiated by a buyer.
 *
 * Status flow (manual UPI payment):
 *
 *   initiated
 *     ↓  (buyer clicks "I Have Paid")
 *   payment_pending
 *     ↓  (seller confirms)       ↓  (seller rejects)
 *   paid                        failed
 *     ↓  (seller marks complete)
 *   completed
 *
 *   Any stage → cancelled  (buyer cancels before payment_pending)
 *
 * Rules:
 *   - Order created when buyer clicks "Buy Now"
 *   - Buyer submits payment proof → status: payment_pending
 *   - Seller manually verifies → paid or failed
 *   - Seller marks fulfilled → completed
 * -------------------------------------------------
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['initiated', 'payment_pending', 'paid', 'completed', 'failed', 'cancelled'],
      default: 'initiated',
    },
    // ── Payment proof (submitted by buyer) ──
    paymentProof: {
      transactionId: { type: String, default: '' },  // UPI transaction ID
      screenshotB64: { type: String, default: '' },  // base64 data URI of payment screenshot
      submittedAt:   { type: Date,   default: null },
    },
    // ── Seller note on verification ──
    sellerNote: {
      type: String,
      default: '',
    },
    // ── Timestamps for key events ──
    paidAt:      { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Indexes for fast role-based queries ──
orderSchema.index({ buyer:  1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
