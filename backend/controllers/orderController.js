/**
 * Order Controller  –  Module 5: Order Management
 * -------------------------------------------------
 * Routes:
 *   POST /api/orders                    → createOrder()          [buyer]
 *   GET  /api/orders/buyer              → getBuyerOrders()       [buyer]
 *   GET  /api/orders/seller             → getSellerOrders()      [seller]
 *   GET  /api/orders/:id                → getOrderById()         [buyer or seller of that order]
 *   POST /api/orders/:id/submit-payment → submitPaymentProof()   [buyer]
 *   PUT  /api/orders/:id/verify         → verifyPayment()        [seller]
 *   PUT  /api/orders/:id/complete       → completeOrder()        [seller]
 *   PUT  /api/orders/:id/cancel         → cancelOrder()          [buyer — only if initiated]
 *   GET  /api/orders                    → getAllOrders()          [admin]
 *
 * Status flow:
 *   initiated → payment_pending → paid → completed
 *                              ↘ failed
 *   initiated → cancelled
 * -------------------------------------------------
 */

const Order   = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { validateBase64Image } = require('../utils/imageUtils');

// ─── Create Order ─────────────────────────────────
/**
 * POST /api/orders
 * Body: { productId }
 *
 * - Only buyers can create orders
 * - Product must be approved
 * - Buyer cannot order their own product (if they're also a seller)
 * - Creates order with status: 'initiated'
 */
const createOrder = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId).populate('seller', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.status !== 'approved') {
      return res.status(400).json({ message: 'Product is not available for purchase' });
    }
    if (product.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot order your own product' });
    }

    // ── Prevent duplicate active orders ──
    const existingOrder = await Order.findOne({
      buyer:   req.user._id,
      product: product._id,
      status:  { $in: ['initiated', 'payment_pending'] },
    });
    if (existingOrder) {
      return res.status(400).json({
        message: 'You already have an active order for this product',
        orderId: existingOrder._id,
      });
    }

    const order = await Order.create({
      buyer:   req.user._id,
      product: product._id,
      seller:  product.seller._id,
      amount:  product.price,
    });

    await order.populate([
      { path: 'product', select: 'title price images category' },
      { path: 'seller',  select: 'name email' },
    ]);

    console.log(`[Order] Created → id: ${order._id}, buyer: ${req.user._id}, product: "${product.title}", amount: ₹${product.price}`);
    res.status(201).json(order);
  } catch (err) {
    console.error('[Order] createOrder error:', err.message);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// ─── Get Buyer Orders ─────────────────────────────
/**
 * GET /api/orders/buyer
 * Returns all orders placed by the logged-in buyer, newest first.
 */
const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('product', 'title price images')
      .populate('seller',  'name')
      .sort({ createdAt: -1 });

    console.log(`[Order] Buyer orders fetched → buyerId: ${req.user._id}, count: ${orders.length}`);
    res.json(orders);
  } catch (err) {
    console.error('[Order] getBuyerOrders error:', err.message);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// ─── Get Seller Orders ────────────────────────────
/**
 * GET /api/orders/seller
 * Returns all orders for the logged-in seller's products, newest first.
 * Optional query: ?status=payment_pending
 */
const getSellerOrders = async (req, res) => {
  try {
    const query = { seller: req.user._id };
    if (req.query.status) query.status = req.query.status;

    const orders = await Order.find(query)
      .populate('product', 'title price images')
      .populate('buyer',   'name email')
      .sort({ createdAt: -1 });

    console.log(`[Order] Seller orders fetched → sellerId: ${req.user._id}, count: ${orders.length}, statusFilter: "${req.query.status || 'all'}"`);
    res.json(orders);
  } catch (err) {
    console.error('[Order] getSellerOrders error:', err.message);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// ─── Get Order By ID ──────────────────────────────
/**
 * GET /api/orders/:id
 * Returns a single order — accessible only by the buyer or seller of that order.
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'title price images category description')
      .populate('buyer',   'name email')
      .populate('seller',  'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Access control — only buyer or seller of this order
    const isOwner = order.buyer._id.toString()  === req.user._id.toString()
                 || order.seller._id.toString() === req.user._id.toString()
                 || req.user.role === 'admin';

    if (!isOwner) {
      console.warn(`[Order] getOrderById: unauthorized access → orderId: ${req.params.id}, userId: ${req.user._id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    console.error('[Order] getOrderById error:', err.message);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// ─── Submit Payment Proof ─────────────────────────
/**
 * POST /api/orders/:id/submit-payment
 * Body: { transactionId?, screenshotB64? }
 *   screenshotB64: optional base64 data URI of payment screenshot
 *
 * Buyer submits UPI transaction ID + optional base64 screenshot.
 * Order status → 'payment_pending' (awaits seller verification).
 */
const submitPaymentProof = async (req, res) => {
  try {
    const { transactionId, screenshotB64 } = req.body;

    // ── At least one proof required ──
    if (!transactionId?.trim() && !screenshotB64) {
      return res.status(400).json({ message: 'Transaction ID or payment screenshot is required' });
    }

    // ── Validate screenshot if provided ──
    let validatedScreenshot = '';
    if (screenshotB64) {
      const imgResult = validateBase64Image(screenshotB64);
      if (!imgResult.valid) {
        return res.status(400).json({ message: `Screenshot: ${imgResult.error}` });
      }
      validatedScreenshot = screenshotB64;
    }

    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }
    if (order.status !== 'initiated') {
      return res.status(400).json({ message: `Cannot submit payment for an order with status: ${order.status}` });
    }

    order.status = 'payment_pending';
    order.paymentProof = {
      transactionId:  transactionId?.trim() || '',
      screenshotB64:  validatedScreenshot,
      submittedAt:    new Date(),
    };
    await order.save();

    console.log(`[Order] Payment proof submitted → orderId: ${order._id}, buyer: ${req.user._id}, txId: "${transactionId}", hasScreenshot: ${!!validatedScreenshot}`);
    res.json({ message: 'Payment proof submitted. Waiting for seller verification.', order });
  } catch (err) {
    console.error('[Order] submitPaymentProof error:', err.message);
    res.status(500).json({ message: 'Server error submitting payment proof' });
  }
};

// ─── Verify Payment (Seller) ──────────────────────
/**
 * PUT /api/orders/:id/verify
 * Body: { action: 'confirm' | 'reject', note? }
 *
 * Seller confirms or rejects the buyer's payment proof.
 *   confirm → status: 'paid'
 *   reject  → status: 'failed'
 */
const verifyPayment = async (req, res) => {
  try {
    const { action, note } = req.body;

    if (!['confirm', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'action must be "confirm" or "reject"' });
    }

    const order = await Order.findOne({ _id: req.params.id, seller: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }
    if (order.status !== 'payment_pending') {
      return res.status(400).json({ message: `Order is not awaiting verification (status: ${order.status})` });
    }

    order.status     = action === 'confirm' ? 'paid' : 'failed';
    order.sellerNote = note?.trim() || '';
    if (action === 'confirm') order.paidAt = new Date();

    await order.save();

    // ── Auto-create Payment record when seller confirms ──
    if (action === 'confirm') {
      try {
        await Payment.create({
          order:         order._id,
          buyer:         order.buyer,
          seller:        req.user._id,
          product:       order.product,
          amount:        order.amount,
          transactionId: order.paymentProof?.transactionId || '',
          screenshotB64: order.paymentProof?.screenshotB64 || '',
          sellerNote:    note?.trim() || '',
          confirmedAt:   new Date(),
          status:        'paid',
        });
        console.log(`[Order] Payment record auto-created → orderId: ${order._id}`);
      } catch (payErr) {
        // Non-fatal — log but don't fail the verify response
        console.error(`[Order] Failed to auto-create payment record → orderId: ${order._id}:`, payErr.message);
      }
    }

    console.log(`[Order] Payment ${action}ed by seller → orderId: ${order._id}, seller: ${req.user._id}, newStatus: ${order.status}`);
    res.json({ message: `Payment ${action === 'confirm' ? 'confirmed' : 'rejected'}`, order });
  } catch (err) {
    console.error('[Order] verifyPayment error:', err.message);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
};

// ─── Complete Order (Seller) ──────────────────────
/**
 * PUT /api/orders/:id/complete
 * Seller marks the order as fulfilled/delivered.
 * Order must be in 'paid' status.
 */
const completeOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, seller: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }
    if (order.status !== 'paid') {
      return res.status(400).json({ message: `Order must be paid before completing (status: ${order.status})` });
    }

    order.status      = 'completed';
    order.completedAt = new Date();
    await order.save();

    console.log(`[Order] Order completed → orderId: ${order._id}, seller: ${req.user._id}`);
    res.json({ message: 'Order marked as completed', order });
  } catch (err) {
    console.error('[Order] completeOrder error:', err.message);
    res.status(500).json({ message: 'Server error completing order' });
  }
};

