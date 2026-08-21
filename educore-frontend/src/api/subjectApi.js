import api from "./axios";

export const getSubjects = async () => {

    const response = await api.get("/subjects");

    return response.data.data;

};
export const getSubjectsByClass = async (classId) => {

    const response = await api.get(

        `/subjects/class/${classId}`

    );

    return response.data.data;

};