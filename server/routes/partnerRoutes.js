const express = require("express");
const rateLimit = require("../middlewares/rateLimit");
const authenticatePartner = require("../middlewares/partnerAuthenticate");
const partnerController = require("../controllers/partnerController");

const router = express.Router();

const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many partner authentication attempts. Please try again later."
});

router.post("/register", authLimit, partnerController.register);
router.post("/login", authLimit, partnerController.login);
router.post("/logout", partnerController.logout);
router.get("/me", authenticatePartner, partnerController.me);
router.get("/dashboard", authenticatePartner, partnerController.getDashboard);
router.post("/leads", authenticatePartner, partnerController.createLead);

module.exports = router;
