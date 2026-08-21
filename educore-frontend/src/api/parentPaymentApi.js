import api from "@/api/axios";


/*
==================================================
PARENT PAYMENT SUMMARY
==================================================
*/

export const getParentPaymentSummary = async (
    studentId,
    sessionId,
    termId
) => {

    const response = await api.get(

        `/parents/payments/summary/${studentId}/${sessionId}/${termId}`

    );

    return response.data.data;

};


/*
==================================================
PARENT PAYMENT HISTORY
==================================================
*/

export const getParentPaymentHistory = async (
    studentId,
    sessionId,
    termId
) => {

    const response = await api.get(

        `/parents/payments/history/${studentId}/${sessionId}/${termId}`

    );

    return response.data.data;

};


/*
==================================================
PARENT FEE BREAKDOWN
==================================================
*/

export const getParentFeeBreakdown = async (
    studentId,
    sessionId,
    termId
) => {

    const response = await api.get(

        `/parents/payments/fees/${studentId}/${sessionId}/${termId}`

    );

    return response.data.data;

};