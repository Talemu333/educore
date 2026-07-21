const ApiError = require("../utils/ApiError");

const armModel = require("../models/armModel");
const classModel = require("../models/classModel");

const createArm = async (armData) => {

    const classExists = await classModel.getClassById(
        armData.class_id
    );

    if (!classExists) {

        throw new ApiError(
            404,
            "Selected class does not exist."
        );

    }

    const existing = await armModel.getArmByName(

        armData.class_id,

        armData.arm_name

    );

    if (existing) {

        throw new ApiError(
            409,
            "Arm already exists in this class."
        );

    }

    return await armModel.createArm(armData);

};

module.exports = {

    createArm

};