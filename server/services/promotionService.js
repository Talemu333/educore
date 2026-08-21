const promotionModel =
    require("../models/promotionModel");


/*
=========================================
GET PROMOTION SETUP
=========================================
*/

const getPromotionSetup = async () => {

    const currentSession =
        await promotionModel.getCurrentSession();


    if (!currentSession) {

        throw new Error(
            "No current academic session has been set."
        );

    }


    const nextSession =
        await promotionModel.getNextSession(
            currentSession.id
        );


    const classes =
        await promotionModel.getClasses();


    return {

        currentSession,

        nextSession,

        classes

    };

};


/*
=========================================
GET STUDENTS FOR PROMOTION
=========================================
*/

const getStudentsForPromotion = async ({
    classId,
    armId
}) => {

    const currentSession =
        await promotionModel.getCurrentSession();


    if (!currentSession) {

        throw new Error(
            "No current academic session has been set."
        );

    }


    return await promotionModel
        .getStudentsForPromotion({

            sessionId:
                currentSession.id,

            classId,

            armId

        });

};


/*
=========================================
GET ARMS
=========================================
*/

const getArmsByClass = async (
    classId
) => {

    return await promotionModel
        .getArmsByClass(classId);

};


/*
=========================================
PROMOTE STUDENTS
=========================================
*/

const processStudentDecisions = async ({
    students,
    destinationClassId,
    defaultArmId,
    processedBy
}) => {

    if (
        !Array.isArray(students) ||
        students.length === 0
    ) {

        throw new Error(
            "At least one student must be selected."
        );

    }


    const currentSession =
        await promotionModel
            .getCurrentSession();


    if (!currentSession) {

        throw new Error(
            "No current academic session has been set."
        );

    }


    const nextSession =
        await promotionModel
            .getNextSession(
                currentSession.id
            );


    /*
    =========================================
    GRADUATION DOES NOT REQUIRE NEXT SESSION
    =========================================
    */

    const hasNonGraduatingStudents =
        students.some(
            student =>
                student.action !==
                "Graduated"
        );


    if (
        hasNonGraduatingStudents &&
        !nextSession
    ) {

        throw new Error(
            "There is no next academic session available."
        );

    }


    return await promotionModel
        .processStudentDecisions({

            students,

            currentSessionId:
                currentSession.id,

            nextSessionId:
                nextSession?.id || null,

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