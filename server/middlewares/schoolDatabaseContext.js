const { getSchoolDatabase } = require("../config/schoolDatabaseManager");

/**
 * Resolves the database for the authenticated user's current school context.
 *
 * This middleware is intentionally not mounted globally yet. Existing routes
 * continue using the shared pool while the database-per-school migration is
 * being introduced gradually.
 */
module.exports = async (req, res, next) => {
    try {
        const schoolId = req.superAdminSchoolContext || req.user?.school_id;

        if (!schoolId) {
            return next();
        }

        req.schoolDatabase = await getSchoolDatabase(schoolId);
        req.schoolDatabaseSchoolId = Number(schoolId);

        return next();
    } catch (error) {
        return next(error);
    }
};
