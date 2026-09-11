const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const ROLES = require("../constants/roles");
const classController = require("../controllers/classController");

router.get("/", authenticate, schoolDatabaseContext, classController.getClasses);
router.get("/:id/arms", authenticate, schoolDatabaseContext, classController.getClassArms);
router.post(
    "/",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    classController.createClass
);

module.exports = router;
