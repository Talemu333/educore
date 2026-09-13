const express = require("express");
const router = express.Router();
const controller = require("../controllers/lessonNoteController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");

router.use(authenticate);

router.get("/meta", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.meta);
router.get("/", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.list);
router.get("/:id", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.get);
router.post("/", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.create);
router.put("/:id", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.update);
router.post("/:id/submit", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.submit);
router.post("/:id/review", authorize(ROLES.ADMIN), controller.review);
router.post("/:id/duplicate", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.duplicate);

module.exports = router;
