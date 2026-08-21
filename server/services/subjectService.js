const subjectModel = require("../models/subjectModel");
const ApiError = require("../utils/ApiError");
const classModel = require("../models/classModel");

const getSubjects = async () => {
    return await subjectModel.getSubjects();
};

const createSubject = async (subjectData) => {

    // Check if subject code already exists
    const existingCode = await subjectModel.getSubjectByCode(
        subjectData.subject_code
    );

    if (existingCode) {
        throw new ApiError(
            409,
            "Subject code already exists."
        );
    }

    // Check if subject name already exists
    const existingName = await subjectModel.getSubjectByName(
        subjectData.subject_name
    );

    if (existingName) {
        throw new ApiError(
            409,
            "Subject name already exists."
        );
    }

    return await subjectModel.createSubject(subjectData);

};

const getSubjectsByClass = async (classId) => {

    return await subjectModel.getSubjectsByClass(classId);

};

module.exports = {
    getSubjects,
    createSubject,
    getSubjectsByClass
};