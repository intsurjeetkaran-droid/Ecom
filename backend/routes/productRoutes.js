/**
 * Product Routes  –  Module 3: Product Management
 * -------------------------------------------------
 * All routes accept JSON (application/json).
 * Images are sent as base64 data URIs in the request body.
 * No file upload middleware — multer removed.
 *
 * GET    /api/products            → Approved products (buyer feed, paginated + search)
 * GET    /api/products/my         → Seller's own products
 * GET    /api/products/all        → All products (admin, paginated + status filter)
 * GET    /api/products/:id        → Single product by ID
 * POST   /api/products            → Create product (seller, base64 images in body)
 * PUT    /api/products/:id        → Edit product (seller — own only, resets to pending)
 * DELETE /api/products/:id        → Delete product (seller — own only)
 * PUT    /api/products/:id/status → Approve / reject (admin)
 *
 * IMPORTANT: Static routes (/my, /all) MUST be defined
 * before dynamic routes (/:id).
 * -------------------------------------------------
 */

const express  = require('express');
const router   = express.Router();
const {
  getApprovedProducts,
  getProductById,
  getMyProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { role }    = require('../middleware/roleMiddleware');

// ── Static routes first ──
router.get('/my',  protect, role('seller'), getMyProducts);
router.get('/all', protect, role('admin'),  getAllProducts);

// ── Authenticated routes ──
router.get('/',    protect, getApprovedProducts);
router.get('/:id', protect, getProductById);

// ── Seller routes (JSON body — no file upload) ──
router.post('/',          protect, role('seller'), createProduct);
router.put('/:id',        protect, role('seller'), updateProduct);
router.delete('/:id',     protect, role('seller'), deleteProduct);

// ── Admin routes ──
router.put('/:id/status', protect, role('admin'),  updateProductStatus);

module.exports = router;
