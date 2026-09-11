const pool = require("../config/database");

module.exports = async (req, res, next) => {
    try {
        const partnerId = req.session?.eduprowPartnerId;

        if (!partnerId) {
            return res.status(401).json({ success: false, message: "Partner authentication required." });
        }

        const result = await pool.query(
            `SELECT id, full_name, email, phone, location, referral_code, status, created_at
             FROM eduprow_partners
             WHERE id = $1`,
            [partnerId]
        );

        const partner = result.rows[0];
        if (!partner || partner.status !== "active") {
            req.session.eduprowPartnerId = null;
            return res.status(401).json({ success: false, message: "Your partner account is not active." });
        }

        req.partner = partner;
        next();
    } catch (error) {
        next(error);
    }
};
