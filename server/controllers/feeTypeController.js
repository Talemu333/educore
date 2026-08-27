const feeTypeService = require("../services/feeTypeService");
const asyncHandler = require("../middlewares/asyncHandler");

const getSchoolId = (req) => req.user?.school_id;

const createFeeType = asyncHandler(async (req, res) => {
    const feeType = await feeTypeService.createFeeType(req.body, getSchoolId(req));
    res.status(201).json({ success: true, message: "Fee type created successfully.", data: feeType });
});

const getFeeTypes = asyncHandler(async (req, res) => {
    const feeTypes = await feeTypeService.getFeeTypes(getSchoolId(req));
    res.json({ success: true, data: feeTypes });
});

const updateFeeType = asyncHandler(async (req, res) => {
    const feeType = await feeTypeService.updateFeeType(req.params.id, req.body, getSchoolId(req));
    res.json({ success: true, message: "Fee type updated successfully.", data: feeType });
});

const deleteFeeType = asyncHandler(async (req, res) => {
    await feeTypeService.deleteFeeType(req.params.id, getSchoolId(req));
    res.json({ success: true, message: "Fee type deleted successfully." });
});

module.exports = { createFeeType, getFeeTypes, updateFeeType, deleteFeeType };