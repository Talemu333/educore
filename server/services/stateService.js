const stateModel = require("../models/stateModel");

const getStates = async () => {

    return await stateModel.getStates();

};

module.exports = {
    getStates
};