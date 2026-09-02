const pool = require("../config/database");

const getSchoolBySlug = async (slug) => {
    const result = await pool.query(`
        SELECT
            ss.*,
            COALESCE(
                NULLIF(TRIM(ss.website_slug), ''),
                NULLIF(
                    regexp_replace(
                        regexp_replace(
                            lower(trim(ss.school_name)),
                            '[^a-z0-9]+',
                            '-',
                            'g'
                        ),
                        '(^-|-$)',
                        '',
                        'g'
                    ),
                    ''
                ),
                'school-' || ss.school_id::text
            ) AS resolved_website_slug
        FROM school_settings ss
        WHERE ss.is_active = TRUE
          AND (
              LOWER(TRIM(COALESCE(ss.website_slug, ''))) = LOWER(TRIM($1))
              OR LOWER(
                  regexp_replace(
                      regexp_replace(
                          lower(trim(ss.school_name)),
                          '[^a-z0-9]+',
                          '-',
                          'g'
                      ),
                      '(^-|-$)',
                      '',
                      'g'
                  )
              ) = LOWER(TRIM($1))
              OR LOWER('school-' || ss.school_id::text) = LOWER(TRIM($1))
          )
        LIMIT 1;
    `, [slug]);

    const school = result.rows[0];

    if (!school) return null;

    school.website_slug = school.resolved_website_slug;
    delete school.resolved_website_slug;

    return school;
};

module.exports = { getSchoolBySlug };
