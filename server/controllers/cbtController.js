const cbtModel = require("../models/cbtModel");
const pool = require("../config/database");
const ApiError = require("../utils/ApiError");

const schoolId = (req) => Number(req.user.school_id);
const userId = (req) => Number(req.user.id);

const studentId = (req) => {
    const id = Number(req.user.student_id);
    if (!Number.isInteger(id) || id < 1) {
        throw new ApiError(403, "This student account is not linked to a student record.");
    }
    return id;
};

const sendError = (res, error) => {
    console.error("CBT request error:", error);
    return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || "Unable to process CBT request.",
    });
};

const validateQuestionOptions = (options) => {
    if (!Array.isArray(options) || options.length < 2) {
        throw new ApiError(400, "A multiple-choice question must have at least two options.");
    }
    const validOptions = options.filter((option) => option && String(option.option_text || "").trim());
    if (validOptions.length < 2) {
        throw new ApiError(400, "At least two answer options are required.");
    }
    if (validOptions.filter((option) => Boolean(option.is_correct)).length !== 1) {
        throw new ApiError(400, "Each multiple-choice question must have exactly one correct answer.");
    }
};

const validateExam = (data) => {
    if (!String(data.title || "").trim()) throw new ApiError(400, "Examination title is required.");
    if (!Number.isFinite(Number(data.subject_id)) || !Number.isFinite(Number(data.class_id))) {
        throw new ApiError(400, "Subject and class are required.");
    }
    if (!Number.isFinite(Number(data.duration_minutes)) || Number(data.duration_minutes) <= 0) {
        throw new ApiError(400, "Examination duration must be greater than zero.");
    }
    if (data.question_selection_count !== undefined && (!Number.isInteger(Number(data.question_selection_count)) || Number(data.question_selection_count) < 0)) {
        throw new ApiError(400, "Questions per attempt must be a whole number of zero or greater.");
    }
    if (data.status === "published" && (!Number.isFinite(Number(data.total_marks)) || Number(data.total_marks) <= 0)) {
        throw new ApiError(400, "A published examination must have total marks greater than zero.");
    }
    if (data.starts_at && data.ends_at && new Date(data.ends_at) <= new Date(data.starts_at)) {
        throw new ApiError(400, "Examination end time must be after the start time.");
    }
};

const maskStudentResult = (attempt, exam) => {
    if (!attempt) return attempt;
    if (exam?.show_result_immediately !== false) return attempt;
    const hidden = { ...attempt };
    ["score", "percentage", "correct_answers", "wrong_answers", "unanswered", "marks_awarded"].forEach((field) => delete hidden[field]);
    return { ...hidden, result_available: false };
};

const getAttemptTotalMarks = async (attemptId, school) => {
    const result = await pool.query(
        `SELECT COALESCE(SUM(q.marks),0)::numeric AS total_marks
         FROM cbt_attempt_questions aq
         JOIN cbt_questions q ON q.id=aq.question_id AND q.school_id=$2
         WHERE aq.attempt_id=$1 AND aq.school_id=$2`,
        [attemptId, school]
    );
    return Number(result.rows[0]?.total_marks || 0);
};

const buildSafeQuestions = (questions) => questions.map((question) => ({
    id: question.id,
    question_text: question.question_text,
    image_url: question.image_url,
    marks: question.marks,
    question_order: question.attempt_question_order || question.question_order,
    options: (question.options || []).map((option) => ({
        id: option.id,
        option_text: option.option_text,
        option_image_url: option.option_image_url,
        option_order: option.option_order,
    })),
}));

