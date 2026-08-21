const express = require("express");

const router = express.Router();

const announcementController =
    require("../controllers/announcementController");
const authorize = require("../middlewares/authorize");
const authenticate = require("../middlewares/authenticate");
const ROLES = require("../constants/roles");



router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN,ROLES.PRINCIPAL),
    announcementController.createAnnouncement
);
router.get(

    "/",

    authenticate,

    announcementController.getAnnouncements

);
router.put(

    "/:id",

    authenticate,
    authorize(ROLES.ADMIN,ROLES.PRINCIPAL),
    announcementController.updateAnnouncement

);
router.patch(

    "/:id/deactivate",

    authenticate,
    authorize(ROLES.ADMIN,ROLES.PRINCIPAL),
    announcementController.deactivateAnnouncement

);



module.exports = router;