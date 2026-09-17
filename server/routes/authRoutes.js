const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authController = require("../controllers/authController");
const rateLimit = require("../middlewares/rateLimit");
const schoolDatabaseMiddleware = require("../middlewares/schoolDatabase");

const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many login attempts. Please try again later."
});

const passwordResetLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many password reset requests. Please try again later."
});

const keepSuperAdminOnPlatformDatabase = (req, res, next) => {
    const roleName = req.user?.role_name?.trim()?.toLowerCase();
    if (roleName === "super admin") req.skipSchoolContext = true;
    return next();
};

// School subdomain/custom-domain logins must resolve their tenant database
// before Passport checks the credentials.
router.post(
    "/login",
    loginLimit,
    schoolDatabaseMiddleware,
    authController.login
);

router.post("/logout", authController.logout);
router.post("/forgot-password", passwordResetLimit, authController.requestPasswordReset);
router.post("/reset-password", passwordResetLimit, authController.resetPassword);

router.get(
    "/me",
    keepSuperAdminOnPlatformDatabase,
    schoolDatabaseMiddleware,
    authenticate,
    authController.getCurrentUser
);

router.post(
    "/change-password",
    keepSuperAdminOnPlatformDatabase,
    schoolDatabaseMiddleware,
    authenticate,
    authController.changePassword
);

router.post(
    "/admin-reset-password/:userId",
    keepSuperAdminOnPlatformDatabase,
    schoolDatabaseMiddleware,
    authenticate,
    authController.resetPasswordByAdmin
);

module.exports = router;
