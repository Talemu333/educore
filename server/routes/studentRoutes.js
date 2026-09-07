const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const authorizeAdminType = require("../middlewares/authorizeAdminType");
const validate = require("../middlewares/validate");
const {createStudentSchema,updateStudentSchema} = require("../validators/studentValidator");
const ROLES = require("../constants/roles");

const academicAdmin = authorizeAdminType("proprietor", "principal", "vice_principal");

router.post("/", authenticate, authorize(ROLES.ADMIN), academicAdmin, validate(createStudentSchema), studentController.createStudent);
router.get("/", authenticate, authorize(ROLES.ADMIN), academicAdmin, studentController.getAllStudents);

router.get("/me", authenticate, authorize(ROLES.STUDENT), studentController.getMyStudentProfile);

router.get("/:id", authenticate, authorize(ROLES.ADMIN), academicAdmin, studentController.getStudentById);
router.put("/:id", authenticate, authorize(ROLES.ADMIN), academicAdmin, validate(updateStudentSchema), studentController.updateStudent);
router.patch("/:id/deactivate", authenticate, authorize(ROLES.ADMIN), academicAdmin, studentController.deactivateStudent);
router.get("/:id/parents", authenticate, authorize(ROLES.ADMIN), academicAdmin, studentController.getStudentParents);

router.post("/:id/account", authenticate, authorize(ROLES.ADMIN), academicAdmin, studentController.createStudentAccount);
router.get("/:id/account", authenticate, authorize(ROLES.ADMIN), academicAdmin, studentController.getStudentAccount);

module.exports = router;
