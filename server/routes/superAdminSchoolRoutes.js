const express = require("express");
const authenticate = require("../middlewares/authenticate");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");
const controller = require("../controllers/superAdminSchoolController");
const { migrateSchoolData } = require("../scripts/migrateSchoolData");

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get("/", controller.getSchools);
router.get("/:id", controller.getSchool);
router.post("/", controller.createSchool);
router.post("/:id/administrator", controller.createSchoolAdministrator);
router.post("/:id/migrate-data", async (req, res, next) => {
    const schoolId = Number(req.params.id);

    if (schoolId !== 1) {
        return res.status(400).json({
            success: false,
            message: "Legacy data migration is only enabled for School 1. Other schools are created from scratch."
        });
    }

    try {
        const result = await migrateSchoolData(schoolId, { force: true });
        return res.json({ success: true, schoolId, ...result });
    } catch (error) {
        console.error(`School ${schoolId} data migration failed:`, error);
        return next(error);
    }
});
router.put("/:id", controller.updateSchool);
router.patch("/:id/status", controller.setSchoolStatus);
router.patch("/:id/domain", controller.setSchoolDomain);

module.exports = router;
