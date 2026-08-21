const pool = require("../config/database");

const ApiError = require("../utils/ApiError");

const attendanceModel =
    require("../models/attendanceModel");

const studentModel =
    require("../models/studentModel");

const sessionModel =
    require("../models/sessionModel");

const termModel =
    require("../models/termModel");

const classModel =
    require("../models/classModel");

const studentEnrollmentModel =
    require("../models/studentEnrollmentModel");

const teacherAssignmentService =
    require("./teacherAssignmentService");


/*
=========================================
SAVE / UPDATE ATTENDANCE
=========================================
*/

const saveAttendance = async (data, userId) => {

    /*
    -------------------------------------
    VALIDATE REQUIRED DATA
    -------------------------------------
    */

    if (!data.session_id) {

        throw new ApiError(
            400,
            "Academic session is required."
        );

    }


    if (!data.term_id) {

        throw new ApiError(
            400,
            "Term is required."
        );

    }


    if (!data.class_id) {

        throw new ApiError(
            400,
            "Class is required."
        );

    }


    if (!data.attendance_date) {

        throw new ApiError(
            400,
            "Attendance date is required."
        );

    }


    if (
        !Array.isArray(data.students) ||
        data.students.length === 0
    ) {

        throw new ApiError(
            400,
            "No students were provided."
        );

    }


    /*
    -------------------------------------
    VALIDATE SESSION
    -------------------------------------
    */

    const session =
        await sessionModel.getSessionById(
            data.session_id
        );

    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }


    /*
    -------------------------------------
    VALIDATE TERM
    -------------------------------------
    */

    const term =
        await termModel.getTermById(
            data.term_id
        );

    if (!term) {

        throw new ApiError(
            404,
            "Term not found."
        );

    }


    /*
    -------------------------------------
    VALIDATE CLASS
    -------------------------------------
    */

    const classData =
        await classModel.getClassById(
            data.class_id
        );

    if (!classData) {

        throw new ApiError(
            404,
            "Class not found."
        );

    }


    /*
    -------------------------------------
    DATABASE TRANSACTION
    -------------------------------------
    */

    const client =
        await pool.connect();


    try {

        await client.query("BEGIN");


        const savedAttendance = [];


        /*
        ---------------------------------
        PROCESS EACH STUDENT
        ---------------------------------
        */

        for (
            const item of data.students
        ) {


            /*
            -------------------------------
            VALIDATE STUDENT
            -------------------------------
            */

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


            /*
            -------------------------------
            VALIDATE STATUS
            -------------------------------
            */

            const allowedStatuses = [

                "PRESENT",

                "ABSENT",

                "LATE",

                "EXCUSED"

            ];


            if (
                !allowedStatuses.includes(
                    item.status
                )
            ) {

                throw new ApiError(

                    400,

                    `Invalid attendance status for ${student.first_name} ${student.surname}.`

                );

            }


            /*
            -------------------------------
            UPSERT ATTENDANCE
            -------------------------------
            */

            const attendance =
                await attendanceModel.upsertAttendance(

                    {

                        student_id:
                            item.student_id,

                        session_id:
                            data.session_id,

                        term_id:
                            data.term_id,

                        class_id:
                            data.class_id,

                        arm_id:
                            data.arm_id || null,

                        attendance_date:
                            data.attendance_date,

                        status:
                            item.status,

                        marked_by:
                            userId

                    },

                    client

                );


            savedAttendance.push(
                attendance
            );

        }


        await client.query("COMMIT");


        return {

            attendance_date:
                data.attendance_date,

            class:
                classData.class_name,

            students_processed:
                savedAttendance.length,

            attendance:
                savedAttendance

        };


    } catch (error) {

        await client.query(
            "ROLLBACK"
        );

        throw error;

    } finally {

        client.release();

    }

};


/*
=========================================
GET ATTENDANCE BY DATE
=========================================
*/

const getAttendanceByDate = async ({
    sessionId,
    termId,
    classId,
    armId,
    attendanceDate
}) => {

    if (!sessionId) {

        throw new ApiError(
            400,
            "Academic session is required."
        );

    }

    if (!termId) {

        throw new ApiError(
            400,
            "Term is required."
        );

    }

    if (!classId) {

        throw new ApiError(
            400,
            "Class is required."
        );

    }

    if (!attendanceDate) {

        throw new ApiError(
            400,
            "Attendance date is required."
        );

    }

    return attendanceModel.getAttendanceByDate({

        sessionId,

        termId,

        classId,

        armId: armId || null,

        attendanceDate

    });

};


/*
=========================================
GET STUDENT ATTENDANCE
=========================================
*/

const getStudentAttendance = async ({
    studentId,
    sessionId,
    termId
}) => {

    const student =
        await studentModel.getStudentById(
            studentId
        );


    if (!student) {

        throw new ApiError(
            404,
            "Student not found."
        );

    }


    if (!sessionId) {

        throw new ApiError(
            400,
            "Academic session is required."
        );

    }


    if (!termId) {

        throw new ApiError(
            400,
            "Term is required."
        );

    }


    return attendanceModel
        .getStudentAttendance({

            studentId,

            sessionId,

            termId

        });

};


/*
=========================================
GET ATTENDANCE SUMMARY
=========================================
*/

const getAttendanceSummary = async (
    studentId,
    sessionId,
    termId
) => {

    const summary =
        await attendanceModel
            .getAttendanceSummary(
                studentId
            );


    const totalDays =
        Number(
            summary.total_days || 0
        );


    const presentDays =
        Number(
            summary.present_days || 0
        );


    const absentDays =
        Number(
            summary.absent_days || 0
        );


    const lateDays =
        Number(
            summary.late_days || 0
        );


    const excusedDays =
        Number(
            summary.excused_days || 0
        );


    const percentage =
        totalDays === 0

            ? 0

            : (
                presentDays /
                totalDays
            ) * 100;


    return {

        total_days:
            totalDays,

        present_days:
            presentDays,

        absent_days:
            absentDays,

        late_days:
            lateDays,

        excused_days:
            excusedDays,

        attendance_percentage:
            Number(
                percentage.toFixed(2)
            )

    };

};

const getStudentsForAttendance = async ({
    sessionId,
    classId,
    armId
}) => {

    return await studentEnrollmentModel
        .getStudentsForAttendance({

            sessionId,

            classId,

            armId

        });

};

const getStudentsForTeacherAttendance = async (
    assignmentId,
    userId
) => {

    const assignment =
        await teacherAssignmentService
            .getAssignmentForTeacherAttendance(
                assignmentId,
                userId
            );

    const students =
        await studentEnrollmentModel
            .getStudentsForAssignment(
                assignmentId
            );

    return {

        assignment,

        students

    };

};

const getAttendanceByAssignment = async (
    assignmentId,
    attendanceDate,
    user
) => {

    if (!attendanceDate) {

        throw new ApiError(
            400,
            "Attendance date is required."
        );

    }

    const assignment =
        await teacherAssignmentService
            .getAssignmentForTeacherAttendance(
                assignmentId,
                user.id
            );

    return attendanceModel
        .getAttendanceByDate({

            sessionId:
                assignment.session_id,

            termId:
                assignment.term_id,

            classId:
                assignment.class_id,

            armId:
                assignment.arm_id,

            attendanceDate

        });

};


module.exports = {

    saveAttendance,

    getAttendanceByDate,

    getStudentAttendance,

    getAttendanceSummary,

    getStudentsForAttendance,
    getStudentsForTeacherAttendance,
    getAttendanceByAssignment

};