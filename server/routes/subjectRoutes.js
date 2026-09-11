const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const subjectController = require("../controllers/subjectController");
const authorize = require("../middlewares/authorize");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const ROLES = require("../constants/roles");
const validate = require("../middlewares/validate");
const { createSubjectSchema } = require("../validators/subjectValidator");

router.get("/", authenticate, schoolDatabaseContext, subjectController.getSubjects);
router.get("/my", authenticate, schoolDatabaseContext, authorize(ROLES.STUDENT), subjectController.getMySubjects);
router.get("/class/:classId", authenticate, schoolDatabaseContext, subjectController.getSubjectsByClass);
router.post("/", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(createSubjectSchema), subjectController.createSubject);

module.exports = router;
