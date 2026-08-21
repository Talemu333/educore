const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");

const authController = require("../controllers/authController");

router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.get(
    "/me",
    authenticate,
    authController.getCurrentUser
);

router.post(
    "/change-password",
    authenticate,
    authController.changePassword
);

module.exports = router;