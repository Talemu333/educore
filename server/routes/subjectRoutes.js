const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const subjectController = require("../controllers/subjectController");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");
const validate = require("../middlewares/validate");
const { createSubjectSchema } = require("../validators/subjectValidator");

router.get(
    "/",
    authenticate,
    subjectController.getSubjects
);
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    validate(createSubjectSchema),
    subjectController.createSubject
);

module.exports = router;
