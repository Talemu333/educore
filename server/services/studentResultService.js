const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
// const gradingHelper = require("../helpers/gradingHelper");
const studentModel = require("../models/studentModel");
const teacherAssignmentModel = require("../models/teacherAssignmentModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const studentResultModel = require("../models/studentResultModel");
const studentEnrollmentModel = require("../models/studentEnrollmentModel");
const classModel = require("../models/classModel");
const armModel = require("../models/armModel");
const schoolSettingModel = require("../models/schoolSettingModel");
const gradingSytemModel = require("../models/gradingSystemModel");


const validateScores = async (
    caScore,
    examScore
) => {

    const settings =
        await schoolSettingModel.getSchoolSettings();


    if (!settings) {

        throw new ApiError(
            404,
            "School settings not found."
        );

    }


    const caMaxScore =
        Number(settings.ca_max_score);


    const examMaxScore =
        Number(settings.exam_max_score);


    if (
        Number(caScore) < 0 ||
        Number(caScore) > caMaxScore
    ) {

        throw new ApiError(

            400,

            `CA score must be between 0 and ${caMaxScore}.`

        );

    }


    if (
        Number(examScore) < 0 ||
        Number(examScore) > examMaxScore
    ) {

        throw new ApiError(

            400,

            `Exam score must be between 0 and ${examMaxScore}.`

        );

    }


    return settings;

};

const calculateGrade = async (totalScore) => {

    const gradingScales =
        await gradingSytemModel.getAllGradingScales();


    const grading =
        gradingScales.find(

            scale =>

                totalScore >=
                Number(scale.min_score)

                &&

                totalScore <=
                Number(scale.max_score)

        );


    if (!grading) {

        throw new ApiError(

            400,

            `No grading scale found for score ${totalScore}.`

        );

    }


    return {

        grade:
            grading.grade,

        remark:
            grading.remark

    };

};

const prepareResultData = async (
    rawData
) => {

    await validateScores(

        rawData.ca_score,

        rawData.exam_score

    );


    const totalScore =

        Number(rawData.ca_score) +

        Number(rawData.exam_score);


    const grading =
        await calculateGrade(
            totalScore
        );


    return {

        ...rawData,

        total_score:
            totalScore,

        grade:
            grading.grade,

        remark:
            grading.remark

    };

};

const createResult = async (data) => {

    const student =
        await studentModel.getStudentById(
            data.student_id
        );

    if (!student) {

        throw new ApiError(
            404,
            "Student not found."
        );

    }


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


    const session =
        await sessionModel.getSessionById(
            data.session_id
        );

    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }


    const term =
        await termModel.getTermById(
            data.term_id
        );

    if (!term) {

        throw new ApiError(
            404,
            "Term not found."
        );

    }


    if (
        Number(term.session_id) !==
        Number(data.session_id)
    ) {

        throw new ApiError(

            400,

            "The selected term does not belong to the selected academic session."

        );

    }


    const resultData =
        await prepareResultData(data);


    const createdResult =
        await studentResultModel.createResult(
            resultData
        );


    return await studentResultModel.getResultById(
        createdResult.id
    );

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

        const enrolledStudents =
            await studentEnrollmentModel.getStudentsForAssignment(
                assignment.id
            );

        const enrolledStudentMap = new Map(

            enrolledStudents.map(student => [

                student.id,

                student

            ])

        );

        for (const result of data.results) {

            if (!enrolledStudentMap.has(result.student_id)) {

                throw new ApiError(

                    400,

                    `Student ${result.student_id} is not enrolled in this class.`

                );

            }

            const resultData = await prepareResultData({

                ...result,

                teacher_assignment_id: assignment.id,

                session_id: data.session_id,

                term_id: data.term_id

            });

            // console.log("Incoming data:", data);

            const existingResult =
                await studentResultModel.getExistingResult(

                    result.student_id,

                    assignment.id,

                    data.session_id,

                    data.term_id,

                    client

                );

            if (existingResult) {

                await studentResultModel.updateResult(

                    existingResult.id,

                    resultData,

                    client

                );

            }
            else {
                // console.log("Result Data:", resultData);
                await studentResultModel.createResult(

                    resultData,

                    client

                );

            }
            
        }

        await studentResultModel.updatePositions(

            assignment.id,

            data.session_id,

            data.term_id,

            client

        );

        await client.query("COMMIT");
            
    } 
    catch (error) {

        await client.query("ROLLBACK");

            throw error;

    }
    finally {client.release();}

};

