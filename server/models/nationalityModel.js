const pool = require("../config/database");

const getNationalities = async () => {

    const query = `
        SELECT
            id,
            nationality_name
        FROM nationalities
        ORDER BY nationality_name;
    `;

    const result = await pool.query(query);

    return result.rows;

};

module.exports = {
    getNationalities
};