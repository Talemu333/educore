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
    // Website administration already receives its authenticated school context
    // from req.user. Do not let a public hostname/subdomain switch the database
    // before authentication and authorization have selected the admin school.
    if (String(req.path || "").startsWith("/admin")) {
        return next();
    }

    try {
        const key = getSchoolKey(req);
        const platformHosts = new Set([
            "eduprow.com",
            "www.eduprow.com",
            "localhost",
            "127.0.0.1",
        ]);

        if (!key || platformHosts.has(key)) {
            return next();
        }

        let registryResult;
        try {
            registryResult = await pool.query(`
                SELECT school_id, database_name, website_slug, is_active
                FROM school_database_registry
                WHERE LOWER(website_slug) = LOWER($1)
                   OR LOWER(website_slug || '.eduprow.com') = LOWER($1)
                LIMIT 1;
            `, [key]);
        } catch (error) {
            // The registry migration may not have been applied yet. Keep the
            // existing shared-database website flow working during deployment.
            if (error.code === "42P01") {
                return next();
            }
            throw error;
        }

        const school = registryResult.rows[0];

        // Registered but not yet provisioned schools continue using the
        // existing central database until their dedicated DB is activated.
        if (!school || !school.is_active) {
            return next();
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
