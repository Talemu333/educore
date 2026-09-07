const express = require("express");

const router = express.Router();

const contactMessageController = require("../controllers/contactMessageController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const rateLimit = require("../middlewares/rateLimit");
const ROLES = require("../constants/roles");

const contactLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: "Too many contact submissions. Please try again later."
});

router.post(
    "/",
    contactLimit,
    contactMessageController.createContactMessage
);

router.get(
    "/admin",
    authenticate,
    authorize(ROLES.ADMIN),
    contactMessageController.getContactMessages
);

router.patch(
    "/admin/:id/status",
    authenticate,
    authorize(ROLES.ADMIN),
    contactMessageController.updateContactMessageStatus
);

module.exports = router;
