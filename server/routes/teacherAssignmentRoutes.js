const express = require("express");

const router = express.Router();

const teacherAssignmentController = require("../controllers/teacherAssignmentController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
    createAssignmentSchema
} = require("../validators/teacherAssignmentValidator");

const ROLE_NAMES = require("../config/roleNames");

router.post(
    "/",
    authenticate,
    authorize(ROLE_NAMES.ADMIN),
    validate(createAssignmentSchema),
    teacherAssignmentController.createAssignment
);

module.exports = router;