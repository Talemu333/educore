const express = require("express");
const multer = require("multer");

const router = express.Router();

const announcementController =
    require("../controllers/announcementController");
const authorize = require("../middlewares/authorize");
const authenticate = require("../middlewares/authenticate");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const ROLES = require("../constants/roles");
const attachmentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5 } });
const uploadFiles = (req, res, next) => attachmentUpload.array("files", 5)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
        error.statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        error.message = error.code === "LIMIT_FILE_SIZE" ? "Each attachment must be no larger than 5 MB." : "Upload no more than 5 attachments at a time.";
    }
    next(error);
});

router.post(
    "/",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLES.ADMIN, ROLES.PRINCIPAL),
    announcementController.createAnnouncement
);

router.get(
    "/",
    authenticate,
    schoolDatabaseContext,
    announcementController.getAnnouncements
);

router.put(
    "/:id",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLES.ADMIN, ROLES.PRINCIPAL),
    announcementController.updateAnnouncement
);

router.patch(
    "/:id/deactivate",
    authenticate,
    schoolDatabaseContext,
    authorize(ROLES.ADMIN, ROLES.PRINCIPAL),
    announcementController.deactivateAnnouncement
);

router.get("/targets", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.PRINCIPAL), announcementController.getTargetOptions);
router.get("/:id/attachments/:attachmentId", authenticate, schoolDatabaseContext, announcementController.downloadAttachment);
router.post("/:id/attachments", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.PRINCIPAL), uploadFiles, announcementController.uploadAttachments);
router.delete("/:id/attachments/:attachmentId", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.PRINCIPAL), announcementController.deleteAttachment);
router.patch("/:id/pin", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.PRINCIPAL), announcementController.setPinned);
router.post("/:id/read", authenticate, schoolDatabaseContext, announcementController.markRead);

module.exports = router;
