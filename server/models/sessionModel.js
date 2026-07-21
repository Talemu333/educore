const pool = require("../config/database");

const getSessions = async () => {

    const query = `
        SELECT
            id,
            session_name,
            start_date,
            end_date,
            is_current
        FROM academic_sessions
        ORDER BY start_date DESC;
    `;

    const result = await pool.query(query);

    return result.rows;

};
const getSessionById = async (id) => {

    const result = await pool.query(
        `SELECT * FROM academic_sessions WHERE id = $1`,
        [id]
    );

    return result.rows[0];

};

module.exports = {

    getSessions,
    getSessionById

};