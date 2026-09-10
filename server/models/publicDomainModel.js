const pool = require("../config/database");

const normalizeDomain = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");

const slugify = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getSchoolByHost = async (host) => {
    const domain = normalizeDomain(host);
    if (!domain) return null;

    const platformDomain = normalizeDomain(process.env.PLATFORM_DOMAIN || "eduprow.com");
    const platformParts = platformDomain.split(".");
    const domainParts = domain.split(".");
    const isPlatformSubdomain =
        domainParts.length === platformParts.length + 1 &&
        domain.endsWith(`.${platformDomain}`);
    const subdomain = isPlatformSubdomain ? domainParts[0] : "";

    const result = await pool.query(
        `SELECT
            s.id,
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
                    $2 <> ''
                    AND (
                        LOWER(TRIM(COALESCE(ss.website_slug, ''))) = LOWER($2)
                        OR LOWER(
                            regexp_replace(
                                regexp_replace(
                                    lower(trim(s.school_name)),
                                    '[^a-z0-9]+',
                                    '-',
                                    'g'
                                ),
                                '(^-|-$)',
                                '',
                                'g'
                            )
                        ) = LOWER($2)
                        OR LOWER(
                            regexp_replace(
                                regexp_replace(
                                    lower(trim(COALESCE(ss.school_name, ''))),
                                    '[^a-z0-9]+',
                                    '-',
                                    'g'
                                ),
                                '(^-|-$)',
                                '',
                                'g'
                            )
                        ) = LOWER($2)
                        OR LOWER('school-' || s.id::text) = LOWER($2)
                        OR LOWER('school' || s.id::text) = LOWER($2)
                    )
                )
           )
         LIMIT 1`,
        [domain, subdomain]
    );

    return result.rows[0] || null;
};

module.exports = { getSchoolByHost, normalizeDomain, slugify };
