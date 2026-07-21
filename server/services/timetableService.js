const timetableModel = require("../models/timetableModel");
const teacherAssignmentModel = require("../models/teacherAssignmentModel");
const ApiError = require("../utils/ApiError");

const createTimetable = async (data) => {

    const assignment = await teacherAssignmentModel.getAssignmentDetails(data.teacher_assignment_id);

    if (!assignment) {

        throw new ApiError(
            404,
            "Teacher assignment not found."
        );

    }

    const teacherConflict =
    await timetableModel.hasTeacherConflict(

        assignment.teacher_id,

        data.day_of_week,

        data.start_time,

        data.end_time

    );

    if (teacherConflict) {

        throw new ApiError(

            409,

            "Teacher already has another class during this period."

        );

    }

    const classConflict =
    await timetableModel.hasClassConflict(

        assignment.class_id,

        assignment.arm_id,

        data.day_of_week,

        data.start_time,

        data.end_time

    );

    if (classConflict) {

        throw new ApiError(

            409,

            "This class already has another subject during this period."

        );

    }

    const timetable = await timetableModel.createTimetable(data);
    return await timetableModel.getTimetableById(timetable.id);

}

module.exports = {

    createTimetable

};