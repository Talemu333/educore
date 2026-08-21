import api from "./axios";


export const getGradingScales = async () => {

    const response = await api.get(
        "/grading-scales"
    );

    return response.data.data;

};


export const getGradingScaleById = async (id) => {

    const response = await api.get(
        `/grading-scales/${id}`
    );

    return response.data.data;

};


export const createGradingScale = async (data) => {

    const response = await api.post(
        "/grading-scales",
        data
    );

    return response.data.data;

};


export const updateGradingScale = async (
    id,
    data
) => {

    const response = await api.put(
        `/grading-scales/${id}`,
        data
    );

    return response.data.data;

};


export const deleteGradingScale = async (id) => {

    const response = await api.delete(
        `/grading-scales/${id}`
    );

    return response.data;

};