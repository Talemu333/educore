const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {createStudentSchema,updateStudentSchema} = require("../validators/studentValidator");
const ROLES = require("../constants/roles");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    validate(createStudentSchema),
    studentController.createStudent
);
// router.get(

//     "/search",

//     authenticate,

//     studentController.searchStudents

// );
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.getAllStudents
);
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.getStudentById
);
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validate(updateStudentSchema),
    studentController.updateStudent
);
router.patch(

    "/:id/deactivate",

    authenticate,

    authorize(ROLES.ADMIN),

    studentController.deactivateStudent

);
router.get(
    "/:id/parents",
    studentController.getStudentParents
);

module.exports = router;