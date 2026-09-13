const { getSchoolDatabase } = require("../config/schoolDatabaseManager");
const { runWithSchoolDatabase } = require("../config/databaseContext");
const { migrateSchoolData } = require("../scripts/migrateSchoolData");

module.exports = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

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

    // Every authenticated school request must execute against its dedicated
    // database. Super Admin is allowed to operate on a selected school when
    // X-School-Id is supplied by the frontend. Normal school users use the
    // school_id attached to their authenticated account.
    const schoolId = Number(req.user?.school_id);
    const hasSchoolContext = Number.isInteger(schoolId) && schoolId > 0;

    if (hasSchoolContext) {
        try {
            // School 1 is the only legacy school whose existing central data
            // must be copied into its new database. The migration script has
            // its own user-count guard, so after the dedicated database is
            // populated this becomes a no-op.
            if (roleName !== "super admin" && schoolId === 1) {
                await migrateSchoolData(1);
            }

            const schoolPool = await getSchoolDatabase(schoolId);

            req.schoolDatabase = schoolPool;
            req.schoolDatabaseSchoolId = schoolId;

            return runWithSchoolDatabase(schoolPool, () => next());
        } catch (error) {
            return next(error);
        }
    }

    return next();
};
