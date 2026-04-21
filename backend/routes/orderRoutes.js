/**
 * Order Routes  –  Module 5: Order Management
 * -------------------------------------------------
 * All routes accept JSON (application/json).
 * Payment screenshot is sent as base64 data URI in the body.
 * No file upload middleware — multer removed.
 *
 * POST /api/orders                    → Create order                [buyer]
 * GET  /api/orders/buyer              → Buyer's orders              [buyer]
 * GET  /api/orders/seller             → Seller's orders             [seller]
 * GET  /api/orders/:id                → Single order detail         [buyer/seller/admin]
 * POST /api/orders/:id/submit-payment → Submit payment proof        [buyer]
 * PUT  /api/orders/:id/verify         → Confirm or reject payment   [seller]
 * PUT  /api/orders/:id/complete       → Mark order as completed     [seller]
 * PUT  /api/orders/:id/cancel         → Cancel order                [buyer]
 * GET  /api/orders                    → All orders (paginated)      [admin]
 *
 * NOTE: Static routes (/buyer, /seller) must come BEFORE /:id
 * -------------------------------------------------
 */

const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { role }    = require('../middleware/roleMiddleware');
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
  submitPaymentProof,
  verifyPayment,
  completeOrder,
  cancelOrder,
  getAllOrders,
} = require('../controllers/orderController');

// ── Static routes first ──
router.get('/buyer',  protect, role('buyer'),  getBuyerOrders);
router.get('/seller', protect, role('seller'), getSellerOrders);

// ── Admin ──
router.get('/', protect, role('admin'), getAllOrders);

// ── Create ──
router.post('/', protect, role('buyer'), createOrder);

// ── Dynamic routes (JSON body — no file upload) ──
router.get('/:id',                 protect, getOrderById);
router.post('/:id/submit-payment', protect, role('buyer'),  submitPaymentProof);
router.put('/:id/verify',          protect, role('seller'), verifyPayment);
router.put('/:id/complete',        protect, role('seller'), completeOrder);
router.put('/:id/cancel',          protect, role('buyer'),  cancelOrder);

module.exports = router;
