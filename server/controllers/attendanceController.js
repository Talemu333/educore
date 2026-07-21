const attendanceService = require("../services/attendanceService");
const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError"); 


const createAttendance = asyncHandler(async (req, res) => {

    const result =
        await attendanceService.createAttendance(

            req.body,

            req.user.id

        );

    res.status(201).json({

        success: true,

        message: "Attendance recorded successfully.",

        data: result

    });

});

const getAttendanceByDate =
asyncHandler(async (req, res) => {

    const attendance =
        await attendanceService.getAttendanceByDate(

            req.query.class_id,

            req.query.arm_id,

            req.query.attendance_date

        );

    res.json({

        success: true,

        data: attendance

    });

});

const getStudentAttendance =
asyncHandler(async (req, res) => {

    const attendance =
        await attendanceService.getStudentAttendance(

            req.params.studentId

        );

    res.json({

        success: true,

        data: attendance

    });

});

module.exports = {

    createAttendance,

    getAttendanceByDate,

    getStudentAttendance

};