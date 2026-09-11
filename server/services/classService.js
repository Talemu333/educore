const classModel = require("../models/classModel");
const ApiError = require("../utils/ApiError");

const createClass = async (classData, schoolId, client) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const existing = await classModel.getClassByName(classData.class_name, schoolId, client);
    if (existing) throw new ApiError(409, "Class already exists.");
    return classModel.createClass(classData, schoolId, client);
};

const getClasses = async (schoolId, client) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return classModel.getClasses(schoolId, client);
};

const getClassArms = async (classId, schoolId, client) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const schoolClass = await classModel.getClassById(classId, schoolId, client);
    if (!schoolClass) throw new ApiError(404, "Class not found.");
    return classModel.getClassArms(classId, schoolId, client);
};

const getClassById = async (id, schoolId, client) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return classModel.getClassById(id, schoolId, client);
};

module.exports = { getClasses, getClassArms, createClass, getClassById };
