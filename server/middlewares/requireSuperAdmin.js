const ROLES = require("../config/roles");

/**
 * Allows access only to an EduCore platform Super Admin.
 *
 * The users table currently requires school_id to be NOT NULL, so a
 * Super Admin may carry a placeholder/legacy school_id (for example 1).
 * Platform-level authorization must therefore be based on the role, not
 * on school_id. Super Admin actions that target a school must explicitly
 * provide the target school ID and are handled by the school-management
 * service.
 */
module.exports = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const roleName = req.user?.role_name;

    if (roleName !== ROLES.SUPER_ADMIN) {
        return res.status(403).json({
            success: false,
            message: "Super Admin access required."
        });
    }

    return next();
};
