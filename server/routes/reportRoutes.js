const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../config/roles");

router.get(

    "/student/:studentId",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.TEACHER

    ),

    reportController.getStudentReport

);
router.get(

    "/transcript/:studentId",

    authenticate,

    reportController.getStudentTranscript

);

module.exports = router;