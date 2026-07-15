const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");

const authController = require("../controllers/authController");

router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.get("/me", authenticate, (req, res) => {

    res.json({

        success: true,

        user: req.user

    });

});

module.exports = router;