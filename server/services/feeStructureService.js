const ApiError = require("../utils/ApiError");
const feeStructureModel = require("../models/feeStructureModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const classModel = require("../models/classModel");
const feeTypeModel = require("../models/feeTypeModel");

const requireSchool = (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
};

const createFeeStructure = async (data, schoolId) => {
    requireSchool(schoolId);
    const session = await sessionModel.getSessionById(data.session_id, schoolId);
    if (!session) throw new ApiError(404, "Academic session not found.");
    const term = await termModel.getTermById(data.term_id, schoolId);
    if (!term) throw new ApiError(404, "Academic term not found.");
    if (Number(term.session_id) !== Number(data.session_id)) throw new ApiError(400, "Selected term does not belong to the selected academic session.");
    const schoolClass = await classModel.getClassById(data.class_id, schoolId);
    if (!schoolClass) throw new ApiError(404, "Class not found.");
    const feeType = await feeTypeModel.getFeeTypeById(data.fee_type_id, schoolId);
    if (!feeType) throw new ApiError(404, "Fee type not found.");
    if (Number(data.amount) <= 0) throw new ApiError(400, "Amount must be greater than zero.");
    const exists = await feeStructureModel.feeStructureExists(data.session_id,data.term_id,data.class_id,data.fee_type_id,schoolId);
    if (exists) throw new ApiError(409, "Fee structure already exists.");
    const created = await feeStructureModel.createFeeStructure(data, schoolId);
    if (!created) throw new ApiError(400, "Fee structure references data outside this school.");
    return created;
};

const updateFeeStructure = async (id,data,schoolId) => {
    requireSchool(schoolId);
    const feeStructure = await feeStructureModel.getFeeStructureById(id,schoolId);
    if (!feeStructure) throw new ApiError(404,"Fee structure not found.");
    if (Number(data.amount) <= 0) throw new ApiError(400,"Amount must be greater than zero.");
    return feeStructureModel.updateFeeStructure(id,data,schoolId);
};

const getFeeStructures = async (schoolId) => {
    requireSchool(schoolId);
    return feeStructureModel.getFeeStructures(schoolId);
};

module.exports={createFeeStructure,updateFeeStructure,getFeeStructures};