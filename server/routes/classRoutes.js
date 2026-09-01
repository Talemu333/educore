const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");
const classController = require("../controllers/classController");

router.get("/", authenticate, classController.getClasses);
router.get("/:id/arms", authenticate, classController.getClassArms);
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    classController.createClass
);

module.exports = router;