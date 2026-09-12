const express = require("express");
const router = express.Router();
const schoolSettingsController = require("../controllers/schoolSettingController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLE_NAMES = require("../config/roleNames");

// Public website requests identify the school with a slug/domain query or
// with the school hostname resolved by schoolDatabase middleware.
// Authenticated requests without a public identifier continue to use the
// logged-in user's school context.
router.get("/", (req, res, next) => {
    if (req.school?.school_id || req.query.schoolSlug || req.query.schoolDomain) {
        return next();
    }
    return authenticate(req, res, next);
}, schoolSettingsController.getSchoolSettings);

router.put(
    "/",
    authenticate,
    authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
    schoolSettingsController.updateSchoolSettings
);

module.exports = router;
