const { getSchoolDatabase } = require("../config/schoolDatabaseManager");
const { runWithSchoolDatabase } = require("../config/databaseContext");

module.exports = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    /*
    =========================================
    SUPER ADMIN SCHOOL MANAGEMENT CONTEXT
    =========================================

    A Super Admin has a platform-level account, but the users table still
    requires a school_id. When the Super Admin opens a specific school's
    management page, the frontend sends X-School-Id. For that request only,
    use the selected school as the request's school context so existing
    school-scoped controllers/services can be reused safely.

    Normal school users cannot override their school context because this is
    only honored when the authenticated user is a Super Admin.
    =========================================
    */
    const roleName = req.user?.role_name?.trim()?.toLowerCase();
    const requestedSchoolId = req.get("X-School-Id");

    if (roleName === "super admin" && requestedSchoolId) {
        const schoolId = Number(requestedSchoolId);

        if (!Number.isInteger(schoolId) || schoolId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid school context."
            });
        }

        req.user.school_id = schoolId;
        req.superAdminSchoolContext = schoolId;
    }

    // Super Admin operations remain on the central registry database. Normal
    // authenticated school users are routed to their dedicated database once
    // that database has been provisioned and activated in the registry.
    if (roleName !== "super admin" && req.user?.school_id) {
        try {
            const schoolPool = await getSchoolDatabase(req.user.school_id);

            req.schoolDatabase = schoolPool;
            req.schoolDatabaseSchoolId = Number(req.user.school_id);

            return runWithSchoolDatabase(schoolPool, () => next());
        } catch (error) {
            return next(error);
        }
    }

    return next();
};
