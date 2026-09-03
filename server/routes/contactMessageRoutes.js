const express = require("express");

const router = express.Router();

const contactMessageController = require("../controllers/contactMessageController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");

/*
=========================================
PUBLIC: CONTACT FORM
=========================================
*/

router.post(
    "/",
    contactMessageController.createContactMessage
);

/*
=========================================
ADMIN: CONTACT MESSAGES
=========================================
*/

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
