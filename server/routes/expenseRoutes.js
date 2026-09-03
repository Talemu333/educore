const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");
const authenticate = require("../middlewares/authenticate");

router.use(authenticate);

router.get("/summary", expenseController.getExpenseSummary);
router.get("/", expenseController.getExpenses);
router.get("/:id", expenseController.getExpense);
router.post("/", expenseController.createExpense);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
