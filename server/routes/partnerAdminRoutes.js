const express = require("express");
const pool = require("../config/database");
const authenticate = require("../middlewares/authenticate");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");
const controller = require("../controllers/partnerAdminController");

const router = express.Router();
router.use(authenticate, requireSuperAdmin);

router.get("/overview", controller.getOverview);
router.get("/partners/:id", controller.getPartnerDetails);
router.patch("/partners/:id/status", controller.setPartnerStatus);
router.patch("/leads/:id/status", controller.setLeadStatus);
router.post("/commissions", controller.createCommission);
router.patch("/commissions/:id/status", controller.setCommissionStatus);

router.patch("/settings", async (req, res, next) => {
    try {
        const { programme_name, commission_type, commission_rate, commission_fixed_amount, commission_eligibility } = req.body;
        if (!programme_name?.trim()) return res.status(400).json({ success: false, message: "Programme name is required." });
        if (!["percentage", "fixed"].includes(commission_type)) return res.status(400).json({ success: false, message: "Invalid commission type." });
        const rate = Number(commission_rate);
        const fixedAmount = commission_fixed_amount === "" || commission_fixed_amount == null ? null : Number(commission_fixed_amount);
        if (commission_type === "percentage" && (!Number.isFinite(rate) || rate < 0 || rate > 100)) return res.status(400).json({ success: false, message: "Percentage commission must be between 0 and 100." });
        if (commission_type === "fixed" && (!Number.isFinite(fixedAmount) || fixedAmount < 0)) return res.status(400).json({ success: false, message: "Fixed commission must be zero or greater." });
        const result = await pool.query(`UPDATE eduprow_partner_settings
            SET programme_name = $1, commission_type = $2, commission_rate = $3, commission_fixed_amount = $4,
                commission_eligibility = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1 RETURNING *`, [programme_name.trim(), commission_type, Number.isFinite(rate) ? rate : 0, fixedAmount, commission_eligibility?.trim() || "Commission becomes eligible after EduProw confirms receipt of the qualifying payment from a referred school."]);
        if (!result.rows[0]) return res.status(404).json({ success: false, message: "Partner programme settings have not been initialized." });
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) { next(error); }
});

module.exports = router;