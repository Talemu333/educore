const subjectModel = require("../models/subjectModel");
const ApiError = require("../utils/ApiError");

const getSubjects = async (schoolId, database) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    if (!database) throw new ApiError(500, "School database context is unavailable.");
    return await subjectModel.getSubjects(schoolId, database);
};

const createSubject = async (subjectData, schoolId, database) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    if (!database) throw new ApiError(500, "School database context is unavailable.");

    const existingCode = await subjectModel.getSubjectByCode(
        subjectData.subject_code,
        schoolId,
        database
    );

    if (existingCode) {
        throw new ApiError(409, "Subject code already exists in this school.");
    }

    const existingName = await subjectModel.getSubjectByName(
        subjectData.subject_name,
        schoolId,
        database
    );

    if (existingName) {
        throw new ApiError(409, "Subject name already exists in this school.");
    }

    return await subjectModel.createSubject(subjectData, schoolId, database);
};

const getSubjectsByClass = async (classId, schoolId, database) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    if (!database) throw new ApiError(500, "School database context is unavailable.");
    return await subjectModel.getSubjectsByClass(classId, schoolId, database);
};

module.exports = {
    getSubjects,
    createSubject,
    getSubjectsByClass
};
