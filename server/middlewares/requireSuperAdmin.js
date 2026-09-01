const ROLES = require("../config/roles");

/**
 * Allows access only to an EduCore platform Super Admin.
 * A Super Admin is intentionally not attached to a school.
 */
module.exports = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const roleName = req.user?.role_name;
    const schoolId = req.user?.school_id;

    if (roleName !== ROLES.SUPER_ADMIN || schoolId !== null) {
        return res.status(403).json({
            success: false,
            message: "Super Admin access required."
        });
    }

    return next();
};
