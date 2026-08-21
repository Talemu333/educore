const departmentModel = require("../models/departmentModel");

const getDepartments = async () => {

    return await departmentModel.getDepartments();

};

module.exports = {

    getDepartments

};