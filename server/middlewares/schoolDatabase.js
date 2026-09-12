const ApiError = require("../utils/ApiError");
const pool = require("../config/database");
const { getSchoolDatabase } = require("../config/schoolDatabaseManager");
const { runWithSchoolDatabase } = require("../config/databaseContext");

const getSchoolKey = (req) => {
    const explicitSlug = req.query?.schoolSlug;
    if (explicitSlug) return String(explicitSlug).trim().toLowerCase();

    const explicitDomain = req.query?.schoolDomain || req.get("x-school-domain");
    if (explicitDomain) return String(explicitDomain).trim().toLowerCase();

    return String(req.hostname || "").trim().toLowerCase();
};

const resolveSchoolDatabase = async (req, res, next) => {
    try {
        const key = getSchoolKey(req);
        const platformHosts = new Set([
            "eduprow.com",
            "www.eduprow.com",
            "localhost",
            "127.0.0.1",
        ]);

        // Platform-level requests do not belong to a school database.
        if (!key || platformHosts.has(key)) {
            return next();
        }

        const registryResult = await pool.query(`
            SELECT school_id, database_name, website_slug, is_active
            FROM school_database_registry
            WHERE is_active = TRUE
              AND (
                  LOWER(website_slug) = LOWER($1)
                  OR LOWER(website_slug || '.eduprow.com') = LOWER($1)
              )
            LIMIT 1;
        `, [key]);

        const school = registryResult.rows[0];

        if (!school) {
            return next(new ApiError(404, "School database could not be resolved."));
        }

        const schoolPool = await getSchoolDatabase(school.school_id);

        return runWithSchoolDatabase(schoolPool, () => {
            req.school = school;
            req.schoolDatabase = schoolPool;
            req.schoolDatabaseSchoolId = Number(school.school_id);
            next();
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = resolveSchoolDatabase;
