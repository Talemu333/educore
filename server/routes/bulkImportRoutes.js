const express = require("express");
const multer = require("multer");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const bulkImportController = require("../controllers/bulkImportController");

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.use(authenticate);
router.use(authorize("Admin", "Super Admin"));
router.post("/", upload.single("file"), bulkImportController.importData);

module.exports = router;
