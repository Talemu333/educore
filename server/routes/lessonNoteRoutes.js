const express = require("express");
const router = express.Router();
const controller = require("../controllers/lessonNoteController");
const topicController = require("../controllers/lessonNoteTopicController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");

router.use(authenticate);

router.get("/meta", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.meta);

// Syllabus/topic browser and management.
router.get("/topics", authorize(ROLES.ADMIN, ROLES.TEACHER), topicController.list);
router.post("/topics", authorize(ROLES.ADMIN), topicController.create);
router.put("/topics/:id", authorize(ROLES.ADMIN), topicController.update);
router.delete("/topics/:id", authorize(ROLES.ADMIN), topicController.remove);

router.get("/", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.list);
router.get("/:id", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.get);
router.post("/", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.create);
router.put("/:id", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.update);
router.post("/:id/submit", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.submit);
router.post("/:id/review", authorize(ROLES.ADMIN), controller.review);
router.post("/:id/duplicate", authorize(ROLES.ADMIN, ROLES.TEACHER), controller.duplicate);

module.exports = router;
