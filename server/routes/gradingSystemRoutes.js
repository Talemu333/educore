const express = require("express");
const router = express.Router();
const gradingSystemController = require("../controllers/gradingSystemController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { gradingSystemSchema } = require("../validators/gradingSystemValidator");
const ROLES = require("../config/roles");

router.get("/", authenticate, gradingSystemController.getAllGradingSystems);
router.get("/:id", authenticate, gradingSystemController.getGradingSystemById);

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    validate(gradingSystemSchema),
    gradingSystemController.createGradingSystem
);

router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    validate(gradingSystemSchema),
    gradingSystemController.updateGradingSystem
);

router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    gradingSystemController.deleteGradingSystem
);

module.exports = router;