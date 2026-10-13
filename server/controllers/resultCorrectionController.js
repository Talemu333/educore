const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler");
const schoolSettingModel = require("../models/schoolSettingModel");
const gradingSystemModel = require("../models/gradingSystemModel");
const studentResultModel = require("../models/studentResultModel");

const schoolIdOf = req => Number(req.user?.school_id);
const userIdOf = req => Number(req.user?.id);
const isManager = req => ["admin", "administrator"].includes(String(req.user?.role_name || "").trim().toLowerCase())
    && ["proprietor", "principal"].includes(String(req.user?.admin_type || "").trim().toLowerCase());

const createCorrectionRequests = asyncHandler(async (req, res) => {
    const schoolId = schoolIdOf(req);
    const requestedBy = userIdOf(req);
    const { teacher_assignment_id, session_id, term_id, reason, results } = req.body || {};
    const assignmentId = Number(teacher_assignment_id);
    const sessionId = Number(session_id);
    const termId = Number(term_id);
    const explanation = String(reason || "").trim();

    if (![schoolId, requestedBy, assignmentId, sessionId, termId].every(n => Number.isInteger(n) && n > 0)) {
        throw new ApiError(400, "A valid school, assignment, session and term are required.");
    }
    if (explanation.length < 8) throw new ApiError(400, "Please provide a reason of at least 8 characters.");
    if (!Array.isArray(results) || !results.length) throw new ApiError(400, "Select at least one result to correct.");

    const settings = await schoolSettingModel.getSchoolSettings(schoolId);
    if (!settings) throw new ApiError(404, "School settings not found.");

    const client = await pool.connect();
    const created = [];
    try {
        await client.query("BEGIN");
        const assignment = await client.query(
            `SELECT ta.id, ta.class_id, ta.arm_id, ta.session_id, ta.term_id
             FROM teacher_assignments ta
             JOIN teachers t ON t.id=ta.teacher_id
             JOIN users u ON u.id=t.user_id
             WHERE ta.id=$1 AND u.school_id=$2 AND ta.session_id=$3 AND ta.term_id=$4
             LIMIT 1`,
            [assignmentId, schoolId, sessionId, termId]
        );
        if (!assignment.rows[0]) throw new ApiError(404, "Teacher assignment not found for this school and academic period.");\n        if (String(req.user?.role_name || "").trim().toLowerCase() === "teacher" && Number(assignment.rows[0].assigned_user_id) !== requestedBy) {\n            throw new ApiError(403, "You can request corrections only for your own assigned subject.");\n        }

        for (const item of results) {
            const studentId = Number(item.student_id);
            const ca = Number(item.ca_score);
            const exam = Number(item.exam_score);
            if (!Number.isInteger(studentId) || studentId < 1 || !Number.isFinite(ca) || !Number.isFinite(exam)
                || ca < 0 || ca > Number(settings.ca_max_score) || exam < 0 || exam > Number(settings.exam_max_score)) {
                throw new ApiError(400, "Each proposed CA and exam score must be valid and within the school's score limits.");
            }

            const current = await client.query(
                `SELECT sr.id, sr.ca_score, sr.exam_score
                 FROM student_results sr
                 JOIN students s ON s.id=sr.student_id AND s.school_id=$5
                 JOIN teacher_assignments ta ON ta.id=sr.teacher_assignment_id
                 WHERE sr.student_id=$1 AND sr.teacher_assignment_id=$2
                   AND sr.session_id=$3 AND sr.term_id=$4
                 FOR UPDATE`,
                [studentId, assignmentId, sessionId, termId, schoolId]
            );
            const old = current.rows[0];
            if (!old) throw new ApiError(404, `No existing result was found for student ${studentId}. Save first-time marks before requesting a correction.`);
            if (Number(old.ca_score) === ca && Number(old.exam_score) === exam) continue;

            const inserted = await client.query(
                `INSERT INTO result_correction_requests
                    (school_id, student_result_id, student_id, teacher_assignment_id, session_id, term_id,
                     requested_by, old_ca_score, old_exam_score, proposed_ca_score, proposed_exam_score, reason)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                 RETURNING id, student_id, status, created_at`,
                [schoolId, old.id, studentId, assignmentId, sessionId, termId, requestedBy,
                    old.ca_score, old.exam_score, ca, exam, explanation]
            );
            created.push(inserted.rows[0]);
        }

        if (!created.length) throw new ApiError(400, "No changed scores were found to submit for approval.");
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        if (error.code === "23505") throw new ApiError(409, "A correction request is already pending for one of these results.");
        throw error;
    } finally {
        client.release();
    }

    return res.status(201).json({
        success: true,
        message: `${created.length} correction request(s) submitted. Existing marks remain unchanged until approved.`,
        data: created
    });
});

