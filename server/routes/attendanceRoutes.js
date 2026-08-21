const express = require("express");

const router = express.Router();

const attendanceController =
    require("../controllers/attendanceController");

const authenticate =
    require("../middlewares/authenticate");

const authorize =
    require("../middlewares/authorize");

const ROLES =
    require("../constants/roles");


/*
=========================================
SAVE / UPDATE ATTENDANCE
=========================================
*/

router.post(

    "/",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER

    ),

    attendanceController.saveAttendance

);


/*
=========================================
GET ATTENDANCE BY DATE
=========================================
*/

router.get(

    "/",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER

    ),

    attendanceController.getAttendanceByDate

);


/*
=========================================
GET STUDENT ATTENDANCE
=========================================
*/

router.get(

    "/students",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER

    ),

    attendanceController
        .getStudentsForAttendance

);

router.get(

    "/student/:studentId",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER,

        ROLES.PARENT

    ),

    attendanceController.getStudentAttendance

);


/*
=========================================
GET ATTENDANCE SUMMARY
=========================================
*/

router.get(

    "/student/:studentId/summary",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER,

        ROLES.PARENT

    ),

    attendanceController.getAttendanceSummary

);

router.get(

    "/assignment/:assignmentId/students",

    authenticate,

    authorize(
        ROLES.TEACHER
    ),

    attendanceController
        .getTeacherAttendanceStudents

);

router.get(

    "/assignment/:assignmentId",

    authenticate,

    authorize(
        ROLES.TEACHER
    ),

    attendanceController
        .getAttendanceByAssignment

);


module.exports = router;