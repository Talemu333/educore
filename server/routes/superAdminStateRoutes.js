const express = require("express");
const authenticate = require("../middlewares/authenticate");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");
const stateController = require("../controllers/stateController");

const router = express.Router();

router.use((req, res, next) => {
    req.skipSchoolContext = true;
    next();
}, authenticate, requireSuperAdmin);

router.get("/", stateController.getStates);
router.post("/", stateController.createState);

module.exports = router;
