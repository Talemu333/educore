const pool = require("../config/database");
const { getSchoolDatabase } = require("../config/schoolDatabaseManager");
const { runWithSchoolDatabase } = require("../config/databaseContext");
const { getSchoolByHost } = require("../models/publicDomainModel");

const getSchoolKey = (req) => {
    const explicitSlug = req.query?.schoolSlug;
    if (explicitSlug) return String(explicitSlug).trim().toLowerCase();

    const explicitDomain = req.query?.schoolDomain || req.get("x-school-domain");
    if (explicitDomain) {
        return String(explicitDomain).trim().toLowerCase().replace(/^www\./, "");
    }

    // API requests come to the Render backend, so req.hostname is the API
    // hostname rather than the school website hostname. For browser requests,
    // the Origin header identifies the school site that initiated the request.
    const origin = req.get("origin");
    if (origin) {
        try {
            const originHostname = new URL(origin).hostname;
            if (originHostname) {
                return String(originHostname).trim().toLowerCase().replace(/^www\./, "");
            }
        } catch (_) {
            // Fall back to the request hostname below when Origin is malformed.
        }
    }

    return String(req.hostname || "").trim().toLowerCase().replace(/^www\./, "");
};

const resolveSchoolDatabase = async (req, res, next) => {
    try {
        // Authenticated admin requests already carry the tenant in req.user.
        // Resolve that school's dedicated database before website admin queries
        // run, so /admin/pages and /admin/pages/:id/sections do not fall back
        // to the central database.
        if (String(req.path || "").startsWith("/admin") && req.user?.school_id) {
            const registryResult = await pool.centralPool.query(
                `SELECT school_id, database_name, website_slug, is_active
                 FROM school_database_registry
                 WHERE school_id = $1
                   AND is_active = true
                 LIMIT 1`,
                [req.user.school_id]
            );

            const school = registryResult.rows[0];
            if (!school) return next();

            const schoolPool = await getSchoolDatabase(school.school_id);
            return runWithSchoolDatabase(schoolPool, () => {
                req.school = school;
                req.schoolDatabase = schoolPool;
                req.schoolDatabaseSchoolId = Number(school.school_id);
                next();
            });
        }

        const key = getSchoolKey(req);
        const platformHosts = new Set([
            "eduprow.com",
            "localhost",
            "127.0.0.1",
        ]);

        if (!key || platformHosts.has(key)) {
            return next();
        }

        let registryResult;
        try {
            registryResult = await pool.centralPool.query(`
                SELECT r.school_id, r.database_name, r.website_slug, r.is_active
                FROM school_database_registry r
                WHERE r.is_active = true
                  AND (
                      LOWER(r.website_slug) = LOWER($1)
                      OR LOWER(r.website_slug || '.eduprow.com') = LOWER($1)
                  )
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

        let school = registryResult.rows[0];

        /*
         * Custom school domains (for example, a school's own .com.ng domain)
         * are registered in the central schools table, not necessarily as the
         * registry's website_slug. Resolve those domains through the same
         * canonical public-domain resolver used by school settings, then use
         * the resulting school_id to select the dedicated tenant database.
         */
        if (!school) {
            const publicSchool = await getSchoolByHost(key);

            if (publicSchool?.id) {
                const domainRegistryResult = await pool.centralPool.query(
                    `SELECT school_id, database_name, website_slug, is_active
                     FROM school_database_registry
                     WHERE school_id = $1
                       AND is_active = true
                     LIMIT 1`,
                    [publicSchool.id]
                );

                school = domainRegistryResult.rows[0];
            }
        }

        // Registered but not yet provisioned schools continue using the
        // existing shared-database website flow until their dedicated DB is
        // activated.
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
