const ApiError = require("../utils/ApiError");
const feeTypeModel = require("../models/feeTypeModel");
const feeStructureModel = require("../models/feeStructureModel");

const createFeeType = async (data) => {

    const existing = await feeTypeModel.getFeeTypeByName(
        data.fee_name
    );

    if (existing) {

        throw new ApiError(
            409,
            "Fee type already exists."
        );

    }

    return await feeTypeModel.createFeeType(data);

};

const updateFeeType = async (id, data) => {

    const feeType = await feeTypeModel.getFeeTypeById(id);

    if (!feeType) {

        throw new ApiError(
            404,
            "Fee type not found."
        );

    }

    const duplicate = await feeTypeModel.getFeeTypeByName(
        data.fee_name
    );

    if (duplicate && duplicate.id !== Number(id)) {

        throw new ApiError(
            409,
            "Another fee type with this name already exists."
        );

    }

    return await feeTypeModel.updateFeeType(id, data);

};

const deleteFeeType = async (id) => {

    const feeType = await feeTypeModel.getFeeTypeById(id);

    if (!feeType) {

        throw new ApiError(
            404,
            "Fee type not found."
        );

    }

    const inUse = await feeStructureModel.feeTypeInUse(id);

    if (inUse) {

        throw new ApiError(
            400,
            "Cannot delete a fee type that is already assigned to a fee structure."
        );

    }

    return await feeTypeModel.deleteFeeType(id);

};

const getFeeTypes = async () => {

    return await feeTypeModel.getFeeTypes();

};

module.exports = {
    createFeeType,
    updateFeeType,
    deleteFeeType,
    getFeeTypes
}