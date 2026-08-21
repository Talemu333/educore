const qualificationModel = require("../models/qualificationModel");

const getQualifications = async () => {

    return await qualificationModel.getQualifications();

};

module.exports = {

    getQualifications

};