const reportModel = require("../models/reportModel");
const ApiError = require("../utils/ApiError");
const gradingHelper = require("../helpers/gradingHelper");

const getStudentReport = async (

    studentId,

    sessionId,

    termId

) => {

    const report =
        await reportModel.getStudentReport(

            studentId,

            sessionId,

            termId

        );

    if (!report.length) {

        throw new ApiError(

            404,

            "No report found."

        );

    }

    const student = {

        admission_number: report[0].admission_number,

        student_name: report[0].student_name,

        class_name: report[0].class_name,

        arm_name: report[0].arm_name,

        session_name: report[0].session_name,

        term_name: report[0].term_name

    };

    const results = report.map(row => ({

        subject_name: row.subject_name,

        ca_score: row.ca_score,

        exam_score: row.exam_score,

        total_score: row.total_score,

        grade: row.grade,

        remark: row.remark

    }));

    const totalSubjects = results.length;

    const totalScore = results.reduce(

        (sum, subject) => sum + Number(subject.total_score),

        0

    );

    const averageScore =
        totalSubjects === 0
            ? 0
            : Number((totalScore / totalSubjects).toFixed(2));
    const overallPerformance = gradingHelper.getGrade(averageScore);

    return {

        student,

        summary: {

            total_subjects: totalSubjects,

            total_score: totalScore,

            average_score: averageScore,

            overall_grade: overallPerformance.grade,

            overall_remark: overallPerformance.remark

        },

        results

    };

};

module.exports = {
    getStudentReport
}