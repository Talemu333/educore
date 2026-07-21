const nationalityModel = require("../models/nationalityModel");

const getNationalities = async () => {

    return await nationalityModel.getNationalities();

};

module.exports = {
    getNationalities
};