const relationshipModel = require("../models/relationshipModel");

const getRelationships = async () => {

    return await relationshipModel.getRelationships();

};

module.exports = {

    getRelationships

};