const pool = require("../config/database");

const getSchoolBySlug = async (slug) => {
    const result = await pool.query(`
        SELECT ss.*
        FROM school_settings ss
        WHERE LOWER(ss.website_slug) = LOWER($1)
          AND ss.is_active = TRUE
        LIMIT 1;
    `, [slug]);

    return result.rows[0];
};

module.exports = { getSchoolBySlug };
