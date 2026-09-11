const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("../config/database");

const makeReferralCode = (name) => {
    const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 8).toUpperCase() || "PARTNER";
    return `${prefix}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

const publicPartner = (partner) => ({
    id: partner.id,
    full_name: partner.full_name,
    email: partner.email,
    phone: partner.phone,
    location: partner.location,
    referral_code: partner.referral_code,
    status: partner.status,
    created_at: partner.created_at,
});

const register = async (req, res, next) => {
    try {
        const { full_name, email, phone, location, password } = req.body;

        if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !password) {
            return res.status(400).json({ success: false, message: "Full name, email, phone and password are required." });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = await pool.query("SELECT id FROM eduprow_partners WHERE LOWER(email) = $1", [normalizedEmail]);
        if (existing.rows.length) {
            return res.status(409).json({ success: false, message: "A partner account already exists with this email." });
        }

        let referralCode = makeReferralCode(full_name);
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const collision = await pool.query("SELECT id FROM eduprow_partners WHERE referral_code = $1", [referralCode]);
            if (!collision.rows.length) break;
            referralCode = makeReferralCode(full_name);
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            `INSERT INTO eduprow_partners (full_name, email, phone, location, password_hash, referral_code, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'active')
             RETURNING id, full_name, email, phone, location, referral_code, status, created_at`,
            [full_name.trim(), normalizedEmail, phone.trim(), location?.trim() || null, passwordHash, referralCode]
        );

        req.session.eduprowPartnerId = result.rows[0].id;
        return res.status(201).json({ success: true, data: publicPartner(result.rows[0]) });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email?.trim() || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const result = await pool.query("SELECT * FROM eduprow_partners WHERE LOWER(email) = $1", [email.trim().toLowerCase()]);
        const partner = result.rows[0];
        if (!partner || !(await bcrypt.compare(password, partner.password_hash))) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        if (partner.status !== "active") {
            return res.status(403).json({ success: false, message: "Your partner account is not active." });
        }

        req.session.eduprowPartnerId = partner.id;
        return res.json({ success: true, data: publicPartner(partner) });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res, next) => {
    req.session.eduprowPartnerId = null;
    req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.json({ success: true });
    });
};

const me = async (req, res) => {
    return res.json({ success: true, data: req.partner });
};

const getDashboard = async (req, res, next) => {
    try {
        const [leadStats, commissionStats, recentLeads, settings] = await Promise.all([
            pool.query(
                `SELECT COUNT(*)::int AS total,
                        COUNT(*) FILTER (WHERE status = 'converted')::int AS converted
                 FROM eduprow_partner_leads WHERE partner_id = $1`,
                [req.partner.id]
            ),
            pool.query(
                `SELECT COALESCE(SUM(amount), 0)::numeric AS total,
                        COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0)::numeric AS approved,
                        COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::numeric AS paid
                 FROM eduprow_partner_commissions WHERE partner_id = $1`,
                [req.partner.id]
            ),
            pool.query(
                `SELECT id, school_name, contact_name, location, status, created_at
                 FROM eduprow_partner_leads
                 WHERE partner_id = $1 ORDER BY created_at DESC LIMIT 10`,
                [req.partner.id]
            ),
            pool.query("SELECT programme_name, commission_type, commission_rate, commission_fixed_amount, commission_eligibility FROM eduprow_partner_settings WHERE id = 1")
        ]);

        return res.json({
            success: true,
            data: {
                partner: req.partner,
                stats: {
                    leads: leadStats.rows[0].total,
                    converted: leadStats.rows[0].converted,
                    commission: commissionStats.rows[0].total,
                    approved_commission: commissionStats.rows[0].approved,
                    paid_commission: commissionStats.rows[0].paid,
                },
                recent_leads: recentLeads.rows,
                programme: settings.rows[0] || null,
            }
        });
    } catch (error) {
        next(error);
    }
};

const createLead = async (req, res, next) => {
    try {
        const { school_name, contact_name, phone, email, location, student_count, notes } = req.body;
        if (!school_name?.trim()) {
            return res.status(400).json({ success: false, message: "School name is required." });
        }

        const result = await pool.query(
            `INSERT INTO eduprow_partner_leads
             (partner_id, school_name, contact_name, phone, email, location, student_count, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, school_name, contact_name, phone, email, location, student_count, notes, status, created_at`,
            [req.partner.id, school_name.trim(), contact_name?.trim() || null, phone?.trim() || null,
                email?.trim().toLowerCase() || null, location?.trim() || null,
                Number.isFinite(Number(student_count)) ? Number(student_count) : null, notes?.trim() || null]
        );

        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, logout, me, getDashboard, createLead };
