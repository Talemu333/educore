module.exports = (req, res, next) => {

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

    return next();
};
