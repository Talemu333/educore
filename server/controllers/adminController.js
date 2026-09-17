const adminService = require("../services/adminService");

const getAdmins = async (req, res, next) => {
    try {
        const schoolId = req.user?.school_id;
        if (!schoolId) return res.status(403).json({ success: false, message: "School context is required." });
        const administrators = await adminService.getAdmins(schoolId);
        res.json({ success: true, data: administrators });
    } catch (err) { next(err); }
};

const createAdministrator = async (req, res, next) => {
    try {
        const { username, email, admin_type } = req.body;
        const schoolId = req.user?.school_id;
        if (!schoolId) return res.status(403).json({ success: false, message: "School context is required." });
        if (!username || !admin_type) return res.status(400).json({ success: false, message: "Username and administrator type are required." });

        const allowedAdminTypes = ["principal", "vice_principal", "bursar", "librarian"];
        const normalizedAdminType = admin_type.trim().toLowerCase();
        if (!allowedAdminTypes.includes(normalizedAdminType)) {
            return res.status(400).json({ success: false, message: "Invalid administrator type." });
        }

        const administrator = await adminService.createAdministrator({
            username: username.trim(),
            email: email?.trim() || null,
            admin_type: normalizedAdminType,
            schoolId
        });

        res.status(201).json({
            success: true,
            message: "Administrator account created successfully.",
            data: administrator
        });
    } catch (err) {
        if (err.code === "23505") return res.status(409).json({ success: false, message: "Username or email already exists." });
        next(err);
    }
};

const activateAdministrator = async (req, res, next) => {
    try {
        const schoolId = req.user?.school_id;
        if (!schoolId) return res.status(403).json({ success: false, message: "School context is required." });
        const administrator = await adminService.activateAdministrator(req.params.id, schoolId);
        if (!administrator) return res.status(404).json({ success: false, message: "Administrator account not found." });
        res.json({ success: true, message: "Administrator account activated successfully.", data: administrator });
    } catch (err) { next(err); }
};

const deactivateAdministrator = async (req, res, next) => {
    try {
        const schoolId = req.user?.school_id;
        if (!schoolId) return res.status(403).json({ success: false, message: "School context is required." });
        const administrator = await adminService.deactivateAdministrator(req.params.id, schoolId);
        if (!administrator) return res.status(404).json({ success: false, message: "Administrator account not found or cannot be deactivated." });
        res.json({ success: true, message: "Administrator account deactivated successfully.", data: administrator });
    } catch (err) { next(err); }
};

module.exports = { getAdmins, createAdministrator, activateAdministrator, deactivateAdministrator };
