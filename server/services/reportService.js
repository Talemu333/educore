const reportModel = require("../models/reportModel");
const ApiError = require("../utils/ApiError");
const gradingHelper = require("../helpers/gradingHelper");
const attendanceModel = require("../models/attendanceModel");
const positionHelper = require("../helpers/positionHelper");
const schoolSettingService = require("./schoolSettingService");

const getStudentReport = async (

    studentId,

    sessionId,

    termId

) => {

    const [

        report,

        attendanceSummary,

        school

    ] = await Promise.all([

        reportModel.getStudentReport(

            studentId,

            sessionId,

            termId

        ),

        attendanceModel.getAttendanceSummary(

            studentId,

            sessionId,

            termId

        ),

        schoolSettingService.getSchoolSettings()

    ]);

    if (!report.length) {

        throw new ApiError(

            404,

            "No report found."

        );

    }

    const position =
    await reportModel.getStudentPosition(

        studentId,

        report[0].class_id,

        report[0].arm_id,

        sessionId,

        termId

    );

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

        metadata: {

            generated_at: new Date(),

            generated_by: "EDUCORE",

            report_type: "Student Result Report"

        },

        school,

        student,

            summary: {

            total_subjects: totalSubjects,

            total_score: totalScore,

            average_score: averageScore,

            overall_grade: overallPerformance.grade,

            overall_remark: overallPerformance.remark,

            position: position ? positionHelper.getOrdinal(position.position) : null,

            class_size: position?.class_size || 0

        },

        results

    };

};

const getStudentTranscript = async (studentId) => {

    const transcript =
        await reportModel.getStudentTranscript(studentId);

    if (!transcript.length) {

        throw new ApiError(

            404,

            "No transcript found."

        );

    };

    const school = await schoolSettingService.getSchoolSettings();

    const student = {

        admission_number:
            transcript[0].admission_number,

        student_name:
            transcript[0].student_name

    };

    // Create the empty object HERE
    const sessions = {};

    // Then loop through the transcript
    transcript.forEach(row => {

        if (!sessions[row.session_name]) {

            sessions[row.session_name] = {};

        }

        if (!sessions[row.session_name][row.term_name]) {

            sessions[row.session_name][row.term_name] = [];

        }

        sessions[row.session_name][row.term_name].push({

            subject_name: row.subject_name,

            ca_score: row.ca_score,

            exam_score: row.exam_score,

            total_score: row.total_score,

            grade: row.grade,

            remark: row.remark

        });

    });

    const formattedTranscript = Object.entries(sessions).map(

        ([sessionName, terms]) => {

            const formattedTerms = Object.entries(terms).map(

                ([termName, subjects]) => {

                    const totalScore = subjects.reduce(

                        (sum, subject) =>

                            sum + Number(subject.total_score),

                        0

                    );

                    const averageScore = Number(

                        (totalScore / subjects.length)

                        .toFixed(2)

                    );

                    const overallPerformance =

                        gradingHelper.getGrade(

                            averageScore

                        );

                    return {

                        term_name: termName,

                        average_score: averageScore,

                        overall_grade: overallPerformance.grade,

                        overall_remark: overallPerformance.remark,

                        subjects

                    };

                }

            );

            const sessionAverage = Number(

                (

                    formattedTerms.reduce(

                        (sum, term) =>

                            sum + term.average_score,

                        0

                    )

                    /

                    formattedTerms.length

                ).toFixed(2)

            );

            const sessionPerformance =

                gradingHelper.getGrade(

                    sessionAverage

                );

            return {

                session_name: sessionName,

                session_average: sessionAverage,

                overall_grade: sessionPerformance.grade,

                overall_remark: sessionPerformance.remark,

                terms: formattedTerms

            };

        }

    );

    return {

        metadata: {

            generated_at: new Date(),

            report_type: "Student Transcript"

        },

        school,

        student,

        transcript: formattedTranscript

    };

};


module.exports = {
    getStudentReport,
    getStudentTranscript
}