// ─── Cancel Order (Buyer) ─────────────────────────
/**
 * PUT /api/orders/:id/cancel
 * Buyer can cancel only if order is still 'initiated'.
 * Once payment proof is submitted, cancellation is not allowed.
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }
    if (order.status !== 'initiated') {
      return res.status(400).json({ message: `Cannot cancel an order with status: ${order.status}` });
    }

    order.status      = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    console.log(`[Order] Order cancelled → orderId: ${order._id}, buyer: ${req.user._id}`);
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    console.error('[Order] cancelOrder error:', err.message);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
};

// ─── Get All Orders (Admin) ───────────────────────
/**
 * GET /api/orders
 * Admin only — all orders with optional status filter + pagination.
 * Query: ?status=payment_pending&page=1&limit=20
 */
const getAllOrders = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const validStatuses = ['initiated', 'payment_pending', 'paid', 'completed', 'failed', 'cancelled'];
    const query = (req.query.status && validStatuses.includes(req.query.status))
      ? { status: req.query.status }
      : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyer',   'name email')
        .populate('seller',  'name email')
        .populate('product', 'title price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    console.log(`[Order] Admin fetched all orders → total: ${total}, page: ${page}, statusFilter: "${req.query.status || 'all'}"`);
    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Order] getAllOrders error:', err.message);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
};

module.exports = {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
  submitPaymentProof,
  verifyPayment,
  completeOrder,
  cancelOrder,
  getAllOrders,
};
