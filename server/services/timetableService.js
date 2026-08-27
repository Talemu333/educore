const timetableModel = require("../models/timetableModel");
const teacherAssignmentModel = require("../models/teacherAssignmentModel");
const ApiError = require("../utils/ApiError");

const createTimetable = async (data, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");

    const assignment = await teacherAssignmentModel.getAssignmentDetails(data.teacher_assignment_id, schoolId);
    if (!assignment) throw new ApiError(404, "Teacher assignment not found.");

    const teacherConflict = await timetableModel.hasTeacherConflict(
        assignment.teacher_id, data.day_of_week, data.start_time, data.end_time, schoolId
    );
    if (teacherConflict) throw new ApiError(409, "Teacher already has another class during this period.");

    const classConflict = await timetableModel.hasClassConflict(
        assignment.class_id, assignment.arm_id, data.day_of_week, data.start_time, data.end_time, schoolId
    );
    if (classConflict) throw new ApiError(409, "This class already has another subject during this period.");

    const timetable = await timetableModel.createTimetable(data, schoolId);
    if (!timetable) throw new ApiError(400, "Teacher assignment does not belong to this school.");

    return timetableModel.getTimetableById(timetable.id, schoolId);
};

module.exports={createTimetable};