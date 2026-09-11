const centralPool = require("../config/database");

const getSchoolDatabaseFromRequest = (req) => {
    return req.schoolDatabase || centralPool;
};

module.exports = getSchoolDatabaseFromRequest;