const listCorrectionRequests = asyncHandler(async (req, res) => {
    const status = String(req.query.status || "pending").trim().toLowerCase();
    if (!["pending", "approved", "rejected", "all"].includes(status)) throw new ApiError(400, "Invalid correction status.");
    const values = [schoolIdOf(req)];
    const filter = status === "all" ? "" : "AND r.status=$2";
    if (filter) values.push(status);
    const result = await pool.query(
        `SELECT r.*, CONCAT(s.surname, ' ', s.first_name, CASE WHEN s.middle_name IS NOT NULL AND s.middle_name<>'' THEN ' '||s.middle_name ELSE '' END) AS student_name,
                s.admission_number, sub.subject_name, c.class_name, a.arm_name,
                requester.username AS requester_username, reviewer.username AS reviewer_username
         FROM result_correction_requests r
         JOIN students s ON s.id=r.student_id AND s.school_id=r.school_id
         JOIN teacher_assignments ta ON ta.id=r.teacher_assignment_id
         JOIN subjects sub ON sub.id=ta.subject_id AND sub.school_id=r.school_id
         JOIN classes c ON c.id=ta.class_id AND c.school_id=r.school_id
         LEFT JOIN arms a ON a.id=ta.arm_id AND a.school_id=r.school_id
         LEFT JOIN users requester ON requester.id=r.requested_by AND requester.school_id=r.school_id
         LEFT JOIN users reviewer ON reviewer.id=r.reviewed_by AND reviewer.school_id=r.school_id
         WHERE r.school_id=$1 ${filter}
         ORDER BY CASE WHEN r.status='pending' THEN 0 ELSE 1 END, r.created_at DESC, r.id DESC
         LIMIT 500`,
        values
    );
    res.json({ success: true, data: result.rows });
});

const reviewCorrectionRequest = asyncHandler(async (req, res) => {
    if (!isManager(req)) throw new ApiError(403, "Only the proprietor or principal can review result corrections.");
    const schoolId = schoolIdOf(req);
    const reviewerId = userIdOf(req);
    const requestId = Number(req.params.id);
    const decision = String(req.body?.decision || "").trim().toLowerCase();
    const reviewNote = String(req.body?.review_note || "").trim();
    if (!Number.isInteger(requestId) || requestId < 1) throw new ApiError(400, "Invalid correction request.");
    if (!["approved", "rejected"].includes(decision)) throw new ApiError(400, "Choose approve or reject.");
    if (decision === "rejected" && reviewNote.length < 3) throw new ApiError(400, "Please provide a reason for rejecting the correction.");

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(
            `SELECT * FROM result_correction_requests WHERE id=$1 AND school_id=$2 FOR UPDATE`,
            [requestId, schoolId]
        );
        const request = result.rows[0];
        if (!request) throw new ApiError(404, "Correction request not found.");
        if (request.status !== "pending") throw new ApiError(409, "This correction request has already been reviewed.");\n        if (Number(request.requested_by) === reviewerId) throw new ApiError(403, "A correction request must be reviewed by a different proprietor or principal.");

        if (decision === "approved") {
            const current = await client.query(
                `SELECT sr.id, sr.ca_score, sr.exam_score, ta.class_id, ta.arm_id
                 FROM student_results sr
                 JOIN students s ON s.id=sr.student_id AND s.school_id=$2
                 JOIN teacher_assignments ta ON ta.id=sr.teacher_assignment_id
                 WHERE sr.id=$1 AND sr.student_id=$3 AND sr.teacher_assignment_id=$4
                   AND sr.session_id=$5 AND sr.term_id=$6
                 FOR UPDATE`,
                [request.student_result_id, schoolId, request.student_id, request.teacher_assignment_id, request.session_id, request.term_id]
            );
            const live = current.rows[0];
            if (!live) throw new ApiError(409, "The original result no longer exists. The request cannot be applied.");
            if (Number(live.ca_score) !== Number(request.old_ca_score) || Number(live.exam_score) !== Number(request.old_exam_score)) {
                throw new ApiError(409, "The result changed after this request was submitted. Refresh the entry and submit a new request.");
            }

            const settings = await schoolSettingModel.getSchoolSettings(schoolId);
            if (!settings) throw new ApiError(404, "School settings not found.");
            const ca = Number(request.proposed_ca_score);
            const exam = Number(request.proposed_exam_score);
            if (ca < 0 || ca > Number(settings.ca_max_score) || exam < 0 || exam > Number(settings.exam_max_score)) {
                throw new ApiError(400, "The proposed scores no longer fit the school's score limits.");
            }
            const total = ca + exam;
            const scales = await gradingSystemModel.getAllGradingScales(schoolId);
            const grade = scales.find(scale => total >= Number(scale.min_score) && total <= Number(scale.max_score));
            if (!grade) throw new ApiError(400, `No grading scale found for approved total ${total}.`);

            await studentResultModel.updateResult(request.student_result_id, {
                ca_score: ca, exam_score: exam, total_score: total, grade: grade.grade, remark: grade.remark
            }, schoolId, client);
            await studentResultModel.updatePositions(request.teacher_assignment_id, request.session_id, request.term_id, schoolId, client);

            // An approved correction invalidates the published report. A manager must
            // explicitly publish the updated class/term result again.
            await client.query(
                `DELETE FROM result_publications
                 WHERE school_id=$1 AND class_id=$2
                   AND (arm_id=$3 OR (arm_id IS NULL AND $3 IS NULL))
                   AND session_id=$4 AND term_id=$5`,
                [schoolId, live.class_id, live.arm_id, request.session_id, request.term_id]
            );
        }

        const updated = await client.query(
            `UPDATE result_correction_requests
             SET status=$3, reviewed_by=$4, reviewed_at=CURRENT_TIMESTAMP,
                 review_note=$5, updated_at=CURRENT_TIMESTAMP
             WHERE id=$1 AND school_id=$2 RETURNING *`,
            [requestId, schoolId, decision, reviewerId, reviewNote || null]
        );
        await client.query("COMMIT");
        res.json({
            success: true,
            message: decision === "approved"
                ? "Correction approved. The updated report is now unpublished and must be published again."
                : "Correction request rejected. The existing result was left unchanged.",
            data: updated.rows[0]
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
});

module.exports = { createCorrectionRequests, listCorrectionRequests, reviewCorrectionRequest };
