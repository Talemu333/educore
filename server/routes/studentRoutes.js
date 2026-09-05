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
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.getStudentParents
);

// Student login account management.
// The temporary password is returned only when the account is created so the
// administrator can securely hand it to the student and require a change on first login.
router.post(
    "/:id/account",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.createStudentAccount
);

router.get(
    "/:id/account",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.getStudentAccount
);

module.exports = router;
