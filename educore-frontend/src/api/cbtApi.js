import api from "./axios";

export const getAvailableCbtExams = async () => {
    const response = await api.get("/cbt/exams/available");
    return response.data?.data || [];
};

export const getStudentCbtExam = async (examId) => {
    const response = await api.get(`/cbt/exams/available/${examId}`);
    return response.data?.data;
};

export const getMyCbtAttempts = async () => {
    const response = await api.get("/cbt/my-attempts");
    return response.data?.data || [];
};

export const startCbtAttempt = async (examId) => {
    const response = await api.post(`/cbt/exams/${examId}/start`);
    return response.data?.data;
};

export const saveCbtAnswer = async (attemptId, questionId, selectedOptionId) => {
    const response = await api.post(`/cbt/attempts/${attemptId}/answers`, {
        question_id: questionId,
        selected_option_id: selectedOptionId,
    });
    return response.data?.data;
};

export const submitCbtAttempt = async (attemptId) => {
    const response = await api.post(`/cbt/attempts/${attemptId}/submit`);
    return response.data?.data;
};