const getExams = async (req, res) => {
    try {
        return res.json({ success: true, data: await cbtModel.getExams(schoolId(req), req.query) });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAvailableStudentExams = async (req, res) => {
    try {
        return res.json({ success: true, data: await cbtModel.getAvailableStudentExams(studentId(req), schoolId(req)) });
    } catch (error) {
        return sendError(res, error);
    }
};

const getStudentExam = async (req, res) => {
    try {
        const student = studentId(req);
        const school = schoolId(req);
        const examId = Number(req.params.id);
        const attemptId = Number(req.query.attemptId);

        let attempt = null;
        if (Number.isInteger(attemptId) && attemptId > 0) {
            attempt = await cbtModel.getAttemptForStudent(attemptId, student, school);
            if (!attempt) {
                return res.status(404).json({ success: false, message: "Examination attempt not found." });
            }
            if (Number(attempt.exam_id) !== examId) {
                return res.status(400).json({ success: false, message: "The examination attempt does not match this examination." });
            }
        }

        const exam = attempt
            ? await cbtModel.getExamById(examId, school)
            : (await cbtModel.getAvailableStudentExams(student, school)).find((item) => Number(item.id) === examId);

        if (!exam) {
            return res.status(404).json({ success: false, message: "This examination is not available to you." });
        }

        if (attempt) {
            if (attempt.status !== "in_progress") {
                return res.status(409).json({ success: false, message: "This examination attempt has already been completed." });
            }
            if (attempt.expires_at && new Date(attempt.expires_at) <= new Date()) {
                await cbtModel.submitAttempt(attempt.id, student, school);
                return res.status(409).json({ success: false, message: "Your examination time has expired." });
            }
            if (exam.ends_at && new Date(exam.ends_at) <= new Date()) {
                await cbtModel.submitAttempt(attempt.id, student, school);
                return res.status(409).json({ success: false, message: "This examination has ended." });
            }
        }

        let questions = attempt
            ? await cbtModel.getAttemptQuestions(attempt.id, school, Boolean(exam.randomize_options))
            : await cbtModel.getQuestions(exam.id, school);

        // Repair older/incomplete in-progress attempts that were created before
        // attempt-question selection was enabled.
        if (attempt && attempt.status === "in_progress" && questions.length === 0) {
            await cbtModel.startAttempt(exam.id, student, school);
            questions = await cbtModel.getAttemptQuestions(attempt.id, school, Boolean(exam.randomize_options));
        }

        if (attempt && questions.length === 0) {
            return res.status(409).json({
                success: false,
                message: "This examination attempt has no questions assigned to it. Please start the examination again.",
            });
        }

        return res.json({
            success: true,
            data: {
                ...exam,
                questions: buildSafeQuestions(questions),
            },
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getExam = async (req, res) => {
    try {
        const exam = await cbtModel.getExamById(Number(req.params.id), schoolId(req));
        if (!exam) return res.status(404).json({ success: false, message: "Examination not found." });
        return res.json({ success: true, data: { ...exam, questions: await cbtModel.getQuestions(exam.id, schoolId(req)) } });
    } catch (error) {
        return sendError(res, error);
    }
};

const createExam = async (req, res) => {
    try {
        validateExam(req.body);
        return res.status(201).json({ success: true, data: await cbtModel.createExam(req.body, schoolId(req), userId(req)) });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateExam = async (req, res) => {
    try {
        validateExam(req.body);
        const exam = await cbtModel.updateExam(Number(req.params.id), req.body, schoolId(req));
        if (!exam) return res.status(404).json({ success: false, message: "Examination not found." });
        return res.json({ success: true, data: exam });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteExam = async (req, res) => {
    try {
        const deleted = await cbtModel.deleteExam(Number(req.params.id), schoolId(req));
        if (!deleted) return res.status(404).json({ success: false, message: "Examination not found." });
        return res.json({ success: true, message: "Examination deleted." });
    } catch (error) {
        return sendError(res, error);
    }
};

const createQuestion = async (req, res) => {
    try {
        validateQuestionOptions(req.body.options);
        return res.status(201).json({ success: true, data: await cbtModel.createQuestion({ ...req.body, exam_id: Number(req.params.examId) }, schoolId(req)) });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateQuestion = async (req, res) => {
    try {
        if (Array.isArray(req.body.options)) validateQuestionOptions(req.body.options);
        const question = await cbtModel.updateQuestion(Number(req.params.id), req.body, schoolId(req));
        if (!question) return res.status(404).json({ success: false, message: "Question not found." });
        return res.json({ success: true, data: question });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const deleted = await cbtModel.deleteQuestion(Number(req.params.id), schoolId(req));
        if (!deleted) return res.status(404).json({ success: false, message: "Question not found." });
        return res.json({ success: true, message: "Question deleted." });
    } catch (error) {
        return sendError(res, error);
    }
};

const startAttempt = async (req, res) => {
    try {
        const examId = Number(req.params.examId);
        const school = schoolId(req);
        const student = studentId(req);

        const questions = await cbtModel.getQuestions(examId, school);
        if (!questions.length) {
            return res.status(409).json({ success: false, message: "This examination has no questions yet." });
        }

        const attempt = await cbtModel.startAttempt(examId, student, school);
        const exam = await cbtModel.getExamById(examId, school);
        if (!exam) return res.status(404).json({ success: false, message: "Examination not found." });

        if (exam.ends_at) {
            await pool.query(
                `UPDATE cbt_attempts
                 SET expires_at=LEAST(expires_at,$1::timestamp),updated_at=CURRENT_TIMESTAMP
                 WHERE id=$2 AND student_id=$3 AND school_id=$4 AND status='in_progress'`,
                [exam.ends_at, attempt.id, student, school]
            );
        }

        const refreshed = await cbtModel.getAttemptForStudent(attempt.id, student, school);
        const attemptQuestions = await cbtModel.getAttemptQuestions(
            attempt.id,
            school,
            Boolean(exam.randomize_options)
        );

        if (!attemptQuestions.length) {
            return res.status(409).json({
                success: false,
                message: "The examination started, but no questions were assigned to this attempt. Please try again.",
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                ...refreshed,
                exam: {
                    ...exam,
                    questions: buildSafeQuestions(attemptQuestions),
                },
            },
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const saveAnswer = async (req, res) => {
    try {
        const student = studentId(req);
        const school = schoolId(req);
        const attempts = await cbtModel.getStudentAttempts(student, school);
        const attempt = attempts.find((item) => Number(item.id) === Number(req.params.attemptId));
        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found." });
        if (attempt.status !== "in_progress") return res.status(409).json({ success: false, message: "This examination attempt is no longer active." });

        const exam = await cbtModel.getExamById(Number(attempt.exam_id), school);
        if (exam?.ends_at && new Date(exam.ends_at) <= new Date()) {
            await cbtModel.submitAttempt(attempt.id, student, school);
            return res.status(409).json({ success: false, message: "This examination has ended." });
        }
        if (attempt.expires_at && new Date(attempt.expires_at) <= new Date()) {
            await cbtModel.submitAttempt(attempt.id, student, school);
            return res.status(409).json({ success: false, message: "Your examination time has expired." });
        }

        const saved = await cbtModel.saveAnswer(
            Number(req.params.attemptId),
            Number(req.body.question_id),
            req.body.selected_option_id ? Number(req.body.selected_option_id) : null,
            school
        );
        if (!saved) return res.status(400).json({ success: false, message: "Unable to save this answer." });
        return res.json({ success: true, data: saved });
    } catch (error) {
        return sendError(res, error);
    }
};

const submitAttempt = async (req, res) => {
    try {
        const student = studentId(req);
        const school = schoolId(req);
        const id = Number(req.params.attemptId);
        const existing = await cbtModel.getAttemptForStudent(id, student, school);
        if (!existing) return res.status(404).json({ success: false, message: "Attempt not found." });

        const exam = await cbtModel.getExamById(Number(existing.exam_id), school);
        const attempt = await cbtModel.submitAttempt(id, student, school);
        const attemptTotalMarks = await getAttemptTotalMarks(id, school);
        const data = maskStudentResult({ ...attempt, total_marks: attemptTotalMarks }, exam);

        return res.json({
            success: true,
            result_available: exam?.show_result_immediately !== false,
            data,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getMyAttempts = async (req, res) => {
    try {
        const student = studentId(req);
        const school = schoolId(req);
        const attempts = await cbtModel.getStudentAttempts(student, school);
        const data = await Promise.all(attempts.map(async (attempt) => {
            const exam = await cbtModel.getExamById(Number(attempt.exam_id), school);
            const attemptTotalMarks = await getAttemptTotalMarks(attempt.id, school);
            return maskStudentResult({ ...attempt, total_marks: attemptTotalMarks }, exam);
        }));
        return res.json({ success: true, data });
    } catch (error) {
        return sendError(res, error);
    }
};

module.exports = {
    getExams,
    getAvailableStudentExams,
    getStudentExam,
    getExam,
    createExam,
    updateExam,
    deleteExam,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    startAttempt,
    saveAnswer,
    submitAttempt,
    getMyAttempts,
};
