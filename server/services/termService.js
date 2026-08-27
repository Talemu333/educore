const termModel = require("../models/termModel");

const getTerms = async (schoolId) => {
    return await termModel.getTerms(schoolId);
};

module.exports = {
    getTerms
};