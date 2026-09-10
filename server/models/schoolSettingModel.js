const pool = require("../config/database");

const getSchoolSettings = async (schoolId) => {
    const result = await pool.query(`
        SELECT
            ss.*,
            s.school_name AS canonical_school_name,
            ac.session_name,
            tr.term_name
        FROM school_settings ss
        JOIN schools s ON s.id = ss.school_id
        LEFT JOIN academic_sessions ac ON ss.current_session_id = ac.id AND ac.school_id = ss.school_id
        LEFT JOIN terms tr ON ss.current_term_id = tr.id AND tr.school_id = ss.school_id
        WHERE ss.school_id = $1
        LIMIT 1;
    `, [schoolId]);

    const settings = result.rows[0];
    if (!settings) return null;

    settings.school_name = settings.canonical_school_name || settings.school_name;
    delete settings.canonical_school_name;
    return settings;
};

const getSchoolSettingsBySlug = async (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();

    if (!normalizedSlug) return null;

    // Public tenant resolution should not depend on optional school-settings
    // columns such as website_slug, current_session_id or current_term_id.
    // The school record + school_id are the core tenant boundary.
    const result = await pool.query(`
        SELECT
            ss.*,
            s.school_name AS canonical_school_name
        FROM school_settings ss
        JOIN schools s ON s.id = ss.school_id
        WHERE s.is_active = TRUE
          AND (
              LOWER(TRIM(s.school_name)) = LOWER(TRIM($1))
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
              ) = $1
              OR LOWER('school-' || s.id::text) = $1
              OR LOWER('school' || s.id::text) = $1
          )
        LIMIT 1;
    `, [normalizedSlug]);

    const settings = result.rows[0];

    if (!settings) return null;

    settings.school_name = settings.canonical_school_name || settings.school_name;
    delete settings.canonical_school_name;

    // Keep the public response compatible with the rest of the website API.
    if (!settings.website_slug) {
        settings.website_slug = normalizedSlug;
    }

    return settings;
};

const updateSchoolSettings = async (data) => {
    const query = `
        UPDATE school_settings
        SET school_name = $1, school_logo = $2, school_motto = $3, school_level = $4,
            admission_prefix = $5, student_prefix = $6, teacher_prefix = $7, parent_prefix = $8,
            school_email = $9, school_phone = $10, school_address = $11, primary_color = $12,
            secondary_color = $13, current_session_id = $14, current_term_id = $15,
            ca_max_score = $16, exam_max_score = $17, passing_score = $18,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $19 AND school_id = $20 RETURNING *;
    `;
    const values = [data.school_name,data.school_logo||null,data.school_motto||null,data.school_level||null,
        data.admission_prefix||null,data.student_prefix||null,data.teacher_prefix||null,data.parent_prefix||null,
        data.school_email||null,data.school_phone||null,data.school_address||null,data.primary_color,
        data.secondary_color,data.current_session_id||null,data.current_term_id||null,data.ca_max_score,
        data.exam_max_score,data.passing_score,data.id,data.school_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = { getSchoolSettings, getSchoolSettingsBySlug, updateSchoolSettings };
