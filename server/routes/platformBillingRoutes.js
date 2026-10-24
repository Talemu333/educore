const express = require("express");
const authenticate = require("../middlewares/authenticate");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");
const controller = require("../controllers/platformBillingController");

const router = express.Router();

// Platform billing must always use the central database, never a tenant DB.
router.use((req, res, next) => {
    req.skipSchoolContext = true;
    next();
}, authenticate, requireSuperAdmin);

router.get("/", controller.overview);
router.post("/subscriptions", controller.createSubscription);
router.post("/payments", controller.createPayment);

module.exports = router;