/**
 * Product Controller  –  Module 3: Product Management
 * -------------------------------------------------
 * Routes:
 *   GET  /api/products           → getApprovedProducts()   [buyer/seller/admin]
 *   GET  /api/products/:id       → getProductById()        [authenticated]
 *   GET  /api/products/my        → getMyProducts()         [seller]
 *   GET  /api/products/all       → getAllProducts()        [admin]
 *   POST /api/products           → createProduct()         [seller]
 *   PUT  /api/products/:id       → updateProduct()         [seller — own product]
 *   DELETE /api/products/:id     → deleteProduct()         [seller — own product]
 *   PUT  /api/products/:id/status → updateProductStatus()  [admin]
 * -------------------------------------------------
 */

const Product = require('../models/Product');
const { validateBase64Images } = require('../utils/imageUtils');

// ─── Get Approved Products (Buyer feed) ───────────
/**
 * GET /api/products
 * Query params:
 *   ?search=keyword   → text search on title/description
 *   ?category=name    → filter by category
 *   ?page=1&limit=20  → pagination
 *
 * Returns only 'approved' products — buyers see this.
 */
const getApprovedProducts = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip     = (page - 1) * limit;
    const search   = req.query.search?.trim()     || '';
    const category = req.query.category?.trim()   || '';

    // Build query — always filter by approved status
    const query = { status: 'approved' };
    if (search)   query.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (category) query.category = { $regex: category, $options: 'i' };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    console.log(`[Product] Approved products fetched → count: ${products.length}, page: ${page}, search: "${search}", category: "${category}"`);
    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Product] getApprovedProducts error:', err.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// ─── Get Single Product by ID ─────────────────────
/**
 * GET /api/products/:id
 * Returns a single product (any status) — used for detail view.
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email avatar');
    if (!product) {
      console.warn(`[Product] getProductById: not found → id: ${req.params.id}`);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log(`[Product] Product fetched → id: ${product._id}, title: "${product.title}"`);
    res.json(product);
  } catch (err) {
    console.error('[Product] getProductById error:', err.message);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// ─── Get Seller's Own Products ────────────────────
/**
 * GET /api/products/my
 * Returns all products belonging to the logged-in seller.
 * Includes all statuses (pending, approved, rejected).
 */
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    console.log(`[Product] Seller products fetched → sellerId: ${req.user._id}, count: ${products.length}`);
    res.json(products);
  } catch (err) {
    console.error('[Product] getMyProducts error:', err.message);
    res.status(500).json({ message: 'Server error fetching your products' });
  }
};

// ─── Get All Products (Admin) ─────────────────────
/**
 * GET /api/products/all
 * Admin only — returns all products with optional status filter.
 * Query: ?status=pending|approved|rejected&page=1&limit=20
 */
const getAllProducts = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip   = (page - 1) * limit;
    const validStatuses = ['pending', 'approved', 'rejected'];
    const query  = (req.query.status && validStatuses.includes(req.query.status))
      ? { status: req.query.status }
      : {};

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    console.log(`[Product] Admin fetched all products → total: ${total}, page: ${page}, statusFilter: "${req.query.status || 'all'}"`);
    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Product] getAllProducts error:', err.message);
    res.status(500).json({ message: 'Server error fetching all products' });
  }
};

// ─── Create Product ───────────────────────────────
/**
 * POST /api/products
 * Body: { title, description, price, category, images? }
 *   images: array of base64 data URIs (up to 5, each max 1MB)
 *   e.g. ["data:image/jpeg;base64,...", ...]
 *
 * - Validates required fields and base64 images
 * - Status defaults to 'pending' (awaits admin approval)
 */
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, images } = req.body;

    // ── Input validation ──
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!price || isNaN(price) || Number(price) < 1) {
      return res.status(400).json({ message: 'Price must be at least ₹1' });
    }

    // ── Validate base64 images ──
    const imgResult = validateBase64Images(images || []);
    if (!imgResult.valid) {
      return res.status(400).json({ message: imgResult.error });
    }

    const product = await Product.create({
      seller:      req.user._id,
      title:       title.trim(),
      description: description.trim(),
      price:       Number(price),
      category:    category?.trim() || 'General',
      images:      imgResult.images, // stored as base64 data URIs
    });

    console.log(`[Product] Product created → id: ${product._id}, title: "${product.title}", seller: ${req.user._id}, images: ${imgResult.images.length}`);
    res.status(201).json(product);
  } catch (err) {
    console.error('[Product] createProduct error:', err.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// ─── Update Product ───────────────────────────────
/**
 * PUT /api/products/:id
 * Body: { title?, description?, price?, category?, images? }
 *   images: optional array of base64 data URIs to replace existing images
 *
 * - Seller can only edit their own products
 * - Editing resets status to 'pending' (re-review required)
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) {
      console.warn(`[Product] updateProduct: not found or unauthorized → id: ${req.params.id}, seller: ${req.user._id}`);
      return res.status(404).json({ message: 'Product not found or you are not the seller' });
    }

    const { title, description, price, category, images } = req.body;

    // ── Validate provided fields ──
    if (price !== undefined && (isNaN(price) || Number(price) < 1)) {
      return res.status(400).json({ message: 'Price must be at least ₹1' });
    }

    // ── Validate images if provided ──
    if (images !== undefined) {
      const imgResult = validateBase64Images(images);
      if (!imgResult.valid) {
        return res.status(400).json({ message: imgResult.error });
      }
      product.images = imgResult.images;
    }

    // ── Apply text updates ──
    if (title)       product.title       = title.trim();
    if (description) product.description = description.trim();
    if (price)       product.price       = Number(price);
    if (category)    product.category    = category.trim();

    // ── Reset to pending so admin re-reviews the edited product ──
    const wasApproved = product.status === 'approved';
    product.status = 'pending';

    await product.save();

    console.log(`[Product] Product updated → id: ${product._id}, title: "${product.title}", wasApproved: ${wasApproved} → reset to pending`);
    res.json({ product, message: wasApproved ? 'Product updated and sent for re-approval' : 'Product updated' });
  } catch (err) {
    console.error('[Product] updateProduct error:', err.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// ─── Delete Product ───────────────────────────────
/**
 * DELETE /api/products/:id
 * Seller can only delete their own products.
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!product) {
      console.warn(`[Product] deleteProduct: not found or unauthorized → id: ${req.params.id}, seller: ${req.user._id}`);
      return res.status(404).json({ message: 'Product not found or you are not the seller' });
    }
    // Base64 images are stored in MongoDB — no filesystem cleanup needed

    console.log(`[Product] Product deleted → id: ${product._id}, title: "${product.title}", seller: ${req.user._id}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[Product] deleteProduct error:', err.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// ─── Update Product Status (Admin) ───────────────
/**
 * PUT /api/products/:id/status
 * Body: { status: 'approved' | 'rejected' }
 * Admin only — approves or rejects a pending product.
 */
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['approved', 'rejected'];

    if (!allowed.includes(status)) {
      console.warn(`[Product] updateProductStatus: invalid status → "${status}"`);
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('seller', 'name email');

    if (!product) {
      console.warn(`[Product] updateProductStatus: product not found → id: ${req.params.id}`);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log(`[Product] Status updated by admin → id: ${product._id}, title: "${product.title}", status: ${status}, admin: ${req.user._id}`);
    res.json(product);
  } catch (err) {
    console.error('[Product] updateProductStatus error:', err.message);
    res.status(500).json({ message: 'Server error updating product status' });
  }
};

module.exports = {
  getApprovedProducts,
  getProductById,
  getMyProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
};
