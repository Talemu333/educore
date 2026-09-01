const pool = require("../config/database");

const requireSuperAdmin = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        const result = await pool.query(`
            SELECT r.role_name
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE u.id = $1 AND u.is_active = TRUE
            LIMIT 1;
        `, [req.user.id]);

        if (!result.rows[0] || result.rows[0].role_name !== "Super Admin") {
            return res.status(403).json({ success: false, message: "Super Admin access required." });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = requireSuperAdmin;
