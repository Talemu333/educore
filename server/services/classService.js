const classModel = require("../models/classModel");
const ApiError = require("../utils/ApiError");

const createClass = async (classData, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const existing = await classModel.getClassByName(classData.class_name, schoolId);
    if (existing) throw new ApiError(409, "Class already exists.");
    return classModel.createClass(classData, schoolId);
};

const getClasses = async (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return classModel.getClasses(schoolId);
};

const getClassArms = async (classId, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const schoolClass = await classModel.getClassById(classId, schoolId);
    if (!schoolClass) throw new ApiError(404, "Class not found.");
    return classModel.getClassArms(classId, schoolId);
};

const getClassById = async (id, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return classModel.getClassById(id, schoolId);
};

module.exports = { getClasses, getClassArms, createClass, getClassById };