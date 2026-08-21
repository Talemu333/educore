import api from "./axios";


/*
=========================================
GET PROMOTION SETUP
=========================================

Returns:

{
    currentSession,
    nextSession,
    classes
}
=========================================
*/

export const getPromotionSetup = async () => {

    const response =
        await api.get(
            "/promotions/setup"
        );

    return response.data.data;

};


/*
=========================================
GET STUDENTS FOR PROMOTION
=========================================

classId = current class

armId = optional current arm
=========================================
*/

export const getStudentsForPromotion = async ({
    classId,
    armId
}) => {

    const params = {
        classId
    };


    if (armId) {

        params.armId = armId;

    }


    const response =
        await api.get(
            "/promotions/students",
            {
                params
            }
        );


    return response.data.data;

};


/*
=========================================
GET ARMS FOR CLASS
=========================================
*/

export const getArmsByClass = async (
    classId
) => {

    const response =
        await api.get(
            `/promotions/classes/${classId}/arms`
        );


    return response.data.data;

};


/*
=========================================
PROMOTE STUDENTS
=========================================
*/

export const promoteStudents = async ({
    students,
    destinationClassId,
    defaultArmId
}) => {

    const response =
        await api.post(
            "/promotions/promote",
            {
                students,
                destinationClassId,
                defaultArmId
            }
        );


    return response.data;

};


/*
=========================================
GET PROMOTION HISTORY
=========================================

Supports:

?page=1&limit=20
?action=Promoted
?action=Repeated
?action=Graduated
?search=John

Returns:

{
    history,
    pagination
}
=========================================
*/

export const getPromotionHistory = async ({
    page = 1,
    limit = 20,
    action = "",
    search = ""
} = {}) => {

    const params = {
        page,
        limit
    };


    if (action) {

        params.action = action;

    }


    if (search) {

        params.search = search;

    }


    const response =
        await api.get(

            "/promotion-history",

            {
                params
            }

        );


    return response.data.data;

};