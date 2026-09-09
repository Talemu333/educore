const express = require("express");
const multer = require("multer");
const authenticate = require("../middlewares/authenticate");
const bulkImportController = require("../controllers/bulkImportController");

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.use(authenticate);
router.post("/", upload.single("file"), bulkImportController.importData);

module.exports = router;
