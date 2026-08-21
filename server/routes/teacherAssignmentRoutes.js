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


router.get(

    "/my-assignments",

    authenticate,

    teacherAssignmentController.getMyAssignments

);

router.get(

    "/my-students",

    authenticate,

    teacherAssignmentController.getMyStudents

);

router.get(
    "/teacher/:id",
    authenticate,
    teacherAssignmentController.getAssignmentsByTeacher
);

router.get(

    "/",

    authenticate,
    authorize(ROLE_NAMES.ADMIN),

    teacherAssignmentController
        .getAllAssignments

);

router.post(
    "/",
    authenticate,
    authorize(ROLE_NAMES.ADMIN),
    validate(createAssignmentSchema),
    teacherAssignmentController.createAssignment
);

router.delete(
    "/:id",
    authenticate,
    authorize(ROLE_NAMES.ADMIN),
    teacherAssignmentController.deleteAssignment
);

router.put(

    "/:id",

    authenticate,

    authorize(ROLE_NAMES.ADMIN),

    validate(createAssignmentSchema),

    teacherAssignmentController.updateAssignment

);


module.exports = router;