const getStudentsForAssignment = async (assignmentId) => {

    const assignment =
        await teacherAssignmentModel.getAssignmentDetails(assignmentId);

    if (!assignment) {

        throw new ApiError(

            404,

            "Teacher assignment not found."

        );

    }

    return await studentEnrollmentModel.getStudentsForAssignment(
        assignmentId
    );

};

const getStudentsForResultEntry = async (
    assignmentId
) => {

    const assignment =
        await teacherAssignmentModel.getAssignmentDetails(
            assignmentId
        );

    if (!assignment) {

        throw new ApiError(
            404,
            "Assignment not found."
        );

    }

    return await studentResultModel.getStudentsForResultEntry(assignmentId);

};

const getStudentResultReport = async (
    studentId,
    sessionId,
    termId
) => {

    const student =
        await studentModel.getStudentById(
            studentId
        );

    if (!student) {

        throw new ApiError(
            404,
            "Student not found."
        );

    }

    const session =
        await sessionModel.getSessionById(
            sessionId
        );

    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }

    const term =
        await termModel.getTermById(
            termId
        );

    if (!term) {

        throw new ApiError(
            404,
            "Term not found."
        );

    }

    if (term.session_id !== Number(sessionId)) {

        throw new ApiError(
            400,
            "Selected term does not belong to the selected academic session."
        );

    }

    const results =
        await studentResultModel.getStudentResultReport(
            studentId,
            sessionId,
            termId
        );

    if (!results.length) {

        throw new ApiError(
            404,
            "No results found for this student."
        );

    }

    const totalScore =
        results.reduce(

            (sum, result) =>

                sum +
                Number(result.total_score),

            0

        );

    // const averageScore = totalScore / results.length;
    
    const rankings =
        await studentResultModel.getOverallClassRankings(

            results[0].class_id,

            results[0].arm_id,

            sessionId,

            termId

        );

    const studentRanking =
        rankings.find(

            ranking =>
                Number(ranking.student_id) ===
                Number(studentId)

        );

    const overallPosition =
        studentRanking?.overall_position ?? null;

    const averageScore =
    Number(

        studentRanking?.average_score ??

        totalScore / results.length

    );

    return {

        student: {

            id:
                results[0].student_id,

            name:
                results[0].student_name,

            admission_number:
                results[0].admission_number,

            class_name:
                results[0].class_name,

            arm_name:
                results[0].arm_name

        },

        academic: {

            session_id:
                Number(sessionId),

            session_name:
                results[0].session_name,

            term_id:
                Number(termId),

            term_name:
                results[0].term_name

        },

        summary: {

            number_of_subjects:
                results.length,

            total_score:
                totalScore,

            average_score:
                Number(
                    averageScore.toFixed(2)
                ),

            overall_position:
                overallPosition

        },

        results

    };

};

const getClassResultSheet = async (
    classId,
    armId,
    sessionId,
    termId
) => {

    const schoolClass =
        await classModel.getClassById(
            classId
        );

    if (!schoolClass) {

        throw new ApiError(
            404,
            "Class not found."
        );

    }


    const session =
        await sessionModel.getSessionById(
            sessionId
        );

    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }


    const term =
        await termModel.getTermById(
            termId
        );

    if (!term) {

        throw new ApiError(
            404,
            "Term not found."
        );

    }


    if (
        Number(term.session_id) !==
        Number(sessionId)
    ) {

        throw new ApiError(
            400,
            "Selected term does not belong to the selected academic session."
        );

    }


    const results =
        await studentResultModel.getClassResultSheet(

            classId,
            armId || null,
            sessionId,
            termId

        );


    return {

        class: {

            id: schoolClass.id,

            class_name:
                schoolClass.class_name

        },

        session: {

            id: session.id,

            session_name:
                session.session_name

        },

        term: {

            id: term.id,

            term_name:
                term.term_name

        },

        results

    };

};

