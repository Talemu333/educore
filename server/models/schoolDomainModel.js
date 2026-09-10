const pool = require("../config/database");

const getSchoolDomain = async (schoolId) => {
    const result = await pool.query(
        `SELECT id, school_name, domain FROM schools WHERE id = $1 LIMIT 1`,
        [schoolId]
    );
    return result.rows[0] || null;
};

const setSchoolDomain = async (schoolId, domain) => {
    const result = await pool.query(
        `UPDATE schools SET domain = $1 WHERE id = $2 RETURNING id, school_name, domain`,
        [domain || null, schoolId]
    );
    return result.rows[0] || null;
};

module.exports = { getSchoolDomain, setSchoolDomain };
