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

router.post("/login", loginLimit, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", passwordResetLimit, authController.requestPasswordReset);
router.post("/reset-password", passwordResetLimit, authController.resetPassword);

router.get("/me", authenticate, authController.getCurrentUser);
router.post("/change-password", authenticate, authController.changePassword);

module.exports = router;
