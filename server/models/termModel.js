const pool = require("../config/database");

const getTerms = async (schoolId) => {
    const query = `
        SELECT
            t.id,
            t.term_name,
            t.start_date,
            t.end_date,
            t.is_current,
            t.session_id,
            s.session_name
        FROM terms t
        INNER JOIN academic_sessions s
            ON t.session_id = s.id
        WHERE t.school_id = $1
          AND s.school_id = $1
        ORDER BY s.start_date DESC, t.start_date ASC;
    `;

    const result = await pool.query(query, [schoolId]);
    return result.rows;
};

const getTermById = async (id, schoolId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM terms
        WHERE id = $1
          AND school_id = $2
        `,
        [id, schoolId]
    );

    return result.rows[0];
};

module.exports = {
    getTerms,
    getTermById
};