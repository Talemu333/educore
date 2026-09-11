const ApiError = require("../utils/ApiError");
const armModel = require("../models/armModel");
const classModel = require("../models/classModel");

const createArm = async (armData, schoolId, client) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");

    const classExists = await classModel.getClassById(
        armData.class_id,
        schoolId,
        client
    );

    if (!classExists) {
        throw new ApiError(404, "Selected class does not exist in this school.");
    }

    const existing = await armModel.getArmByName(
        armData.class_id,
        armData.arm_name,
        schoolId,
        client
    );

    if (existing) {
        throw new ApiError(409, "Arm already exists in this class.");
    }

    return await armModel.createArm(armData, schoolId, client);
};

const getArms = async (schoolId, client) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return await armModel.getArms(schoolId, client);
};

const getArmsByClass = async (classId, schoolId, client) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const schoolClass = await classModel.getClassById(classId, schoolId, client);
    if (!schoolClass) throw new ApiError(404, "Class not found.");
    return await armModel.getArmsByClass(classId, schoolId, client);
};

module.exports = {
    createArm,
    getArms,
    getArmsByClass
};
