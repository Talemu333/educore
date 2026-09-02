const express = require("express");
const router = express.Router();
const schoolSettingsController = require("../controllers/schoolSettingController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLE_NAMES = require("../config/roleNames");

// Public website requests identify the school with ?schoolSlug=...
router.get("/", (req, res, next) => {
    if (req.query.schoolSlug) return next();
    return authenticate(req, res, next);
}, schoolSettingsController.getSchoolSettings);

router.put(
    "/",
    authenticate,
    authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
    schoolSettingsController.updateSchoolSettings
);

module.exports = router;
