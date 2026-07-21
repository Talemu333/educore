const ApiError = require("../utils/ApiError");
const feeStructureModel = require("../models/feeStructureModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const classModel = require("../models/classModel");
const feeTypeModel = require("../models/feeTypeModel");

const createFeeStructure = async (data) => {

    // Validate Session
    const session = await sessionModel.getSessionById(data.session_id);
    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }

    // Validate Term
    const term = await termModel.getTermById(data.term_id);
    if (!term) {

        throw new ApiError(
            404,
            "Academic term not found."
        );

    }

    // Validate Class
    const schoolClass = await classModel.getClassById(data.class_id);
    if (!schoolClass) {

        throw new ApiError(
            404,
            "Class not found."
        );

    }

    // Validate Fee Type
    const feeType = await feeTypeModel.getFeeTypeById(data.fee_type_id);
    if (!feeType) {

        throw new ApiError(
            404,
            "Fee type not found."
        );

    }

    // Validate Amount
    if (Number(data.amount) <= 0) {

        throw new ApiError(
            400,
            "Amount must be greater than zero."
        );

    }

    // Check Duplicate
    const exists = await feeStructureModel.feeStructureExists(

        data.session_id,

        data.term_id,

        data.class_id,

        data.fee_type_id

    );

    if (exists) {

        throw new ApiError(

            409,

            "Fee structure already exists."

        );

    }

    return await feeStructureModel.createFeeStructure(data);

};

const updateFeeStructure = async (id, data) => {

    const feeStructure =
        await feeStructureModel.getFeeStructureById(id);

    if (!feeStructure) {

        throw new ApiError(
            404,
            "Fee structure not found."
        );

    }

    if (Number(data.amount) <= 0) {

        throw new ApiError(
            400,
            "Amount must be greater than zero."
        );

    }

    return await feeStructureModel.updateFeeStructure(

        id,

        data

    );

};

const getFeeStructures = async () => {

    return await feeStructureModel.getFeeStructures();

};

module.exports = {
    createFeeStructure,
    updateFeeStructure,
    getFeeStructures
}