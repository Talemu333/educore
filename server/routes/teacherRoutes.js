const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const teacherAssignmentController = require("../controllers/teacherAssignmentController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const authorizeAdminType = require("../middlewares/authorizeAdminType");
const validate = require("../middlewares/validate");
const {createTeacherSchema,updateTeacherSchema} = require("../validators/teacherValidator");
const ROLES = require("../constants/roles");

const academicAdmin = authorizeAdminType("proprietor", "principal", "vice_principal");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    academicAdmin,
    validate(createTeacherSchema),
    teacherController.createTeacher
);
router.get(
    "/",
    authenticate,
    teacherController.getTeachers
);
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    academicAdmin,
    validate(updateTeacherSchema),
    teacherController.updateTeacher
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
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    academicAdmin,
    teacherController.deactivateTeacher
);

module.exports = router;
