const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../config/roles");
const controller = require("../controllers/cbtController");
const reportController = require("../controllers/cbtReportController");

const staffRoles = [ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL];

router.use(authenticate);

// Student routes
router.get("/exams/available", authorize(ROLES.STUDENT), controller.getAvailableStudentExams);
router.get("/exams/available/:id", authorize(ROLES.STUDENT), controller.getStudentExam);
router.get("/my-attempts", authorize(ROLES.STUDENT), controller.getMyAttempts);
router.post("/exams/:examId/start", authorize(ROLES.STUDENT), controller.startAttempt);
router.post("/attempts/:attemptId/answers", authorize(ROLES.STUDENT), controller.saveAnswer);
router.post("/attempts/:attemptId/submit", authorize(ROLES.STUDENT), controller.submitAttempt);

// Staff routes
router.get("/exams", authorize(...staffRoles), controller.getExams);
router.get("/exams/:id", authorize(...staffRoles), controller.getExam);
router.post("/exams", authorize(...staffRoles), controller.createExam);
router.put("/exams/:id", authorize(...staffRoles), controller.updateExam);
router.delete("/exams/:id", authorize(...staffRoles), controller.deleteExam);
router.post("/exams/:examId/questions", authorize(...staffRoles), controller.createQuestion);
router.put("/questions/:id", authorize(...staffRoles), controller.updateQuestion);
router.delete("/questions/:id", authorize(...staffRoles), controller.deleteQuestion);
router.get("/reports/attempts", authorize(...staffRoles), reportController.getAttempts);
router.get("/reports/attempts/:id", authorize(...staffRoles), reportController.getAttempt);
router.get("/reports/exams/:examId/performance", authorize(...staffRoles), reportController.getPerformance);

module.exports = router;
