const express = require("express");

const router = express.Router();

const authenticate =
require("../middlewares/authenticate");

const notificationController =
require("../controllers/notificationController");

router.get(

    "/",

    authenticate,

    notificationController.getMyNotifications

);
router.patch(

    "/:id/read",

    authenticate,

    notificationController.markAsRead

);

module.exports = router;