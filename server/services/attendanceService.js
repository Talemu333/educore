const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const attendanceModel = require("../models/attendanceModel");
const studentModel = require("../models/studentModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const classModel = require("../models/classModel");

const createAttendance = async (data, userId) => {

    // Validate session
    const session = await sessionModel.getSessionById(data.session_id);
    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }
    // Validate term
    const term = await termModel.getTermById(data.term_id);
    if (!term) {

        throw new ApiError(
            404,
            "Term not found."
        );

    }
    // Validate class
    const classData = await classModel.getClassById(data.class_id);
    if (!classData) {
        throw new ApiError(
            404,
            "Class not found."
        );
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        for (const item of data.students) {

            // Validate student
            const student =
                await studentModel.getStudentById(
                    item.student_id
                );

            if (!student) {

                throw new ApiError(
                    404,
                    `Student with ID ${item.student_id} not found.`
                );

            }

            // Check attendance
            const alreadyMarked =
                await attendanceModel.attendanceExists(

                    item.student_id,

                    data.attendance_date

                );

            if (alreadyMarked) {

                throw new ApiError(

                    409,

                    `${student.first_name} ${student.surname} has already been marked for attendance.`

                );

            }

            const attendanceData = {

                student_id: item.student_id,

                session_id: data.session_id,

                term_id: data.term_id,

                class_id: data.class_id,

                arm_id: data.arm_id,

                attendance_date: data.attendance_date,

                status: item.status,

                marked_by: userId

            };

            await attendanceModel.createAttendance(

                attendanceData,

                client

            );

        }

        await client.query("COMMIT");

        return {

            attendance_date: data.attendance_date,
            class: classData.class_name,
            students_marked: data.students.length

        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

};

const getAttendanceSummary = async (studentId) => {
    const summary = await attendanceModel.getAttendanceSummary(studentId);
    const totalDays = Number(summary.total_days || 0);
    const presentDays = Number(summary.present_days || 0);
    const absentDays = Number(summary.absent_days || 0);
    const lateDays = Number(summary.late_days || 0);
    const percentage =
        totalDays === 0
            ? 0
            : (presentDays / totalDays) * 100;
    return {

        total_days: totalDays,

        present_days: presentDays,

        absent_days: absentDays,

        late_days: lateDays,

        attendance_percentage:
            Number(percentage.toFixed(2))

    };
};

module.exports = {
    createAttendance,
    getAttendanceSummary
}

