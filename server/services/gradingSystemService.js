const ApiError = require("../utils/ApiError");
const gradingSystemModel = require("../models/gradingSystemModel");

const requireSchool = (schoolId) => {
    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }
};

const getAllGradingSystems = async (schoolId) => {
    requireSchool(schoolId);
    return gradingSystemModel.getAllGradingScales(schoolId);
};

const getGradingSystemById = async (id, schoolId) => {
    requireSchool(schoolId);

    const gradingSystem = await gradingSystemModel
        .getGradingSystemById(id, schoolId);

    if (!gradingSystem) {
        throw new ApiError(404, "Grading system not found.");
    }

    return gradingSystem;
};

const validateScoreRange = async (data, schoolId, gradingSystemId = null) => {
    requireSchool(schoolId);

    const minScore = Number(data.min_score);
    const maxScore = Number(data.max_score);

    if (!Number.isFinite(minScore) || !Number.isFinite(maxScore)) {
        throw new ApiError(400, "Minimum and maximum scores must be valid numbers.");
    }

    if (minScore > maxScore) {
        throw new ApiError(400, "Minimum score cannot be greater than maximum score.");
    }

    const grade = String(data.grade || "").trim();
    if (!grade) {
        throw new ApiError(400, "Grade is required.");
    }

    const gradingSystems = await gradingSystemModel
        .getAllGradingScales(schoolId);

    const gradeExists = gradingSystems.find(item =>
        String(item.grade).toUpperCase() === grade.toUpperCase() &&
        Number(item.id) !== Number(gradingSystemId)
    );

    if (gradeExists) {
        throw new ApiError(409, "This grade already exists.");
    }

    const overlappingGrade = gradingSystems.find(item => {
        if (Number(item.id) === Number(gradingSystemId)) return false;

        const existingMin = Number(item.min_score);
        const existingMax = Number(item.max_score);

        return minScore <= existingMax && maxScore >= existingMin;
    });

    if (overlappingGrade) {
        throw new ApiError(
            409,
            `Score range overlaps with grade ${overlappingGrade.grade}.`
        );
    }
};

const createGradingSystem = async (data, schoolId) => {
    await validateScoreRange(data, schoolId);
    return gradingSystemModel.createGradingSystem(data, schoolId);
};

const updateGradingSystem = async (id, data, schoolId) => {
    requireSchool(schoolId);

    const existing = await gradingSystemModel
        .getGradingSystemById(id, schoolId);

    if (!existing) {
        throw new ApiError(404, "Grading system not found.");
    }

    await validateScoreRange(data, schoolId, id);

    return gradingSystemModel.updateGradingSystem(id, data, schoolId);
};

const deleteGradingSystem = async (id, schoolId) => {
    requireSchool(schoolId);

    const existing = await gradingSystemModel
        .getGradingSystemById(id, schoolId);

    if (!existing) {
        throw new ApiError(404, "Grading system not found.");
    }

    return gradingSystemModel.deleteGradingSystem(id, schoolId);
};

module.exports = {
    getAllGradingSystems,
    getGradingSystemById,
    createGradingSystem,
    updateGradingSystem,
    deleteGradingSystem
};