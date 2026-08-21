import api from "./axios";


/*
=========================================
GET FEE STRUCTURES
=========================================
*/

export const getFeeStructures = async () => {

    const response = await api.get(
        "/fee-structures"
    );

    return response.data.data;

};


/*
=========================================
CREATE FEE STRUCTURE
=========================================
*/

export const createFeeStructure = async (
    data
) => {

    const response = await api.post(
        "/fee-structures",
        data
    );

    return response.data.data;

};


/*
=========================================
UPDATE FEE STRUCTURE
=========================================
*/

export const updateFeeStructure = async (
    id,
    data
) => {

    const response = await api.put(
        `/fee-structures/${id}`,
        data
    );

    return response.data.data;

};