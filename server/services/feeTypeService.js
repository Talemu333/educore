const ApiError = require("../utils/ApiError");
const feeTypeModel = require("../models/feeTypeModel");
const feeStructureModel = require("../models/feeStructureModel");

const createFeeType = async (data, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const existing = await feeTypeModel.getFeeTypeByName(data.fee_name, schoolId);
    if (existing) throw new ApiError(409, "Fee type already exists in this school.");
    return feeTypeModel.createFeeType(data, schoolId);
};

const updateFeeType = async (id, data, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const feeType = await feeTypeModel.getFeeTypeById(id, schoolId);
    if (!feeType) throw new ApiError(404, "Fee type not found.");
    const duplicate = await feeTypeModel.getFeeTypeByName(data.fee_name, schoolId);
    if (duplicate && duplicate.id !== Number(id)) throw new ApiError(409, "Another fee type with this name already exists in this school.");
    return feeTypeModel.updateFeeType(id, data, schoolId);
};

const deleteFeeType = async (id, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const feeType = await feeTypeModel.getFeeTypeById(id, schoolId);
    if (!feeType) throw new ApiError(404, "Fee type not found.");
    const inUse = await feeStructureModel.feeTypeInUse(id, schoolId);
    if (inUse) throw new ApiError(400, "Cannot delete a fee type that is already assigned to a fee structure.");
    return feeTypeModel.deleteFeeType(id, schoolId);
};

const getFeeTypes = async (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return feeTypeModel.getFeeTypes(schoolId);
};

module.exports = { createFeeType, updateFeeType, deleteFeeType, getFeeTypes };