/**
 * Role Middleware
 * -------------------------------------------------
 * Restricts route access to specific roles.
 *
 * Usage:
 *   router.post('/products', protect, role('seller'), handler)
 *   router.get('/users',     protect, role('admin'),  handler)
 * -------------------------------------------------
 */

/**
 * role(...allowedRoles)
 * Returns a middleware that checks req.user.role
 * against the list of allowed roles.
 */
const role = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    console.warn(
      `[Role Middleware] Access denied → user: ${req.user.email}, role: ${req.user.role}, required: [${allowedRoles.join(', ')}]`
    );
    return res.status(403).json({
      message: `Access denied — requires role: ${allowedRoles.join(' or ')}`,
    });
  }

  next();
};

module.exports = { role };
