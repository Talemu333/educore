const termModel = require("../models/termModel");

const getTerms = async (schoolId) => {
    return await termModel.getTerms(schoolId);
};

const createTerm = async (data, schoolId) => {
    return await termModel.createTerm(data, schoolId);
};

module.exports = {
    getTerms,
    createTerm
};
