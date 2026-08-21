import api from "@/api/axios";

export const getStudentsForResultEntry = async (assignmentId) => {

    const response = await api.get(

        `/results/assignment/${assignmentId}/students`

    );

    return response.data.data;

};

export const createBulkResults = async (data) => {

    const response = await api.post(

        "/results/bulk",

        data

    );

    return response.data;

};

export const getStudentResultReport = async (
    studentId,
    sessionId,
    termId
) => {

    const response = await api.get(

        `/results/student/${studentId}/session/${sessionId}/term/${termId}/report`

    );

    return response.data.data;

};

export const getClassResultSheet = async (
    classId,
    armId,
    sessionId,
    termId
) => {

    const response = await api.get(
        "/results/class-sheet",
        {
            params: {
                classId,
                armId,
                sessionId,
                termId
            }
        }
    );

    return response.data.data;

};

export const getDetailedClassResultSheet = async ({
    classId,
    armId,
    sessionId,
    termId
}) => {

    const response = await api.get(
        "/results/broadsheet",
        {
            params: {
                classId,
                armId,
                sessionId,
                termId
            }
        }
    );

    return response.data.data;

};