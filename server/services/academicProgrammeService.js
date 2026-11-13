const ApiError = require("../utils/ApiError");
const model = require("../models/academicProgrammeModel");

const requireContext = (schoolId, database) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    if (!database) throw new ApiError(500, "School database context is unavailable.");
};

const withModelErrors = async (operation) => {
    try { return await operation(); }
    catch (error) {
        if (error.statusCode) throw new ApiError(error.statusCode, error.message);
        if (error.code === "23505") throw new ApiError(409, "A programme with this name already exists for the selected class.");
        throw error;
    }
};

const listProgrammes = async (classId, schoolId, database) => {
    requireContext(schoolId, database);
    return model.listProgrammes(classId, schoolId, database);
};

const createProgramme = async (data, schoolId, database) => {
    requireContext(schoolId, database);
    const result = await withModelErrors(() => model.createProgramme(data, schoolId, database));
    if (!result) throw new ApiError(400, "Programmes can only be created for a Senior class in this school.");
    return result;
};

const saveProgrammeSubjects = async (id, subjects, schoolId, database) => {
    requireContext(schoolId, database);
    return withModelErrors(() => model.saveProgrammeSubjects(id, subjects, schoolId, database));
};

const getStudentsForProgrammeAssignment = async (query, schoolId, database) => {
    requireContext(schoolId, database);
    if (!query.class_id || !query.session_id) throw new ApiError(400, "Class and academic session are required.");
    return model.getStudentsForProgrammeAssignment({ classId: Number(query.class_id), sessionId: Number(query.session_id), schoolId }, database);
};

const assignStudents = async (data, schoolId, assignedBy, database) => {
    requireContext(schoolId, database);
    if (!Array.isArray(data.student_ids) || !data.student_ids.length) throw new ApiError(400, "Select at least one student.");
    if (!Array.isArray(data.subject_ids) || !data.subject_ids.length) throw new ApiError(400, "Select at least one subject.");
    return withModelErrors(() => model.assignStudents({
        classId: Number(data.class_id),
        sessionId: Number(data.session_id),
        programmeId: Number(data.programme_id),
        studentIds: [...new Set(data.student_ids.map(Number))],
        subjectIds: data.subject_ids,
        assignedBy
    }, schoolId, database));
};

module.exports = { listProgrammes, createProgramme, saveProgrammeSubjects, getStudentsForProgrammeAssignment, assignStudents };
