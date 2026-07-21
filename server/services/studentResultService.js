const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const gradingHelper = require("../helpers/gradingHelper");
const studentModel = require("../models/studentModel");
const teacherAssignmentModel = require("../models/teacherAssignmentModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const studentResultModel = require("../models/studentResultModel");

const prepareResultData = (rawData) => {
    const totalScore =
        Number(rawData.ca_score) +
        Number(rawData.exam_score);

    const grading =
        gradingHelper.getGrade(totalScore);

    return {
        ...rawData,
        total_score: totalScore,
        grade: grading.grade,
        remark: grading.remark
    };
};

const createResult = async (data) => {

    // Validate student
    const student =
    await studentModel.getStudentById(data.student_id);

    if (!student) {

        throw new ApiError(
            404,
            "Student not found."
        );

    }
    // Validate assignment
    const assignment =
    await teacherAssignmentModel.getAssignmentDetails(
        data.teacher_assignment_id
    );

    if (!assignment) {

        throw new ApiError(
            404,
            "Teacher assignment not found."
        );

    }
        // Validate session
    const session =
    await sessionModel.getSessionById(data.session_id);

    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }
    // Validate term
    const term =
    await termModel.getTermById(data.term_id);

    if (!term) {

        throw new ApiError(
            404,
            "Term not found."
        );

    }
    // Validate session-term relationship
    if (term.session_id !== data.session_id) {

    throw new ApiError(

        400,

        "The selected term does not belong to the selected academic session."

    );

    }

    const totalScore =
        Number(data.ca_score) +
        Number(data.exam_score);

    const grading =
        gradingHelper.getGrade(totalScore);

    const resultData = {

        ...data,

        total_score: totalScore,

        grade: grading.grade,

        remark: grading.remark

    };

    const createdResult = await studentResultModel.createResult(resultData);
    return await studentResultModel.getResultById(createdResult.id);

};

const createBulkResults = async (data) => {

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Validate assignment
        const assignment =
        await teacherAssignmentModel.getAssignmentDetails(
            data.teacher_assignment_id
        );

        if (!assignment) {

            throw new ApiError(
                404,
                "Teacher assignment not found."
            );

        }
            // Validate session
        const session =
        await sessionModel.getSessionById(data.session_id);

        if (!session) {

            throw new ApiError(
                404,
                "Academic session not found."
            );

        }
        // Validate term
        const term =
        await termModel.getTermById(data.term_id);

        if (!term) {

            throw new ApiError(
                404,
                "Term not found."
            );

        }
        // Validate session-term relationship
        if (term.session_id !== data.session_id) {

        throw new ApiError(

            400,

            "The selected term does not belong to the selected academic session."

        );

        }

        for (const result of data.results) {

            const student = await studentModel.getStudentById(result.student_id);

            if (!student) {
                throw new ApiError(404, "Student not found.");
            }

            const resultData = prepareResultData({
                ...result,
                teacher_assignment_id: data.teacher_assignment_id,
                session_id: data.session_id,
                term_id: data.term_id
            });

            await studentResultModel.createResult(resultData, client);
            
        }

        await client.query("COMMIT");
            
    } 
    catch (error) {

        await client.query("ROLLBACK");

            throw error;

    }
    finally {client.release();}

};

module.exports = {

    createResult

};

