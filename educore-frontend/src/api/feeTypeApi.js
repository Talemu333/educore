import api from "@/api/axios";


/*
=========================================
GET FEE TYPES
=========================================
*/

export const getFeeTypes = async () => {

    const response =
        await api.get("/fee-types");

    return response.data.data;

};


/*
=========================================
CREATE FEE TYPE
=========================================
*/

export const createFeeType = async (data) => {

    const response =
        await api.post(
            "/fee-types",
            data
        );

    return response.data.data;

};


/*
=========================================
UPDATE FEE TYPE
=========================================
*/

export const updateFeeType = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/fee-types/${id}`,
            data
        );

    return response.data.data;

};


/*
=========================================
DELETE FEE TYPE
=========================================
*/

export const deleteFeeType = async (id) => {

    const response =
        await api.delete(
            `/fee-types/${id}`
        );

    return response.data;

};