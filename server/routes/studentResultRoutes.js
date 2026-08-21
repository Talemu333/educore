const express = require("express");
const router = express.Router();
const studentResultController = require("../controllers/studentResultController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
    createResultSchema,
    createBulkResultsSchema
} = require("../validators/studentResultValidator");

const ROLES = require("../config/roles");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.TEACHER),
    validate(createResultSchema),
    studentResultController.createResult
);

router.post(
    "/bulk",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.TEACHER),
    validate(createBulkResultsSchema),
    studentResultController.createBulkResults
);

// router.get(

//     "/assignment/:assignmentId/students",

//     authenticate,

//     authorize(ROLES.ADMIN, ROLES.TEACHER),

//     studentResultController.getStudentsForAssignment

// );

router.get(

    "/class-sheet",

    authenticate,

    authorize(ROLES.ADMIN),

    studentResultController
        .getClassResultSheet

);

router.get(

    "/broadsheet",

    authenticate,

    authorize(ROLES.ADMIN),

    studentResultController
        .getClassBroadsheet

);

router.get(

    "/assignment/:assignmentId/students",

    authenticate,

    authorize(
        ROLES.ADMIN,
        ROLES.TEACHER
    ),

    studentResultController
        .getStudentsForResultEntry

);

router.get(
    "/student/:studentId/session/:sessionId/term/:termId/report",

    authenticate,

    authorize(
        ROLES.ADMIN,
        ROLES.TEACHER,
        ROLES.PARENT
    ),

    studentResultController
        .getStudentResultReport
);

module.exports = router;