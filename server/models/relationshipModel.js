const pool = require("../config/database");

const getRelationships = async () => {

    const query = `
        SELECT
            id,
            relationship_name
        FROM relationships
        ORDER BY relationship_name;
    `;

    const result = await pool.query(query);

    return result.rows;

};

module.exports = {

    getRelationships

};