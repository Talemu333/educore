import api from "./axios";

export const saveClassSubjects = async (data) => {

    const response = await api.post(

        "/class-subjects",

        data

    );

    return response.data.data;

};

export const getClassSubjects = async (classId) => {

    const response = await api.get(

        `/class-subjects/${classId}`

    );

    return response.data.data;

};