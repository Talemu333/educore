const pool = require("../config/database");

const getDepartments = async () => {

    const query = `
        SELECT

            id,

            department_name

        FROM departments

        ORDER BY department_name;
    `;

    const result = await pool.query(query);

    return result.rows;

};

module.exports = {

    getDepartments

};