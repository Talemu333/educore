const pool = require("../config/database");

const normalizeDomain = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
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

    /*
     * IMPORTANT:
     * This query always runs against the central database. It resolves the
     * public hostname to the central school ID first; only after that does
     * schoolDatabase middleware switch the request into the school's
     * dedicated database.
     *
     * Domains are normalized on BOTH sides. Older records may contain
     * "www.example.com" or even "https://www.example.com", while the browser
     * hostname never contains the protocol. Comparing the raw column directly
     * therefore makes an otherwise valid school appear to be missing.
     */
    const result = await pool.centralPool.query(
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
                LOWER(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                regexp_replace(trim(COALESCE(s.domain, '')), '^https?://', '', 'i'),
                                '^www\\.',
                                '',
                                'i'
                            ),
                            '/.*$',
                            ''
                        ),
                        ':[0-9]+$',
                        ''
                    )
                ) = $1
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
         ORDER BY s.id
         LIMIT 1`,
        [domain, subdomain]
    );

    return result.rows[0] || null;
};

module.exports = { getSchoolByHost, normalizeDomain, slugify };
