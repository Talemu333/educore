const express = require("express");
const router = express.Router();
const gradingSystemController = require("../controllers/gradingSystemController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const { gradingSystemSchema } = require("../validators/gradingSystemValidator");
const ROLES = require("../config/roles");

router.get("/", authenticate, schoolDatabaseContext, gradingSystemController.getAllGradingSystems);
router.get("/:id", authenticate, schoolDatabaseContext, gradingSystemController.getGradingSystemById);

router.post(
    "/",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    validate(gradingSystemSchema),
    gradingSystemController.createGradingSystem
);

router.put(
    "/:id",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    validate(gradingSystemSchema),
    gradingSystemController.updateGradingSystem
);

router.delete(
    "/:id",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    gradingSystemController.deleteGradingSystem
);

module.exports = router;
