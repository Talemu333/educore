const ApiError = require("../utils/ApiError");
const armModel = require("../models/armModel");
const classModel = require("../models/classModel");

const createArm = async (armData, schoolId) => {
    const classExists = await classModel.getClassById(
        armData.class_id,
        schoolId
    );

    if (!classExists) {
        throw new ApiError(404, "Selected class does not exist in this school.");
    }

    const existing = await armModel.getArmByName(
        armData.class_id,
        armData.arm_name,
        schoolId
    );

    if (existing) {
        throw new ApiError(409, "Arm already exists in this class.");
    }

    return await armModel.createArm(armData, schoolId);
};

const getArms = async (schoolId) => {
    return await armModel.getArms(schoolId);
};

const getArmsByClass = async (classId, schoolId) => {
    return await armModel.getArmsByClass(classId, schoolId);
};

module.exports = {
    createArm,
    getArms,
    getArmsByClass
};
