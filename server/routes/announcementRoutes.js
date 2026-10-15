const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const authorize = require("../middlewares/authorize");
const authenticate = require("../middlewares/authenticate");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const ROLES = require("../constants/roles");

router.get("/notifications", authenticate, schoolDatabaseContext, announcementController.getAnnouncementNotifications);
router.patch("/read-all", authenticate, schoolDatabaseContext, announcementController.markAllAnnouncementsRead);
router.patch("/:id/read", authenticate, schoolDatabaseContext, announcementController.markAnnouncementRead);

router.post("/", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.PRINCIPAL), announcementController.createAnnouncement);
router.get("/", authenticate, schoolDatabaseContext, announcementController.getAnnouncements);
router.put("/:id", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.PRINCIPAL), announcementController.updateAnnouncement);
router.patch("/:id/deactivate", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.PRINCIPAL), announcementController.deactivateAnnouncement);

module.exports = router;
