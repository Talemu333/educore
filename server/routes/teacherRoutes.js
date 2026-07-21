const express = require("express");

const router = express.Router();

const teacherController = require("../controllers/teacherController");
const teacherAssignmentController = require("../controllers/teacherAssignmentController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const { createTeacherSchema } = require("../validators/teacherValidator");

const ROLES = require("../config/roles");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    validate(createTeacherSchema),
    teacherController.createTeacher
);
router.get(
    "/",
    authenticate,
    teacherController.getTeachers
);
router.get(
    "/:id",
    authenticate,
    teacherController.getTeacherById
);
router.get(
    "/:id/assignments",
    authenticate,
    teacherAssignmentController.getAssignmentsByTeacher
);
module.exports = router;