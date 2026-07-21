const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {createAttendanceSchema} = require("../validators/attendanceValidator");
const ROLES = require("../constants/roles");

router.post(

    "/",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER

    ),

    validate(createAttendanceSchema),

    attendanceController.createAttendance

);

router.get(

    "/",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER

    ),

    attendanceController.getAttendanceByDate

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

module.exports = router;