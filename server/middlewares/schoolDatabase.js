const pool = require("../config/database");
const publicDomainModel = require("../models/publicDomainModel");
const { getSchoolDatabase } = require("../config/schoolDatabaseManager");
const { runWithSchoolDatabase } = require("../config/databaseContext");

const getSchoolKey = (req) => {
    const explicitSlug = req.query?.schoolSlug;
    if (explicitSlug) return String(explicitSlug).trim().toLowerCase();

    const explicitDomain = req.query?.schoolDomain || req.get("x-school-domain");
    if (explicitDomain) {
        return String(explicitDomain).trim().toLowerCase().replace(/^www\./, "");
    }

    return String(req.hostname || "").trim().toLowerCase().replace(/^www\./, "");
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
            "localhost",
            "127.0.0.1",
        ]);

        if (!key || platformHosts.has(key)) {
            return next();
        }

        // Resolve the public school identity first. This is the same resolver
        // used by the public website, so a custom domain and an EduProw
        // subdomain identify the same school everywhere.
        let publicSchool = null;
        try {
            publicSchool = await publicDomainModel.getSchoolByHost(key);
        } catch (error) {
            console.error("Public school resolution failed:", error);
        }

        const schoolId = Number(publicSchool?.id);

        if (!Number.isInteger(schoolId) || schoolId < 1) {
            // Keep the legacy registry lookup as a fallback for deployments
            // where public-domain metadata has not yet been populated.
            let registryResult;
            try {
                registryResult = await pool.query(`
                    SELECT r.school_id, r.database_name, r.website_slug, r.is_active
                    FROM school_database_registry r
                    LEFT JOIN schools s ON s.id = r.school_id
                    WHERE r.is_active = true
                      AND (
                          LOWER(r.website_slug) = LOWER($1)
                          OR LOWER(r.website_slug || '.eduprow.com') = LOWER($1)
                          OR LOWER(
                              REGEXP_REPLACE(
                                  REGEXP_REPLACE(
                                      REGEXP_REPLACE(
                                          REGEXP_REPLACE(TRIM(COALESCE(s.domain, '')), '^https?://', '', 'i'),
                                          '^www\\.',
                                          '',
                                          'i'
                                      ),
                                      '/.*
                      )
                    LIMIT 1;
                `, [key]);
            } catch (error) {
                if (error.code === "42P01") {
                    return next();
                }
                throw error;
            }

            const school = registryResult.rows[0];
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
        }

        const registryResult = await pool.query(`
            SELECT school_id, database_name, website_slug, is_active
            FROM school_database_registry
            WHERE school_id = $1
            LIMIT 1;
        `, [schoolId]);

        const registry = registryResult.rows[0];

        // A public school can be resolved before its dedicated database is
        // active. In that case keep the existing central/shared flow.
        if (!registry || !registry.is_active) {
            return next();
        }

        const school = {
            school_id: schoolId,
            database_name: registry.database_name,
            website_slug: publicSchool.website_slug,
            is_active: Boolean(registry.is_active),
        };

        const schoolPool = await getSchoolDatabase(schoolId);

        return runWithSchoolDatabase(schoolPool, () => {
            req.school = school;
            req.schoolDatabase = schoolPool;
            req.schoolDatabaseSchoolId = schoolId;
            next();
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = resolveSchoolDatabase;
,
                                      ''
                                  ),
                                  ':[0-9]+
                      )
                    LIMIT 1;
                `, [key]);
            } catch (error) {
                if (error.code === "42P01") {
                    return next();
                }
                throw error;
            }

            const school = registryResult.rows[0];
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
        }

        const registryResult = await pool.query(`
            SELECT school_id, database_name, website_slug, is_active
            FROM school_database_registry
            WHERE school_id = $1
            LIMIT 1;
        `, [schoolId]);

        const registry = registryResult.rows[0];

        // A public school can be resolved before its dedicated database is
        // active. In that case keep the existing central/shared flow.
        if (!registry || !registry.is_active) {
            return next();
        }

        const school = {
            school_id: schoolId,
            database_name: registry.database_name,
            website_slug: publicSchool.website_slug,
            is_active: Boolean(registry.is_active),
        };

        const schoolPool = await getSchoolDatabase(schoolId);

        return runWithSchoolDatabase(schoolPool, () => {
            req.school = school;
            req.schoolDatabase = schoolPool;
            req.schoolDatabaseSchoolId = schoolId;
            next();
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = resolveSchoolDatabase;
,
                                  ''
                              )
                          ) = LOWER($1)
                      )
                    LIMIT 1;
                `, [key]);
            } catch (error) {
                if (error.code === "42P01") {
                    return next();
                }
                throw error;
            }

            const school = registryResult.rows[0];
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
        }

        const registryResult = await pool.query(`
            SELECT school_id, database_name, website_slug, is_active
            FROM school_database_registry
            WHERE school_id = $1
            LIMIT 1;
        `, [schoolId]);

        const registry = registryResult.rows[0];

        // A public school can be resolved before its dedicated database is
        // active. In that case keep the existing central/shared flow.
        if (!registry || !registry.is_active) {
            return next();
        }

        const school = {
            school_id: schoolId,
            database_name: registry.database_name,
            website_slug: publicSchool.website_slug,
            is_active: Boolean(registry.is_active),
        };

        const schoolPool = await getSchoolDatabase(schoolId);

        return runWithSchoolDatabase(schoolPool, () => {
            req.school = school;
            req.schoolDatabase = schoolPool;
            req.schoolDatabaseSchoolId = schoolId;
            next();
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = resolveSchoolDatabase;
