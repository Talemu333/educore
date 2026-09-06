const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../config/roles");
const controller = require("../controllers/cbtQuestionBankController");

const staffRoles = [ROLES.ADMIN,ROLES.TEACHER,ROLES.PRINCIPAL,ROLES.VICE_PRINCIPAL];
router.use(authenticate);
router.get("/", authorize(...staffRoles), controller.list);
router.get("/:id", authorize(...staffRoles), controller.get);
router.post("/", authorize(...staffRoles), controller.create);
router.put("/:id", authorize(...staffRoles), controller.update);
router.delete("/:id", authorize(...staffRoles), controller.remove);
router.post("/copy-to-exam/:examId", authorize(...staffRoles), controller.copyToExam);

module.exports = router;
