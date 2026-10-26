const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");
const controller = require("../controllers/classTeacherProgressController");

router.use(authenticate);
router.use(authorize(ROLES.TEACHER));
router.get("/my-classes", controller.listMyClasses);
router.get("/my-classes/:assignmentId/students", controller.listClassStudents);
router.post("/reports/drafts", controller.createDraftReport);

module.exports = router;
