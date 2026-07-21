const sessionModel = require("../models/sessionModel");

const getSessions = async () => {

    return await sessionModel.getSessions();

};

module.exports = {

    getSessions

};