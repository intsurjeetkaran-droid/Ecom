/**
 * Payment Controller  –  Module 6: Payment (Manual UPI)
 * -------------------------------------------------
 * Routes:
 *   POST /api/payments/record          → recordPayment()         [seller — called after confirming]
 *   GET  /api/payments/order/:orderId  → getPaymentByOrder()     [buyer/seller/admin]
 *   GET  /api/payments/my              → getMyPayments()         [buyer or seller]
 *   GET  /api/payments                 → getAllPayments()         [admin]
 *   PUT  /api/payments/seller/details  → updatePaymentDetails()  [seller — save UPI/bank info]
 *   GET  /api/payments/seller/:sellerId → getSellerPaymentDetails() [authenticated — to show buyer where to pay]
 * -------------------------------------------------
 */

const Payment = require('../models/Payment');
const Order   = require('../models/Order');
const User    = require('../models/User');
const { validateBase64Image } = require('../utils/imageUtils');

// ─── Record Payment ───────────────────────────────
/**
 * POST /api/payments/record
 * Body: { orderId }
 *
 * Called internally after seller confirms payment via
 * PUT /api/orders/:id/verify (action: 'confirm').
 * Creates a permanent Payment record for audit trail.
 *
 * This is also exposed as an API so the order controller
 * can call it, or it can be triggered directly.
 */
const recordPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('buyer',   'name email')
      .populate('seller',  'name email')
      .populate('product', 'title price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only seller of this order can record payment
    if (order.seller._id.toString() !== req.user._id.toString()) {
      console.warn(`[Payment] recordPayment: unauthorized → orderId: ${orderId}, userId: ${req.user._id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ message: `Order must be in 'paid' status to record payment (current: ${order.status})` });
    }

    // Prevent duplicate payment records
    const existing = await Payment.findOne({ order: orderId });
    if (existing) {
      console.warn(`[Payment] recordPayment: duplicate attempt → orderId: ${orderId}`);
      return res.status(400).json({ message: 'Payment record already exists for this order' });
    }

    const payment = await Payment.create({
      order:         order._id,
      buyer:         order.buyer._id,
      seller:        order.seller._id,
      product:       order.product._id,
      amount:        order.amount,
      transactionId: order.paymentProof?.transactionId || '',
      screenshotB64: order.paymentProof?.screenshotB64 || '',
      sellerNote:    order.sellerNote || '',
      confirmedAt:   new Date(),
      status:        'paid',
    });

    console.log(`[Payment] Payment recorded → id: ${payment._id}, orderId: ${orderId}, amount: ₹${payment.amount}, buyer: ${order.buyer.name}`);
    res.status(201).json(payment);
  } catch (err) {
    console.error('[Payment] recordPayment error:', err.message);
    res.status(500).json({ message: 'Server error recording payment' });
  }
};

// ─── Get Payment by Order ─────────────────────────
/**
 * GET /api/payments/order/:orderId
 * Returns the payment record for a specific order.
 * Accessible by buyer, seller of that order, or admin.
 */
const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('buyer',   'name email')
      .populate('seller',  'name email')
      .populate('product', 'title price images')
      .populate('order',   'status createdAt');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found for this order' });
    }

    // Access control
    const isOwner = payment.buyer._id.toString()  === req.user._id.toString()
                 || payment.seller._id.toString() === req.user._id.toString()
                 || req.user.role === 'admin';

    if (!isOwner) {
      console.warn(`[Payment] getPaymentByOrder: unauthorized → orderId: ${req.params.orderId}, userId: ${req.user._id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (err) {
    console.error('[Payment] getPaymentByOrder error:', err.message);
    res.status(500).json({ message: 'Server error fetching payment' });
  }
};

// ─── Get My Payments ──────────────────────────────
/**
 * GET /api/payments/my
 * Returns payment history for the logged-in user.
 *   - Buyer  → payments they made
 *   - Seller → payments they received
 */
const getMyPayments = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    // Query by role
    const query = req.user.role === 'seller'
      ? { seller: req.user._id }
      : { buyer:  req.user._id };

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('buyer',   'name email')
        .populate('seller',  'name email')
        .populate('product', 'title price images')
        .populate('order',   'status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    console.log(`[Payment] My payments fetched → userId: ${req.user._id}, role: ${req.user.role}, count: ${payments.length}`);
    res.json({ payments, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Payment] getMyPayments error:', err.message);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};

// ─── Get All Payments (Admin) ─────────────────────
/**
 * GET /api/payments
 * Admin only — all payment records with optional status filter + pagination.
 * Query: ?status=paid|failed|refunded&page=1&limit=20
 */
const getAllPayments = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const validStatuses = ['paid', 'failed', 'refunded'];
    const query = (req.query.status && validStatuses.includes(req.query.status))
      ? { status: req.query.status }
      : {};

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('buyer',   'name email')
        .populate('seller',  'name email')
        .populate('product', 'title price')
        .populate('order',   'status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    // Compute total revenue for admin overview
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    console.log(`[Payment] Admin fetched all payments → total: ${total}, page: ${page}, revenue: ₹${totalRevenue}`);
    res.json({ payments, total, page, pages: Math.ceil(total / limit), totalRevenue });
  } catch (err) {
    console.error('[Payment] getAllPayments error:', err.message);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};

// ─── Update Seller Payment Details ───────────────
/**
 * PUT /api/payments/seller/details
 * Body: { upiId?, bankName?, accountNo?, ifscCode?, qrImageB64? }
 *   qrImageB64: optional base64 data URI of QR code image
 *
 * Seller saves their UPI/bank details so buyers know where to pay.
 */
const updatePaymentDetails = async (req, res) => {
  try {
    const { upiId, bankName, accountNo, ifscCode, qrImageB64 } = req.body;

    if (!upiId?.trim() && !bankName?.trim() && !accountNo?.trim()) {
      return res.status(400).json({ message: 'At least one payment detail (UPI ID or bank info) is required' });
    }

    // ── Validate QR image if provided ──
    let validatedQr = undefined;
    if (qrImageB64) {
      const imgResult = validateBase64Image(qrImageB64);
      if (!imgResult.valid) {
        return res.status(400).json({ message: `QR code: ${imgResult.error}` });
      }
      validatedQr = qrImageB64;
    }

    const updateData = {
      'paymentDetails.upiId':     upiId?.trim()     || '',
      'paymentDetails.bankName':  bankName?.trim()  || '',
      'paymentDetails.accountNo': accountNo?.trim() || '',
      'paymentDetails.ifscCode':  ifscCode?.trim()  || '',
    };
    if (validatedQr !== undefined) updateData['paymentDetails.qrImageB64'] = validatedQr;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    console.log(`[Payment] Seller payment details updated → sellerId: ${req.user._id}, upiId: "${upiId}"`);
    res.json({ message: 'Payment details updated', paymentDetails: user.paymentDetails });
  } catch (err) {
    console.error('[Payment] updatePaymentDetails error:', err.message);
    res.status(500).json({ message: 'Server error updating payment details' });
  }
};

// ─── Get Seller Payment Details ───────────────────
/**
 * GET /api/payments/seller/:sellerId
 * Returns a seller's UPI/bank details so the buyer knows where to pay.
 * Accessible by any authenticated user.
 */
const getSellerPaymentDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.sellerId)
      .select('name paymentDetails role');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    if (seller.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }

    console.log(`[Payment] Seller payment details fetched → sellerId: ${req.params.sellerId}`);
    res.json({ seller: seller.name, paymentDetails: seller.paymentDetails });
  } catch (err) {
    console.error('[Payment] getSellerPaymentDetails error:', err.message);
    res.status(500).json({ message: 'Server error fetching seller payment details' });
  }
};

module.exports = {
  recordPayment,
  getPaymentByOrder,
  getMyPayments,
  getAllPayments,
  updatePaymentDetails,
  getSellerPaymentDetails,
};
