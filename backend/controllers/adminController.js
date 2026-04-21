/**
 * Admin Controller  –  Module 7: Admin Panel
 * -------------------------------------------------
 * Provides aggregated analytics for the admin dashboard.
 *
 * Routes:
 *   GET /api/admin/analytics  → getAnalytics()  [admin only]
 *
 * Returns a single response with all platform stats:
 *   - User counts (total, buyers, sellers, blocked)
 *   - Product counts (total, pending, approved, rejected)
 *   - Order counts (total, by status)
 *   - Payment stats (total transactions, total revenue)
 *   - Recent activity (last 5 of each entity)
 * -------------------------------------------------
 */

const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const Payment = require('../models/Payment');

// ─── Get Analytics ────────────────────────────────
/**
 * GET /api/admin/analytics
 * Runs all aggregations in parallel for performance.
 */
const getAnalytics = async (req, res) => {
  try {
    console.log(`[Admin] Analytics requested → adminId: ${req.user._id}`);

    const [
      // ── User stats ──
      totalUsers,
      buyerCount,
      sellerCount,
      blockedCount,

      // ── Product stats ──
      totalProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,

      // ── Order stats ──
      totalOrders,
      initiatedOrders,
      paymentPendingOrders,
      paidOrders,
      completedOrders,
      failedOrders,
      cancelledOrders,

      // ── Payment stats ──
      totalPayments,
      revenueAgg,

      // ── Recent activity ──
      recentUsers,
      recentProducts,
      recentOrders,
      recentPayments,
    ] = await Promise.all([
      // Users
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ isBlocked: true }),

      // Products
      Product.countDocuments(),
      Product.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'approved' }),
      Product.countDocuments({ status: 'rejected' }),

      // Orders
      Order.countDocuments(),
      Order.countDocuments({ status: 'initiated' }),
      Order.countDocuments({ status: 'payment_pending' }),
      Order.countDocuments({ status: 'paid' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'failed' }),
      Order.countDocuments({ status: 'cancelled' }),

      // Payments
      Payment.countDocuments({ status: 'paid' }),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Recent activity (last 5 each)
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt isBlocked'),
      Product.find().sort({ createdAt: -1 }).limit(5).select('title price status createdAt').populate('seller', 'name'),
      Order.find().sort({ createdAt: -1 }).limit(5).select('amount status createdAt').populate('buyer seller', 'name').populate('product', 'title'),
      Payment.find({ status: 'paid' }).sort({ createdAt: -1 }).limit(5).select('amount transactionId confirmedAt').populate('buyer seller', 'name').populate('product', 'title'),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const analytics = {
      users: {
        total:   totalUsers,
        buyers:  buyerCount,
        sellers: sellerCount,
        blocked: blockedCount,
      },
      products: {
        total:    totalProducts,
        pending:  pendingProducts,
        approved: approvedProducts,
        rejected: rejectedProducts,
      },
      orders: {
        total:           totalOrders,
        initiated:       initiatedOrders,
        payment_pending: paymentPendingOrders,
        paid:            paidOrders,
        completed:       completedOrders,
        failed:          failedOrders,
        cancelled:       cancelledOrders,
      },
      payments: {
        total:   totalPayments,
        revenue: totalRevenue,
      },
      recent: {
        users:    recentUsers,
        products: recentProducts,
        orders:   recentOrders,
        payments: recentPayments,
      },
    };

    console.log(`[Admin] Analytics compiled → users: ${totalUsers}, products: ${totalProducts}, orders: ${totalOrders}, revenue: ₹${totalRevenue}`);
    res.json(analytics);
  } catch (err) {
    console.error('[Admin] getAnalytics error:', err.message);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = { getAnalytics };
