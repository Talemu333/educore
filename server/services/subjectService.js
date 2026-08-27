const subjectModel = require("../models/subjectModel");
const ApiError = require("../utils/ApiError");

const getSubjects = async (schoolId) => {
    return await subjectModel.getSubjects(schoolId);
};

const createSubject = async (subjectData, schoolId) => {
    const existingCode = await subjectModel.getSubjectByCode(
        subjectData.subject_code,
        schoolId
    );

    if (existingCode) {
        throw new ApiError(409, "Subject code already exists in this school.");
    }

    const existingName = await subjectModel.getSubjectByName(
        subjectData.subject_name,
        schoolId
    );

    if (existingName) {
        throw new ApiError(409, "Subject name already exists in this school.");
    }

    return await subjectModel.createSubject(subjectData, schoolId);
};

const getSubjectsByClass = async (classId, schoolId) => {
    return await subjectModel.getSubjectsByClass(classId, schoolId);
};

module.exports = {
    getSubjects,
    createSubject,
    getSubjectsByClass
};
