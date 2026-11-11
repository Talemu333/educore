const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../config/roles");
const controller = require("../controllers/cbtQuestionBankController");
const { ensureSharedDatabaseResultApprovalMigration } = require("../config/schoolDatabaseManager");

const staffRoles = [ROLES.ADMIN,ROLES.TEACHER,ROLES.PRINCIPAL,ROLES.VICE_PRINCIPAL];
router.use(authenticate);
router.use(async (req, res, next) => {
    try {
        await ensureSharedDatabaseResultApprovalMigration();
        return next();
    } catch (error) {
        return next(error);
    }
});
router.get("/", authorize(...staffRoles), controller.list);
router.get("/groups", authorize(...staffRoles), controller.listGroups);
router.post("/groups", authorize(...staffRoles), controller.createGroup);
router.put("/groups/:groupId", authorize(...staffRoles), controller.updateGroup);
router.get("/:id", authorize(...staffRoles), controller.get);
router.post("/", authorize(...staffRoles), controller.create);
router.put("/:id", authorize(...staffRoles), controller.update);
router.delete("/bulk", authorize(...staffRoles), controller.bulkRemove);
router.delete("/:id", authorize(...staffRoles), controller.remove);
router.post("/copy-to-exam/:examId", authorize(...staffRoles), controller.copyToExam);

module.exports = router;
