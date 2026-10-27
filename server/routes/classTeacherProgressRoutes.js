const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const authorizeAdminType = require("../middlewares/authorizeAdminType");
const ROLES = require("../constants/roles");
const controller = require("../controllers/classTeacherProgressController");
const ROLE_NAMES = require("../config/roleNames");

const academicAdmin = authorizeAdminType("proprietor", "principal", "vice_principal");

router.use(authenticate);

// Class-teacher workspace. authenticate resolves the tenant database context.
router.get("/my-classes", authorize(ROLES.TEACHER), controller.listMyClasses);
router.get("/my-classes/:assignmentId/students", authorize(ROLES.TEACHER), controller.listClassStudents);
router.post("/reports/drafts", authorize(ROLES.TEACHER), controller.createDraftReport);
router.post("/reports/:reportId/submit", authorize(ROLES.TEACHER), controller.submitDraftReport);

// School leadership review workflow. Parents cannot access these endpoints.
router.get("/parent/reports", authorize(ROLE_NAMES.PARENT), controller.listPublishedParentReports);
router.get("/admin/review", authorize(ROLES.ADMIN), academicAdmin, controller.listReportsForReview);
router.post("/admin/reports/:reportId/review", authorize(ROLES.ADMIN), academicAdmin, controller.reviewReport);
router.post("/admin/reports/:reportId/publish", authorize(ROLES.ADMIN), academicAdmin, controller.publishReport);

module.exports = router;
