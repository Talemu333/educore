const promotionModel = require("../models/promotionModel");
const promotionSchoolModel = require("../models/promotionSchoolModel");

const requireSchool = (schoolId) => {
    if (!schoolId) throw new Error("School context is required.");
};

const getPromotionSetup = async (schoolId) => {
    requireSchool(schoolId);
    const currentSession = await promotionSchoolModel.getCurrentSession(schoolId);
    if (!currentSession) throw new Error("No current academic session has been set for this school.");
    const nextSession = await promotionSchoolModel.getNextSession(currentSession.id, schoolId);
    const classes = await promotionSchoolModel.getClasses(schoolId);
    return { currentSession, nextSession, classes };
};

const getStudentsForPromotion = async ({ classId, armId, schoolId }) => {
    requireSchool(schoolId);
    const currentSession = await promotionSchoolModel.getCurrentSession(schoolId);
    if (!currentSession) throw new Error("No current academic session has been set for this school.");
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
        throw new Error("At least one student must be selected.");
    }

    const currentSession = await promotionSchoolModel.getCurrentSession(schoolId);
    if (!currentSession) throw new Error("No current academic session has been set for this school.");

    const nextSession = await promotionSchoolModel.getNextSession(currentSession.id, schoolId);
    const hasNonGraduatingStudents = students.some(student => student.action !== "Graduated");
    if (hasNonGraduatingStudents && !nextSession) {
        throw new Error("There is no next academic session available for promotion or repetition.");
    }

    await promotionSchoolModel.validatePromotionInput({
        students,
        currentSessionId: currentSession.id,
        nextSessionId: nextSession?.id || null,
        destinationClassId,
        defaultArmId,
        schoolId
    });

    // The legacy processor performs the transaction. All IDs have been
    // validated against the authenticated school's scope before it runs.
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
