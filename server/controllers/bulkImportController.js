const bulkImportService = require("../services/bulkImportService");

const ALLOWED_TYPES = new Set([
    "students",
    "teachers",
    "parents",
    "payments",
    "expenses",
    "results"
]);

const importData = async (req, res, next) => {
    try {
        const type = String(req.body.type || "").trim().toLowerCase();
        if (!ALLOWED_TYPES.has(type)) {
            return res.status(400).json({ success: false, message: "Invalid import type." });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload an Excel or CSV file." });
        }
        if (!req.user?.school_id) {
            return res.status(403).json({ success: false, message: "School context is required." });
        }

        const result = await bulkImportService.importFile({
            buffer: req.file.buffer,
            type,
            schoolId: req.user.school_id,
            userId: req.user.id
        });

        return res.json({ success: true, message: "Bulk import completed.", result });
    } catch (error) {
        next(error);
    }
};

module.exports = { importData };
