const express = require("express");
const multer = require("multer");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../config/roles");
const controller = require("../controllers/cbtPdfImportController");

const staffRoles = [ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL];
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) return cb(null, true);
        return cb(new Error("Only PDF files are allowed."));
    },
});

router.use(authenticate);
router.post("/preview", authorize(...staffRoles), upload.single("pdf"), controller.preview);
router.post("/import", authorize(...staffRoles), controller.importQuestions);

module.exports = router;
