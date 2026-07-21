const termModel = require("../models/termModel");

const getTerms = async () => {

    return await termModel.getTerms();

};

module.exports = {

    getTerms

};