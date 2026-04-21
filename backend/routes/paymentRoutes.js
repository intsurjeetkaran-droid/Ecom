/**
 * Payment Routes  –  Module 6: Payment (Manual UPI)
 * -------------------------------------------------
 * All routes accept JSON (application/json).
 * QR code image is sent as base64 data URI in the body.
 * No file upload middleware — multer removed.
 *
 * POST /api/payments/record              → Record payment after seller confirms  [seller]
 * GET  /api/payments/my                  → My payment history                   [buyer/seller]
 * GET  /api/payments/order/:orderId      → Payment record for a specific order  [buyer/seller/admin]
 * PUT  /api/payments/seller/details      → Save UPI/bank/QR details             [seller]
 * GET  /api/payments/seller/:sellerId    → Get seller's payment details         [authenticated]
 * GET  /api/payments                     → All payments (paginated)             [admin]
 *
 * NOTE: Static routes must come BEFORE dynamic /:id routes.
 * -------------------------------------------------
 */

const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { role }    = require('../middleware/roleMiddleware');
const {
  recordPayment,
  getPaymentByOrder,
  getMyPayments,
  getAllPayments,
  updatePaymentDetails,
  getSellerPaymentDetails,
} = require('../controllers/paymentController');

// ── Static routes first ──
router.post('/record',          protect, role('seller'), recordPayment);
router.get('/my',               protect, getMyPayments);
router.put('/seller/details',   protect, role('seller'), updatePaymentDetails);
router.get('/seller/:sellerId', protect, getSellerPaymentDetails);
router.get('/order/:orderId',   protect, getPaymentByOrder);

// ── Admin ──
router.get('/', protect, role('admin'), getAllPayments);

module.exports = router;
