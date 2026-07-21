const classModel = require("../models/classModel");
const ApiError = require("../utils/ApiError");

const getClasses = async () => {
    return await classModel.getClasses();
};

const getClassArms = async (classId) => {

    return await classModel.getClassArms(classId);

};

const createClass = async (classData) => {

    const existing = await classModel.getClassByName(classData.class_name);

    if (existing) {
        throw new ApiError(409, "Class already exists.");
    }

    return await classModel.createClass(classData);

};

module.exports = {
    getClasses,
    getClassArms,
    createClass
};