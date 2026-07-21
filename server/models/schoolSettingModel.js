const pool = require("../config/database");
const getSchoolSettings = async () => {

    const result = await pool.query(`
        SELECT *
        FROM school_settings
        LIMIT 1
    `);

    return result.rows[0];

};

module.exports = {
    getSchoolSettings
}