import {
    useQuery
} from "@tanstack/react-query";

import {
    getParentPaymentSummary,
    getParentPaymentHistory,
    getParentFeeBreakdown
} from "@/api/parentPaymentApi";


/*
==================================================
PAYMENT SUMMARY
==================================================
*/

export function useParentPaymentSummary(
    studentId,
    sessionId,
    termId
) {

    return useQuery({

        queryKey: [
            "parent-payment-summary",
            studentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getParentPaymentSummary(
                studentId,
                sessionId,
                termId
            ),

        enabled:
            Boolean(
                studentId &&
                sessionId &&
                termId
            )

    });

}


/*
==================================================
PAYMENT HISTORY
==================================================
*/

export function useParentPaymentHistory(
    studentId,
    sessionId,
    termId
) {

    return useQuery({

        queryKey: [
            "parent-payment-history",
            studentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getParentPaymentHistory(
                studentId,
                sessionId,
                termId
            ),

        enabled:
            Boolean(
                studentId &&
                sessionId &&
                termId
            )

    });

}


/*
==================================================
FEE BREAKDOWN
==================================================
*/

export function useParentFeeBreakdown(
    studentId,
    sessionId,
    termId
) {

    return useQuery({

        queryKey: [
            "parent-fee-breakdown",
            studentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getParentFeeBreakdown(
                studentId,
                sessionId,
                termId
            ),

        enabled:
            Boolean(
                studentId &&
                sessionId &&
                termId
            )

    });

}