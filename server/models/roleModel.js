const pool = require("../config/database");

const getRoleByName = async (roleName) => {

    const query = `
        SELECT *
        FROM roles
        WHERE LOWER(role_name) = LOWER($1)
        LIMIT 1;
    `;

    const result = await pool.query(query, [roleName]);

    return result.rows[0];

};

module.exports = {
    getRoleByName
};