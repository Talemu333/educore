const pool = require("../config/database");

const normalizeDomain = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");

const getSchoolByHost = async (host) => {
    const domain = normalizeDomain(host);
    if (!domain) return null;

    const platformDomain = normalizeDomain(
        process.env.PLATFORM_DOMAIN || "eduprow.com"
    );

    const result = await pool.query(
        `SELECT s.id,
                s.school_name,
                s.school_code,
                s.domain,
                s.logo,
                s.is_active,
                ss.website_slug
         FROM schools s
         LEFT JOIN school_settings ss ON ss.school_id = s.id
         WHERE s.is_active = TRUE
           AND (
               LOWER(TRIM(COALESCE(s.domain, ''))) = $1
               OR (
                   $1 LIKE '%.%'
                   AND split_part($1, '.', 2) = split_part($2, '.', 1)
                   AND split_part($1, '.', 3) = split_part($2, '.', 2)
                   AND LOWER(COALESCE(ss.website_slug, '')) = LOWER(split_part($1, '.', 1))
               )
           )
         LIMIT 1`,
        [domain, platformDomain]
    );

    return result.rows[0] || null;
};

module.exports = { getSchoolByHost, normalizeDomain };
