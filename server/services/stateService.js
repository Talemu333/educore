const stateModel = require("../models/stateModel");

const getStates = async () => stateModel.getStates();
const createState = async (stateName) => stateModel.createState(stateName);

module.exports = { getStates, createState };
