import api from "../api/axios";

export const getMyStudentProfile = async () => {
    const response = await api.get("/students/me");
    return response.data.data;
};

export const getMySubjects = async () => {
    const response = await api.get("/subjects/my");
    return response.data.data;
};

export const getMyResultReport = async (sessionId, termId) => {
    const response = await api.get(
        `/results/my/session/${sessionId}/term/${termId}/report`
    );
    return response.data.data;
};
