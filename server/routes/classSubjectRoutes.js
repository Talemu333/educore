const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const ROLE_NAMES = require("../config/roleNames");
const classSubjectController = require("../controllers/classSubjectController");
const { createClassSubjectsSchema } = require("../validators/classSubjectValidator");

router.post(
    "/",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
    validate(createClassSubjectsSchema),
    classSubjectController.saveClassSubjects
);

router.get(
    "/:classId",
    authenticate,
    schoolDatabaseContext,
    classSubjectController.getClassSubjects
);

module.exports = router;
