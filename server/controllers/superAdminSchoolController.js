const schoolService = require("../services/superAdminSchoolService");

const getSchools = async (req, res, next) => {
    try {
        res.json({ success: true, data: await schoolService.getSchools() });
    } catch (error) { next(error); }
};

const getSchool = async (req, res, next) => {
    try {
        const school = await schoolService.getSchoolById(req.params.id);
        if (!school) return res.status(404).json({ success: false, message: "School not found." });
        res.json({ success: true, data: school });
    } catch (error) { next(error); }
};

const createSchool = async (req, res, next) => {
    try {
        const result = await schoolService.createSchool(req.body);
        res.status(201).json({ success: true, message: "School created successfully.", data: result });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ success: false, message: "The administrator username/email or another unique school value already exists." });
        }
        if (error.status) return res.status(error.status).json({ success: false, message: error.message });
        next(error);
    }
};

const createSchoolAdministrator = async (req, res, next) => {
    try {
        const administrator = await schoolService.createSchoolAdministrator(req.params.id, req.body);
        res.status(201).json({
            success: true,
            message: "School administrator account created successfully.",
            data: administrator
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists. Please use a different value."
            });
        }
        if (error.status) return res.status(error.status).json({ success: false, message: error.message });
        next(error);
    }
};

const updateSchool = async (req, res, next) => {
    try {
        const school = await schoolService.updateSchool(req.params.id, req.body);
        if (!school) return res.status(404).json({ success: false, message: "School not found." });
        res.json({ success: true, message: "School updated successfully.", data: school });
    } catch (error) { next(error); }
};

const setSchoolStatus = async (req, res, next) => {
    try {
        if (typeof req.body.is_active !== "boolean") {
            return res.status(400).json({ success: false, message: "is_active must be true or false." });
        }
        const school = await schoolService.setSchoolStatus(req.params.id, req.body.is_active);
        if (!school) return res.status(404).json({ success: false, message: "School not found." });
        res.json({ success: true, message: `School ${school.is_active ? "activated" : "deactivated"} successfully.`, data: school });
    } catch (error) { next(error); }
};

module.exports = {
    getSchools,
    getSchool,
    createSchool,
    createSchoolAdministrator,
    updateSchool,
    setSchoolStatus
};
