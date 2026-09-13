const promotionModel = require("../models/promotionModel");
const promotionSchoolModel = require("../models/promotionSchoolModel");

const createClientError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const requireSchool = (schoolId) => {
    if (!schoolId) {
        throw createClientError("School context is required.");
    }
};

const getPromotionSetup = async (schoolId) => {
    requireSchool(schoolId);
    const currentSession = await promotionSchoolModel.getCurrentSession(schoolId);
    if (!currentSession) {
        throw createClientError("No current academic session has been set for this school. Please create an academic session and set it as current before using Student Promotion.");
    }
    const nextSession = await promotionSchoolModel.getNextSession(currentSession.id, schoolId);
    const classes = await promotionSchoolModel.getClasses(schoolId);
    return { currentSession, nextSession, classes };
};

const getStudentsForPromotion = async ({ classId, armId, schoolId }) => {
    requireSchool(schoolId);
    const currentSession = await promotionSchoolModel.getCurrentSession(schoolId);
    if (!currentSession) {
        throw createClientError("No current academic session has been set for this school. Please create an academic session and set it as current before using Student Promotion.");
    }
    return promotionSchoolModel.getStudentsForPromotion({
        sessionId: currentSession.id,
        classId,
        armId,
        schoolId
    });
};

const getArmsByClass = async (classId, schoolId) => {
    requireSchool(schoolId);
    return promotionSchoolModel.getArmsByClass(classId, schoolId);
};

const processStudentDecisions = async ({
    students,
    destinationClassId,
    defaultArmId,
    processedBy,
    schoolId
}) => {
    requireSchool(schoolId);
    if (!Array.isArray(students) || students.length === 0) {
        throw createClientError("At least one student must be selected.");
    }

    const currentSession = await promotionSchoolModel.getCurrentSession(schoolId);
    if (!currentSession) {
        throw createClientError("No current academic session has been set for this school. Please create an academic session and set it as current before using Student Promotion.");
    }

    const nextSession = await promotionSchoolModel.getNextSession(currentSession.id, schoolId);
    const hasNonGraduatingStudents = students.some(student => student.action !== "Graduated");
    if (hasNonGraduatingStudents && !nextSession) {
        throw createClientError("There is no next academic session available for promotion or repetition. Please create the next academic session first.");
    }

    await promotionSchoolModel.validatePromotionInput({
        students,
        currentSessionId: currentSession.id,
        nextSessionId: nextSession?.id || null,
        destinationClassId,
        defaultArmId,
        schoolId
    });

    return promotionModel.processStudentDecisions({
        students,
        currentSessionId: currentSession.id,
        nextSessionId: nextSession?.id || null,
        destinationClassId,
        defaultArmId,
        processedBy
    });
};

module.exports = {
    getPromotionSetup,
    getStudentsForPromotion,
    getArmsByClass,
    processStudentDecisions
};
