const pool = require("../config/database");

const getTerms = async () => {

    const query = `
        SELECT

            t.id,

            t.term_name,

            t.start_date,

            t.end_date,

            t.is_current,

            s.id AS session_id,

            s.session_name

        FROM terms t

        INNER JOIN academic_sessions s

            ON t.session_id = s.id

        ORDER BY

            s.start_date DESC,

            t.start_date ASC;
    `;

    const result = await pool.query(query);

    return result.rows;

};
const getTermById = async (id) => {

    const result = await pool.query(
        `SELECT * FROM terms WHERE id = $1`,
        [id]
    );

    return result.rows[0];

};

module.exports = {

    getTerms,
    getTermById

};