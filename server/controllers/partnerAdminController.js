const pool = require("../config/database");

const getOverview = async (req, res, next) => {
    try {
        const [partners, leads, commissions, settings] = await Promise.all([
            pool.query(`SELECT p.id, p.full_name, p.email, p.phone, p.location, p.referral_code, p.status, p.created_at,
                (SELECT COUNT(*)::int FROM eduprow_partner_leads l WHERE l.partner_id = p.id) AS lead_count,
                (SELECT COUNT(*)::int FROM eduprow_partner_leads l WHERE l.partner_id = p.id AND l.status = 'converted') AS converted_count,
                (SELECT COALESCE(SUM(c.amount), 0)::numeric FROM eduprow_partner_commissions c WHERE c.partner_id = p.id AND c.status IN ('approved', 'paid')) AS earned_commission,
                (SELECT COALESCE(SUM(c.amount), 0)::numeric FROM eduprow_partner_commissions c WHERE c.partner_id = p.id AND c.status = 'paid') AS paid_commission
                FROM eduprow_partners p ORDER BY p.created_at DESC`),
            pool.query(`SELECT l.id, l.partner_id, p.full_name AS partner_name, l.school_name, l.contact_name, l.phone, l.email, l.location, l.student_count, l.status, l.created_at
                FROM eduprow_partner_leads l JOIN eduprow_partners p ON p.id = l.partner_id ORDER BY l.created_at DESC LIMIT 100`),
            pool.query(`SELECT c.id, c.partner_id, p.full_name AS partner_name, c.lead_id, l.school_name, c.amount, c.status, c.eligible_at, c.approved_at, c.paid_at, c.notes, c.created_at
                FROM eduprow_partner_commissions c JOIN eduprow_partners p ON p.id = c.partner_id LEFT JOIN eduprow_partner_leads l ON l.id = c.lead_id ORDER BY c.created_at DESC LIMIT 100`),
            pool.query("SELECT * FROM eduprow_partner_settings WHERE id = 1")
        ]);
        return res.json({ success: true, data: { partners: partners.rows, leads: leads.rows, commissions: commissions.rows, settings: settings.rows[0] || null } });
    } catch (error) { next(error); }
};

const getPartnerDetails = async (req, res, next) => {
    try {
        const partnerId = Number(req.params.id);
        if (!Number.isInteger(partnerId)) return res.status(400).json({ success: false, message: "Invalid partner ID." });

        const [partner, leads, commissions] = await Promise.all([
            pool.query(`SELECT p.id, p.full_name, p.email, p.phone, p.location, p.referral_code, p.status, p.created_at,
                (SELECT COUNT(*)::int FROM eduprow_partner_leads l WHERE l.partner_id = p.id) AS lead_count,
                (SELECT COUNT(*)::int FROM eduprow_partner_leads l WHERE l.partner_id = p.id AND l.status = 'converted') AS converted_count,
                (SELECT COALESCE(SUM(c.amount), 0)::numeric FROM eduprow_partner_commissions c WHERE c.partner_id = p.id AND c.status IN ('approved', 'paid')) AS earned_commission,
                (SELECT COALESCE(SUM(c.amount), 0)::numeric FROM eduprow_partner_commissions c WHERE c.partner_id = p.id AND c.status = 'paid') AS paid_commission
                FROM eduprow_partners p WHERE p.id = $1`, [partnerId]),
            pool.query(`SELECT id, partner_id, school_name, contact_name, phone, email, location, student_count, notes, status, created_at, updated_at
                FROM eduprow_partner_leads WHERE partner_id = $1 ORDER BY created_at DESC`, [partnerId]),
            pool.query(`SELECT c.id, c.partner_id, c.lead_id, l.school_name, c.amount, c.status, c.eligible_at, c.approved_at, c.paid_at, c.notes, c.created_at, c.updated_at
                FROM eduprow_partner_commissions c LEFT JOIN eduprow_partner_leads l ON l.id = c.lead_id
                WHERE c.partner_id = $1 ORDER BY c.created_at DESC`, [partnerId])
        ]);

        if (!partner.rows[0]) return res.status(404).json({ success: false, message: "Partner not found." });
        return res.json({ success: true, data: { partner: partner.rows[0], leads: leads.rows, commissions: commissions.rows } });
    } catch (error) { next(error); }
};

const setPartnerStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["pending", "active", "suspended"].includes(status)) return res.status(400).json({ success: false, message: "Invalid partner status." });
        const result = await pool.query("UPDATE eduprow_partners SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, email, status", [status, req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ success: false, message: "Partner not found." });
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) { next(error); }
};

const setLeadStatus = async (req, res, next) => {
    try {
        const allowed = ["submitted", "contacted", "demo_scheduled", "demo_completed", "negotiation", "converted", "lost"];
        const { status } = req.body;
        if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid lead status." });
        const result = await pool.query("UPDATE eduprow_partner_leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, school_name, status", [status, req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ success: false, message: "Lead not found." });
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) { next(error); }
};

const createCommission = async (req, res, next) => {
    try {
        const partnerId = Number(req.body.partner_id);
        const leadId = req.body.lead_id ? Number(req.body.lead_id) : null;
        const amount = Number(req.body.amount);
        if (!Number.isInteger(partnerId) || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Partner and a valid commission amount are required." });
        const partner = await pool.query("SELECT id FROM eduprow_partners WHERE id = $1", [partnerId]);
        if (!partner.rows[0]) return res.status(404).json({ success: false, message: "Partner not found." });
        if (leadId) {
            const lead = await pool.query("SELECT id, partner_id FROM eduprow_partner_leads WHERE id = $1", [leadId]);
            if (!lead.rows[0] || lead.rows[0].partner_id !== partnerId) return res.status(400).json({ success: false, message: "Selected lead does not belong to this partner." });
        }
        const result = await pool.query(`INSERT INTO eduprow_partner_commissions (partner_id, lead_id, amount, status, eligible_at) VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP) RETURNING *`, [partnerId, leadId, amount]);
        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) { next(error); }
};

const setCommissionStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["pending", "approved", "paid", "cancelled"].includes(status)) return res.status(400).json({ success: false, message: "Invalid commission status." });
        const fields = { approved: "approved_at", paid: "paid_at" };
        const timestampField = fields[status];
        const result = await pool.query(`UPDATE eduprow_partner_commissions SET status = $1, ${timestampField ? `${timestampField} = CURRENT_TIMESTAMP,` : ""} updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [status, req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ success: false, message: "Commission not found." });
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) { next(error); }
};

module.exports = { getOverview, getPartnerDetails, setPartnerStatus, setLeadStatus, createCommission, setCommissionStatus };