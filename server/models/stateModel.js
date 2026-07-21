const pool = require("../config/database");

const getStates = async () => {

    const query = `
        SELECT
            id,
            state_name
        FROM states
        ORDER BY state_name;
    `;

    const result = await pool.query(query);

    return result.rows;

};

module.exports = {
    getStates
};