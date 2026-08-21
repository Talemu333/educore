const attendanceService =
    require("../services/attendanceService");

const asyncHandler =
    require("../middlewares/asyncHandler");


/*
=========================================
SAVE ATTENDANCE
=========================================

This handles BOTH:

- New attendance
- Updating existing attendance

The service/model decides whether to
INSERT or UPDATE.
=========================================
*/

const saveAttendance = asyncHandler(
    async (req, res) => {

        const result =
            await attendanceService.saveAttendance(

                req.body,

                req.user.id

            );


        res.status(200).json({

            success: true,

            message:
                "Attendance saved successfully.",

            data: result

        });

    }
);


/*
=========================================
GET ATTENDANCE BY DATE
=========================================
*/

const getAttendanceByDate = asyncHandler(
    async (req, res) => {

        const attendance =
            await attendanceService.getAttendanceByDate({

                sessionId:
                    req.query.session_id,

                termId:
                    req.query.term_id,

                classId:
                    req.query.class_id,

                armId:
                    req.query.arm_id || null,

                attendanceDate:
                    req.query.attendance_date

            });

        res.json({

            success: true,

            data: attendance

        });

    }
);


/*
=========================================
GET STUDENT ATTENDANCE
=========================================
*/

const getStudentAttendance = asyncHandler(
    async (req, res) => {

        const attendance =
            await attendanceService.getStudentAttendance({

                studentId:
                    req.params.studentId,

                sessionId:
                    req.query.session_id,

                termId:
                    req.query.term_id

            });


        res.json({

            success: true,

            data: attendance

        });

    }
);


/*
=========================================
GET ATTENDANCE SUMMARY
=========================================
*/

const getAttendanceSummary = asyncHandler(
    async (req, res) => {

        const summary =
            await attendanceService.getAttendanceSummary({

                studentId:
                    req.params.studentId,

                sessionId:
                    req.query.session_id,

                termId:
                    req.query.term_id

            });


        res.json({

            success: true,

            data: summary

        });

    }
);

const getStudentsForAttendance =
    asyncHandler(
        async (req, res) => {

            const students =
                await attendanceService
                    .getStudentsForAttendance({

                        sessionId:
                            req.query.session_id,

                        classId:
                            req.query.class_id,

                        armId:
                            req.query.arm_id ||
                            null

                    });


            res.json({

                success: true,

                data: students

            });

        }
    );

    const getTeacherAttendanceStudents =
    asyncHandler(
        async (req, res) => {

            const result =
                await attendanceService
                    .getStudentsForTeacherAttendance(

                        req.params.assignmentId,

                        req.user.id

                    );

            res.json({

                success: true,

                data: result

            });

        }
    );

    const getAttendanceByAssignment =
    asyncHandler(
        async (req, res) => {

            const attendance =
                await attendanceService
                    .getAttendanceByAssignment(

                        req.params.assignmentId,

                        req.query.attendance_date,

                        req.user

                    );

            res.json({

                success: true,

                data: attendance

            });

        }
    );


module.exports = {

    saveAttendance,

    getAttendanceByDate,

    getStudentAttendance,

    getAttendanceSummary,

    getStudentsForAttendance,
    getTeacherAttendanceStudents,
    getAttendanceByAssignment

};