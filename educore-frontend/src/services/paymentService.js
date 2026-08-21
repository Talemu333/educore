import api from "../api/axios";


/*
=========================================
GET STUDENT FINANCIAL SUMMARY
=========================================
*/

export const getStudentFinancialSummary = async (
    studentId,
    sessionId,
    termId
) => {

    const response = await api.get(

        `/payments/summary/${studentId}/${sessionId}/${termId}`

    );

    return response.data.data;

};


/*
=========================================
GET STUDENT PAYMENT HISTORY
=========================================
*/

export const getStudentPayments = async (
    studentId,
    sessionId,
    termId
) => {

    const response = await api.get(

        `/payments/student/${studentId}/${sessionId}/${termId}`

    );

    return response.data.data;

};


/*
=========================================
CREATE PAYMENT
=========================================
*/

export const createPayment = async (
    data
) => {

    const response = await api.post(

        "/payments",

        data

    );

    return response.data.data;

};


/*
=========================================
GET RECEIPT
=========================================
*/

export const getReceipt = async (
    receiptNumber
) => {

    const response = await api.get(

        `/payments/receipt/${receiptNumber}`

    );

    return response.data.data;

};


/*
=========================================
VERIFY RECEIPT
=========================================
*/

export const verifyReceipt = async (
    receiptNumber
) => {

    const response = await api.get(

        `/payments/receipt/verify/${receiptNumber}`

    );

    return response.data;

};

/*
=========================================
GET PAYMENT REPORT
=========================================
*/

export const getPaymentReport = async ({
    dateFrom = "",
    dateTo = "",
    sessionId = "",
    termId = "",
    paymentMethod = "",
    studentId = ""
}) => {

    const response = await api.get(
        "/payments/reports",
        {
            params: {
                date_from: dateFrom,
                date_to: dateTo,
                session_id: sessionId,
                term_id: termId,
                payment_method: paymentMethod,
                student_id: studentId
            }
        }
    );

    return response.data.data;

};