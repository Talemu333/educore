const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");
const classController = require("../controllers/classController");

router.get("/", classController.getClasses);
router.get("/:id/arms", authenticate, classController.getClassArms);
router.post("/", classController.createClass);
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    classController.createClass
);

module.exports = router;