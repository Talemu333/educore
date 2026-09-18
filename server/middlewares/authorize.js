const normalizeRole = (role) => {
    const normalized = String(role || "").trim().toLowerCase();
    return normalized === "administrator" ? "admin" : normalized;
};

module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }

        const userRole = normalizeRole(req.user.role_name);

        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: "User role is missing."
            });
        }

        const permittedRoles = allowedRoles
            .filter(role => typeof role === "string" && role.trim() !== "")
            .map(normalizeRole);

        if (!permittedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        next();
    };
};