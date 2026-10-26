const ApiError = require("../utils/ApiError");
const model = require("../models/classTeacherAssignmentModel");

const listAssignments = async (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return model.listAssignments(schoolId);
};

const createAssignment = async (payload, schoolId, userId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const teacherId = Number(payload.teacher_id);
    const classId = Number(payload.class_id);
    const sessionId = Number(payload.session_id);
    const armId = payload.arm_id ? Number(payload.arm_id) : null;
    if (![teacherId, classId, sessionId].every(Number.isInteger) ||
        teacherId < 1 || classId < 1 || sessionId < 1 ||
        (armId !== null && (!Number.isInteger(armId) || armId < 1))) {
        throw new ApiError(400, "Select a valid teacher, class, session, and optional arm.");
    }
    const refs = await model.validateReferences({
        teacher_id: teacherId, class_id: classId, arm_id: armId, session_id: sessionId
    }, schoolId);
    if (!refs.teacher_ok) throw new ApiError(404, "Active teacher not found in this school.");
    if (!refs.class_ok) throw new ApiError(404, "Class not found in this school.");
    if (!refs.session_ok) throw new ApiError(404, "Academic session not found in this school.");
    if (!refs.arm_ok) throw new ApiError(400, "The selected arm does not belong to the selected class.");
    try {
        return await model.createAssignment({
            teacher_id: teacherId, class_id: classId, arm_id: armId,
            session_id: sessionId, assigned_by: userId
        }, schoolId);
    } catch (error) {
        if (error.code === "23505") {
            throw new ApiError(409, "This class/arm already has an active class teacher for the selected session. Deactivate the existing assignment first.");
        }
        throw error;
    }
};

const deactivateAssignment = async (id, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const assignment = await model.deactivateAssignment(Number(id), schoolId);
    if (!assignment) throw new ApiError(404, "Active class teacher assignment not found.");
};

module.exports = { listAssignments, createAssignment, deactivateAssignment };
