const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authController = require("../controllers/authController");
const rateLimit = require("../middlewares/rateLimit");

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

router.post("/login", loginLimit, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", passwordResetLimit, authController.requestPasswordReset);
router.post("/reset-password", passwordResetLimit, authController.resetPassword);

router.get("/me", keepSuperAdminOnPlatformDatabase, authenticate, authController.getCurrentUser);
router.post("/change-password", keepSuperAdminOnPlatformDatabase, authenticate, authController.changePassword);

module.exports = router;
