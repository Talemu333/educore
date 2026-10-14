const timetableModel = require("../models/timetableModel");
const teacherAssignmentModel = require("../models/teacherAssignmentModel");
const ApiError = require("../utils/ApiError");

const requireSchool = (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
};

const validateConflicts = async (data, assignment, schoolId, excludeId = null) => {
    if (data.end_time <= data.start_time) {
        throw new ApiError(400, "Lesson end time must be later than its start time.");
    }
    const teacherConflict = await timetableModel.hasTeacherConflict(
        assignment.teacher_id,
        data.day_of_week,
        data.start_time,
        data.end_time,
        schoolId,
        assignment.session_id,
        assignment.term_id,
        excludeId
    );
    if (teacherConflict) {
        throw new ApiError(409, "This teacher already has another lesson during that period in the selected session and term.");
    }

    const classConflict = await timetableModel.hasClassConflict(
        assignment.class_id,
        assignment.arm_id,
        data.day_of_week,
        data.start_time,
        data.end_time,
        schoolId,
        assignment.session_id,
        assignment.term_id,
        excludeId
    );
    if (classConflict) {
        throw new ApiError(409, "This class already has another subject during that period in the selected session and term.");
    }
};

const createTimetable = async (data, schoolId) => {
    requireSchool(schoolId);
    const assignment = await teacherAssignmentModel.getAssignmentDetails(data.teacher_assignment_id, schoolId);
    if (!assignment) throw new ApiError(404, "Teacher assignment not found.");

    await validateConflicts(data, assignment, schoolId);
    const created = await timetableModel.createTimetable(data, schoolId);
    if (!created) throw new ApiError(400, "Teacher assignment does not belong to this school.");
    return timetableModel.getTimetableById(created.id, schoolId);
};

const getTimetables = async (schoolId) => {
    requireSchool(schoolId);
    return timetableModel.getTimetables(schoolId);
};

const updateTimetable = async (id, data, schoolId) => {
    requireSchool(schoolId);
    const existing = await timetableModel.getTimetableById(id, schoolId);
    if (!existing) throw new ApiError(404, "Timetable entry not found.");

    const assignment = await teacherAssignmentModel.getAssignmentDetails(data.teacher_assignment_id, schoolId);
    if (!assignment) throw new ApiError(404, "Teacher assignment not found.");

    await validateConflicts(data, assignment, schoolId, Number(id));
    const updated = await timetableModel.updateTimetable(id, data, schoolId);
    if (!updated) throw new ApiError(404, "Timetable entry not found.");
    return timetableModel.getTimetableById(id, schoolId);
};

const deleteTimetable = async (id, schoolId) => {
    requireSchool(schoolId);
    const deleted = await timetableModel.deleteTimetable(id, schoolId);
    if (!deleted) throw new ApiError(404, "Timetable entry not found.");
};

module.exports = { createTimetable, getTimetables, updateTimetable, deleteTimetable };
