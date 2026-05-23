/**
 * adminOnly — standalone admin-check middleware (CommonJS).
 *
 * Use this as a simpler alternative to authorizeRoles("ADMIN")
 * when you only need to gate a route for admins.
 *
 * Must be placed AFTER the `protect` middleware so that
 * `req.user` is already populated.
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        next();
    } else {
        res.status(403).json({
            message: "Access denied. Admin only.",
        });
    }
};

module.exports = { adminOnly };