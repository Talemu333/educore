import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";

import {
    getStudentFinancialSummary,
    getStudentPayments,
    createPayment,
    getReceipt,
    verifyReceipt,
    getPaymentReport
} from "@/services/paymentService";

/*
=========================================
STUDENT FINANCIAL SUMMARY
=========================================
*/

export const useStudentFinancialSummary = (
    studentId,
    sessionId,
    termId
) => {

    return useQuery({

        queryKey: [
            "student-financial-summary",
            studentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getStudentFinancialSummary(
                studentId,
                sessionId,
                termId
            ),

        enabled:
            !!studentId &&
            !!sessionId &&
            !!termId

    });

};


/*
=========================================
STUDENT PAYMENT HISTORY
=========================================
*/

export const useStudentPayments = (
    studentId,
    sessionId,
    termId
) => {

    return useQuery({

        queryKey: [
            "student-payments",
            studentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getStudentPayments(
                studentId,
                sessionId,
                termId
            ),

        enabled:
            !!studentId &&
            !!sessionId &&
            !!termId

    });

};


/*
=========================================
CREATE PAYMENT
=========================================
*/

export const useCreatePayment = () => {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            createPayment,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "student-financial-summary"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "student-payments"
                ]

            });

        }

    });

};


/*
=========================================
GET RECEIPT
=========================================
*/

export const useReceipt = (
    receiptNumber
) => {

    return useQuery({

        queryKey: [
            "payment-receipt",
            receiptNumber
        ],

        queryFn: () =>
            getReceipt(
                receiptNumber
            ),

        enabled:
            !!receiptNumber

    });

};


/*
=========================================
VERIFY RECEIPT
=========================================
*/

export const useVerifyReceipt = (
    receiptNumber
) => {

    return useQuery({

        queryKey: [
            "verify-payment-receipt",
            receiptNumber
        ],

        queryFn: () =>
            verifyReceipt(
                receiptNumber
            ),

        enabled:
            !!receiptNumber

    });

};

/*
=========================================
PAYMENT REPORT
=========================================
*/

export const usePaymentReport = ({
    dateFrom = "",
    dateTo = "",
    sessionId = "",
    termId = "",
    paymentMethod = "",
    studentId = ""
}) => {

    return useQuery({

        queryKey: [
            "payment-report",
            dateFrom,
            dateTo,
            sessionId,
            termId,
            paymentMethod,
            studentId
        ],

        queryFn: () =>
            getPaymentReport({
                dateFrom,
                dateTo,
                sessionId,
                termId,
                paymentMethod,
                studentId
            })

    });

};