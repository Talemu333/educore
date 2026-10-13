const express = require("express");
const router = express.Router();
const studentResultController = require("../controllers/studentResultController");
const resultPublicationController = require("../controllers/resultPublicationController");
const publishedStudentResultController = require("../controllers/publishedStudentResultController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const authorizeAdminType = require("../middlewares/authorizeAdminType");
const validate = require("../middlewares/validate");
const { createResultSchema, createBulkResultsSchema } = require("../validators/studentResultValidator");
const ROLES = require("../config/roles");

router.post("/", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(createResultSchema), studentResultController.createResult);
router.post("/bulk", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(createBulkResultsSchema), studentResultController.createBulkResults);

const resultPublicationManagers = authorizeAdminType("proprietor", "principal");
router.post("/publish", authenticate, authorize(ROLES.ADMIN), resultPublicationManagers, resultPublicationController.publishClassTermResults);
router.get("/publication", authenticate, authorize(ROLES.ADMIN), resultPublicationManagers, resultPublicationController.getPublication);

router.get("/class-sheet", authenticate, authorize(ROLES.ADMIN), studentResultController.getClassResultSheet);
router.get("/broadsheet", authenticate, authorize(ROLES.ADMIN), studentResultController.getClassBroadsheet);
router.get("/assignment/:assignmentId/students", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), studentResultController.getStudentsForResultEntry);

router.get("/my/session/:sessionId/term/:termId/report", authenticate, authorize(ROLES.STUDENT), publishedStudentResultController.getPublishedStudentResultReport);
router.get("/student/:studentId/session/:sessionId/term/:termId/report", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT), (req, res, next) => {
    if (req.user?.role_name === ROLES.PARENT) {
        return publishedStudentResultController.getPublishedStudentResultReport(req, res, next);
    }
    return studentResultController.getStudentResultReport(req, res, next);
});

module.exports = router;
