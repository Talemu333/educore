const express = require("express");
const authenticate = require("../middlewares/authenticate");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");
const controller = require("../controllers/partnerAdminController");

const router = express.Router();
router.use(authenticate, requireSuperAdmin);

router.get("/overview", controller.getOverview);
router.patch("/partners/:id/status", controller.setPartnerStatus);
router.patch("/leads/:id/status", controller.setLeadStatus);
router.post("/commissions", controller.createCommission);
router.patch("/commissions/:id/status", controller.setCommissionStatus);

module.exports = router;