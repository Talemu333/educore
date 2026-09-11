const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const notificationController = require("../controllers/notificationController");

router.get(
    "/",
    authenticate,
    schoolDatabaseContext,
    notificationController.getMyNotifications
);

router.patch(
    "/:id/read",
    authenticate,
    schoolDatabaseContext,
    notificationController.markAsRead
);

module.exports = router;
