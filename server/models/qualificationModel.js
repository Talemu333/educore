const pool = require("../config/database");

const getQualifications = async () => {

    const query = `
        SELECT

            id,

            qualification_name

        FROM qualifications

        ORDER BY qualification_name;
    `;

    const result = await pool.query(query);

    return result.rows;

};

module.exports = {

    getQualifications

};