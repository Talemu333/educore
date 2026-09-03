const express = require("express");

const router = express.Router();

const generalController = require("../controllers/generalController");
const expenseRoutes = require("./expenseRoutes");

router.get("/", generalController.home);

router.get("/about", generalController.about);

// Finance routes are mounted here because the application already mounts
// this router at "/". This keeps the public/general route structure intact.
router.use("/api/expenses", expenseRoutes);

module.exports = router;