const getClassBroadsheet = async (
    classId,
    armId,
    sessionId,
    termId
) => {

    /*
    =====================================
    VALIDATE CLASS
    =====================================
    */

    const classData =
        await classModel.getClassById(
            classId
        );

    if (!classData) {

        throw new ApiError(
            404,
            "Class not found."
        );

    }


    /*
    =====================================
    VALIDATE SESSION
    =====================================
    */

    const session =
        await sessionModel.getSessionById(
            sessionId
        );

    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }


    /*
    =====================================
    VALIDATE TERM
    =====================================
    */

    const term =
        await termModel.getTermById(
            termId
        );

    if (!term) {

        throw new ApiError(
            404,
            "Term not found."
        );

    }


    /*
    =====================================
    VALIDATE SESSION-TERM RELATIONSHIP
    =====================================
    */

    if (
        Number(term.session_id) !==
        Number(sessionId)
    ) {

        throw new ApiError(
            400,
            "Selected term does not belong to the selected academic session."
        );

    }


    /*
    =====================================
    VALIDATE ARM IF PROVIDED
    =====================================
    */

    let arm = null;

    if (armId) {

        arm =
            await armModel.getArmById(
                armId
            );

        if (!arm) {

            throw new ApiError(
                404,
                "Arm not found."
            );

        }

    }


    /*
    =====================================
    GET RAW BROADSHEET RESULTS
    =====================================
    */

    const rawResults =
        await studentResultModel
            .getClassBroadsheet(

                classId,

                armId || null,

                sessionId,

                termId

            );


    if (!rawResults.length) {

        throw new ApiError(
            404,
            "No results found for the selected class."
        );

    }


    /*
    =====================================
    EXTRACT UNIQUE SUBJECTS
    =====================================
    */

    const subjectMap =
        new Map();

    rawResults.forEach(
        result => {

            if (
                !subjectMap.has(
                    result.subject_id
                )
            ) {

                subjectMap.set(
                    result.subject_id,
                    {
                        id:
                            result.subject_id,

                        subject_name:
                            result.subject_name
                    }
                );

            }

        }
    );


    const subjects =
        Array.from(
            subjectMap.values()
        );


    /*
    =====================================
    GROUP RESULTS BY STUDENT
    =====================================
    */

    const studentMap =
        new Map();


    rawResults.forEach(
        result => {

            if (
                !studentMap.has(
                    result.student_id
                )
            ) {

                studentMap.set(
                    result.student_id,
                    {

                        student_id:
                            result.student_id,

                        admission_number:
                            result.admission_number,

                        student_name:
                            result.student_name,

                        scores: {}

                    }
                );

            }


            const student =
                studentMap.get(
                    result.student_id
                );


            student.scores[
                result.subject_id
            ] =
                Number(
                    result.total_score
                );

        }
    );


    /*
    =====================================
    CALCULATE TOTAL AND AVERAGE
    =====================================
    */

    const students =
        Array.from(
            studentMap.values()
        ).map(
            student => {

                let totalScore = 0;

                let subjectCount = 0;


                subjects.forEach(
                    subject => {

                        const score =
                            student.scores[
                                subject.id
                            ];


                        if (
                            score !== undefined &&
                            score !== null
                        ) {

                            totalScore +=
                                Number(score);

                            subjectCount++;

                        }

                    }
                );


                return {

                    ...student,

                    total_score:
                        totalScore,

                    number_of_subjects:
                        subjectCount,

                    average_score:

                        subjectCount > 0

                            ? Number(
                                (
                                    totalScore /
                                    subjectCount
                                ).toFixed(2)
                            )

                            : 0

                };

            }
        );


    /*
    =====================================
    CALCULATE OVERALL POSITION
    =====================================
    */

    students.sort(
        (
            a,
            b
        ) =>
            b.total_score -
            a.total_score
    );


    let currentPosition = 0;

    let previousScore = null;


    students.forEach(
        (
            student,
            index
        ) => {

            if (
                previousScore === null ||

                student.total_score !==
                previousScore
            ) {

                currentPosition =
                    index + 1;

            }


            student.overall_position =
                currentPosition;


            previousScore =
                student.total_score;

        }
    );


    /*
    =====================================
    RETURN FINAL BROADSHEET
    =====================================
    */

    return {

        class: {

            id:
                classData.id,

            class_name:
                classData.class_name

        },

        arm:

            arm

                ? {

                    id:
                        arm.id,

                    arm_name:
                        arm.arm_name

                }

                : null,


        session: {

            id:
                session.id,

            session_name:
                session.session_name

        },


        term: {

            id:
                term.id,

            term_name:
                term.term_name

        },


        subjects,

        students

    };

};

module.exports = {

    createResult,
    createBulkResults,
    getStudentsForAssignment,
    getStudentsForResultEntry,
    getStudentResultReport,
    getClassResultSheet,
    getClassBroadsheet

};

