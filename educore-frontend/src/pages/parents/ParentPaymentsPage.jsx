import {
    useEffect,
    useState
} from "react";

import {
    useQuery
} from "@tanstack/react-query";

import {
    Button
} from "@/components/ui/button";

import Loading
from "@/components/common/Loading";

import {
    useSessions
} from "@/hooks/useSessions";

import {
    useTerms
} from "@/hooks/useTerms";

import {
    useReceipt
} from "@/hooks/usePayments";

import {
    useParentPaymentSummary,
    useParentPaymentHistory,
    useParentFeeBreakdown
} from "@/hooks/useParentPayments";

import api
from "@/api/axios";


function ParentPaymentsPage() {


    /*
    ==================================================
    CHILD / SESSION / TERM
    ==================================================
    */

    const [
        studentId,
        setStudentId
    ] = useState("");

    const [
        sessionId,
        setSessionId
    ] = useState("");

    const [
        termId,
        setTermId
    ] = useState("");


    /*
    ==================================================
    RECEIPT
    ==================================================
    */

    const [
        selectedReceiptNumber,
        setSelectedReceiptNumber
    ] = useState("");


    /*
    ==================================================
    LOAD PARENT DASHBOARD
    ==================================================
    */

    const {
        data: dashboard,
        isLoading:
            isDashboardLoading,
        isError:
            isDashboardError
    } = useQuery({

        queryKey: [
            "parent-dashboard"
        ],

        queryFn: async () => {

            const response =
                await api.get(
                    "/parents/dashboard"
                );

            return response.data.data;

        }

    });


    const children =
        dashboard?.children || [];


    /*
    ==================================================
    LOAD SESSIONS
    ==================================================
    */

    const {
        data: sessions = [],
        isLoading:
            isSessionsLoading
    } = useSessions();


    /*
    ==================================================
    LOAD TERMS
    ==================================================
    */

    const {
        data: terms = [],
        isLoading:
            isTermsLoading
    } = useTerms();


    /*
    ==================================================
    FILTER TERMS
    ==================================================
    */

    const filteredTerms =
        terms.filter(

            term =>
                String(
                    term.session_id
                ) ===
                String(
                    sessionId
                )

        );


    /*
    ==================================================
    SELECT FIRST CHILD
    ==================================================
    */

    useEffect(() => {

        if (
            children.length > 0 &&
            !studentId
        ) {

            setStudentId(
                String(
                    children[0].id
                )
            );

        }

    }, [
        children,
        studentId
    ]);


    /*
    ==================================================
    PAYMENT SUMMARY
    ==================================================
    */

    const {
        data: summary,
        isLoading:
            isSummaryLoading,
        isError:
            isSummaryError
    } =
        useParentPaymentSummary(

            studentId,
            sessionId,
            termId

        );


    /*
    ==================================================
    PAYMENT HISTORY
    ==================================================
    */

    const {
        data: payments = [],
        isLoading:
            isPaymentsLoading,
        isError:
            isPaymentsError
    } =
        useParentPaymentHistory(

            studentId,
            sessionId,
            termId

        );


    /*
    ==================================================
    FEE BREAKDOWN
    ==================================================
    */

    const {
        data: feeBreakdown = [],
        isLoading:
            isFeesLoading,
        isError:
            isFeesError
    } =
        useParentFeeBreakdown(

            studentId,
            sessionId,
            termId

        );


    /*
    ==================================================
    RECEIPT
    ==================================================
    */

    const {
        data: receipt,
        isLoading:
            isReceiptLoading,
        isError:
            isReceiptError
    } = useReceipt(

        selectedReceiptNumber

    );


    /*
    ==================================================
    SELECTED CHILD
    ==================================================
    */

    const selectedChild =
        children.find(

            child =>
                String(child.id) ===
                String(studentId)

        );


    /*
    ==================================================
    SELECTED SESSION
    ==================================================
    */

    const selectedSession =
        sessions.find(

            session =>
                String(session.id) ===
                String(sessionId)

        );


    /*
    ==================================================
    SELECTED TERM
    ==================================================
    */

    const selectedTerm =
        terms.find(

            term =>
                String(term.id) ===
                String(termId)

        );


    /*
    ==================================================
    FORMAT CURRENCY
    ==================================================
    */

    const formatCurrency = value => {

        return Number(
            value || 0
        ).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    /*
    ==================================================
    FORMAT DATE
    ==================================================
    */

    const formatDate = date => {

        if (!date) {

            return "—";

        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    /*
    ==================================================
    PAYMENT METHOD
    ==================================================
    */

    const getPaymentMethodLabel =
        method => {

            switch (method) {

                case "CASH":
                    return "Cash";

                case "BANK_TRANSFER":
                    return "Bank Transfer";

                case "CARD":
                    return "Card";

                case "ONLINE":
                    return "Online Payment";

                default:
                    return method || "—";

            }

        };


    /*
    ==================================================
    PAYMENT STATUS
    ==================================================
    */

    const getStatusClass =
        status => {

            switch (status) {

                case "PAID":

                    return "text-green-600";

                case "PARTLY PAID":

                    return "text-orange-600";

                case "UNPAID":

                    return "text-red-600";

                default:

                    return "text-foreground";

            }

        };


    /*
    ==================================================
    RESET TERM WHEN SESSION CHANGES
    ==================================================
    */

    useEffect(() => {

        setTermId("");

    }, [
        sessionId
    ]);


    /*
    ==================================================
    LOADING
    ==================================================
    */

    if (
        isDashboardLoading ||
        isSessionsLoading ||
        isTermsLoading
    ) {

        return (

            <Loading
                message="Loading payment information..."
            />

        );

    }


    /*
    ==================================================
    ERROR
    ==================================================
    */

    if (isDashboardError) {

        return (

            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">

                <p className="font-semibold">

                    Failed to load your payment information.

                </p>

                <p className="mt-1 text-sm">

                    Please try again later.

                </p>

            </div>

        );

    }


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <>

            <div className="space-y-6">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <div>

                    <h1 className="text-2xl font-bold">

                        Payments

                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">

                        View your children's school
                        fees and payment history.

                    </p>

                </div>


                {/* ==========================================
                    CHILD / SESSION / TERM SELECTION
                ========================================== */}

                <div className="rounded-xl border bg-background p-6 shadow-sm">

                    <h2 className="text-lg font-semibold">

                        Payment Details

                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">

                        Select a child, academic
                        session and term.

                    </p>


                    <div className="mt-5 grid gap-4 md:grid-cols-3">


                        {/* CHILD */}

                        <div>

                            <label className="text-sm font-medium">

                                Child

                            </label>

                            <select

                                value={
                                    studentId
                                }

                                onChange={
                                    event =>
                                        setStudentId(
                                            event.target.value
                                        )
                                }

                                className="mt-1 w-full rounded-md border px-3 py-2"

                            >

                                <option value="">

                                    Select Child

                                </option>


                                {children.map(
                                    child => (

                                        <option
                                            key={
                                                child.id
                                            }
                                            value={
                                                child.id
                                            }
                                        >

                                            {
                                                child.student_name
                                            }

                                            {" — "}

                                            {
                                                child.admission_number
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* SESSION */}

                        <div>

                            <label className="text-sm font-medium">

                                Academic Session

                            </label>

                            <select

                                value={
                                    sessionId
                                }

                                onChange={
                                    event => {

                                        setSessionId(
                                            event.target.value
                                        );

                                        setTermId("");

                                    }
                                }

                                className="mt-1 w-full rounded-md border px-3 py-2"

                            >

                                <option value="">

                                    Select Session

                                </option>


                                {sessions.map(
                                    session => (

                                        <option
                                            key={
                                                session.id
                                            }
                                            value={
                                                session.id
                                            }
                                        >

                                            {
                                                session.session_name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* TERM */}

                        <div>

                            <label className="text-sm font-medium">

                                Term

                            </label>

                            <select

                                value={
                                    termId
                                }

                                onChange={
                                    event =>
                                        setTermId(
                                            event.target.value
                                        )
                                }

                                disabled={
                                    !sessionId
                                }

                                className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                            >

                                <option value="">

                                    {
                                        !sessionId
                                            ? "Select session first"
                                            : "Select Term"
                                    }

                                </option>


                                {filteredTerms.map(
                                    term => (

                                        <option
                                            key={
                                                term.id
                                            }
                                            value={
                                                term.id
                                            }
                                        >

                                            {
                                                term.term_name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    CHILD INFORMATION
                ========================================== */}

                {selectedChild && (

                    <div className="rounded-xl border bg-background p-6 shadow-sm">

                        <div className="flex flex-col gap-1">

                            <h2 className="text-xl font-bold">

                                {
                                    selectedChild.student_name
                                }

                            </h2>

                            <p className="text-sm text-muted-foreground">

                                Admission No:

                                {" "}

                                {
                                    selectedChild.admission_number
                                }

                            </p>

                            <p className="text-sm text-muted-foreground">

                                Class:

                                {" "}

                                {
                                    selectedChild.class_name
                                }

                                {" "}

                                {selectedChild.arm_name &&
                                    `(${selectedChild.arm_name})`
                                }

                            </p>

                        </div>

                    </div>

                )}


                {/* ==========================================
                    PAYMENT INFORMATION
                ========================================== */}

                {studentId &&
                    sessionId &&
                    termId && (

                    <>

                        {/* SUMMARY */}

                        {isSummaryLoading ? (

                            <Loading
                                message="Loading payment summary..."
                            />

                        ) : isSummaryError ? (

                            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">

                                Failed to load
                                payment summary.

                            </div>

                        ) : summary ? (

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


                                {/* TOTAL FEES */}

                                <div className="rounded-xl border bg-background p-5 shadow-sm">

                                    <p className="text-sm text-muted-foreground">

                                        Total Fees

                                    </p>

                                    <p className="mt-2 text-2xl font-bold">

                                        ₦
                                        {
                                            formatCurrency(
                                                summary.total_fees
                                            )
                                        }

                                    </p>

                                </div>


                                {/* TOTAL PAID */}

                                <div className="rounded-xl border bg-background p-5 shadow-sm">

                                    <p className="text-sm text-muted-foreground">

                                        Total Paid

                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-green-600">

                                        ₦
                                        {
                                            formatCurrency(
                                                summary.total_paid
                                            )
                                        }

                                    </p>

                                </div>


                                {/* BALANCE */}

                                <div className="rounded-xl border bg-background p-5 shadow-sm">

                                    <p className="text-sm text-muted-foreground">

                                        Outstanding Balance

                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-red-600">

                                        ₦
                                        {
                                            formatCurrency(
                                                summary.balance
                                            )
                                        }

                                    </p>

                                </div>


                                {/* STATUS */}

                                <div className="rounded-xl border bg-background p-5 shadow-sm">

                                    <p className="text-sm text-muted-foreground">

                                        Payment Status

                                    </p>

                                    <p
                                        className={`mt-2 text-xl font-bold ${getStatusClass(
                                            summary.status
                                        )}`}
                                    >

                                        {
                                            summary.status
                                        }

                                    </p>

                                </div>

                            </div>

                        ) : null}


                        {/* =================================
                            TERM INFORMATION
                        ================================= */}

                        <div className="rounded-xl border bg-background p-6 shadow-sm">

                            <div>

                                <h2 className="text-lg font-semibold">

                                    {
                                        selectedSession
                                            ?.session_name
                                    }

                                    {" — "}

                                    {
                                        selectedTerm
                                            ?.term_name
                                    }

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">

                                    Fee and payment
                                    information for the
                                    selected term.

                                </p>

                            </div>

                        </div>


                        {/* =================================
                            FEE BREAKDOWN
                        ================================= */}

                        <div className="rounded-xl border bg-background shadow-sm">

                            <div className="border-b p-6">

                                <h2 className="text-lg font-semibold">

                                    Fee Breakdown

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">

                                    Fees assigned to this
                                    child for the selected term.

                                </p>

                            </div>


                            {isFeesLoading ? (

                                <Loading
                                    message="Loading fee breakdown..."
                                />

                            ) : isFeesError ? (

                                <div className="p-6 text-red-600">

                                    Failed to load
                                    fee breakdown.

                                </div>

                            ) : feeBreakdown.length === 0 ? (

                                <div className="p-8 text-center text-muted-foreground">

                                    No fee structure has
                                    been configured for
                                    this term.

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead className="bg-muted">

                                            <tr>

                                                <th className="px-4 py-3 text-left">

                                                    Fee

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Description

                                                </th>

                                                <th className="px-4 py-3 text-right">

                                                    Amount

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {feeBreakdown.map(
                                                fee => (

                                                    <tr
                                                        key={
                                                            fee.id
                                                        }
                                                        className="border-t"
                                                    >

                                                        <td className="px-4 py-3 font-medium">

                                                            {
                                                                fee.fee_name
                                                            }

                                                        </td>

                                                        <td className="px-4 py-3 text-muted-foreground">

                                                            {
                                                                fee.description ||
                                                                "—"
                                                            }

                                                        </td>

                                                        <td className="px-4 py-3 text-right font-semibold">

                                                            ₦
                                                            {
                                                                formatCurrency(
                                                                    fee.amount
                                                                )
                                                            }

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>


                                        <tfoot>

                                            <tr className="border-t bg-muted font-bold">

                                                <td
                                                    colSpan="2"
                                                    className="px-4 py-4 text-right"
                                                >

                                                    Total

                                                </td>

                                                <td className="px-4 py-4 text-right">

                                                    ₦
                                                    {
                                                        formatCurrency(

                                                            feeBreakdown.reduce(

                                                                (
                                                                    total,
                                                                    fee
                                                                ) =>

                                                                    total +
                                                                    Number(
                                                                        fee.amount ||
                                                                        0
                                                                    ),

                                                                0

                                                            )

                                                        )
                                                    }

                                                </td>

                                            </tr>

                                        </tfoot>

                                    </table>

                                </div>

                            )}

                        </div>


                        {/* =================================
                            PAYMENT HISTORY
                        ================================= */}

                        <div className="rounded-xl border bg-background shadow-sm">

                            <div className="border-b p-6">

                                <h2 className="text-lg font-semibold">

                                    Payment History

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">

                                    Previous payments for
                                    this child and term.

                                </p>

                            </div>


                            {isPaymentsLoading ? (

                                <Loading
                                    message="Loading payment history..."
                                />

                            ) : isPaymentsError ? (

                                <div className="p-6 text-red-600">

                                    Failed to load
                                    payment history.

                                </div>

                            ) : payments.length === 0 ? (

                                <div className="p-8 text-center text-muted-foreground">

                                    No payments have been
                                    recorded for this term.

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead className="bg-muted">

                                            <tr>

                                                <th className="px-4 py-3 text-left">

                                                    S/N

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Date

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Receipt

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Method

                                                </th>

                                                <th className="px-4 py-3 text-right">

                                                    Amount

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Remarks

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {payments.map(
                                                (
                                                    payment,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            payment.id
                                                        }
                                                        className="border-t"
                                                    >

                                                        <td className="px-4 py-3">

                                                            {
                                                                index + 1
                                                            }

                                                        </td>


                                                        <td className="px-4 py-3 whitespace-nowrap">

                                                            {
                                                                formatDate(
                                                                    payment.payment_date
                                                                )
                                                            }

                                                        </td>


                                                        <td className="px-4 py-3 whitespace-nowrap">

                                                            {payment.reference_number ? (

                                                                <button

                                                                    type="button"

                                                                    onClick={() =>
                                                                        setSelectedReceiptNumber(
                                                                            payment.reference_number
                                                                        )
                                                                    }

                                                                    className="font-medium text-primary underline underline-offset-4 hover:opacity-80"

                                                                >

                                                                    {
                                                                        payment.reference_number
                                                                    }

                                                                </button>

                                                            ) : (

                                                                "—"

                                                            )}

                                                        </td>


                                                        <td className="px-4 py-3">

                                                            {
                                                                getPaymentMethodLabel(
                                                                    payment.payment_method
                                                                )
                                                            }

                                                        </td>


                                                        <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">

                                                            ₦
                                                            {
                                                                formatCurrency(
                                                                    payment.amount_paid
                                                                )
                                                            }

                                                        </td>


                                                        <td className="px-4 py-3">

                                                            {
                                                                payment.remarks ||
                                                                "—"
                                                            }

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </>

                )}

            </div>


            {/* ==================================================
                RECEIPT MODAL
            ================================================== */}

            {selectedReceiptNumber && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl text-black">


                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b p-5">

                            <div>

                                <h2 className="text-lg font-bold">

                                    Payment Receipt

                                </h2>

                                <p className="text-sm text-muted-foreground">

                                    {
                                        selectedReceiptNumber
                                    }

                                </p>

                            </div>


                            <Button

                                type="button"

                                variant="outline"

                                onClick={() =>
                                    setSelectedReceiptNumber("")
                                }

                            >

                                Close

                            </Button>

                        </div>


                        {/* RECEIPT CONTENT */}

                        {isReceiptLoading ? (

                            <div className="p-10">

                                <Loading
                                    message="Loading receipt..."
                                />

                            </div>

                        ) : isReceiptError ? (

                            <div className="p-8 text-red-600">

                                Failed to load receipt.

                            </div>

                        ) : receipt ? (

                            <div className="p-6">

                                <div
                                    id="print-receipt"
                                    className="rounded-lg border bg-background p-6"
                                >

                                    <div className="text-center">

                                        <h1 className="text-2xl font-bold">

                                            EDUCORE

                                        </h1>

                                        <p className="mt-1 text-sm text-muted-foreground">

                                            Official Payment Receipt

                                        </p>

                                    </div>


                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                        <div>

                                            <p className="text-xs text-muted-foreground">

                                                Receipt Number

                                            </p>

                                            <p className="font-semibold">

                                                {
                                                    receipt.reference_number
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-xs text-muted-foreground">

                                                Payment Date

                                            </p>

                                            <p className="font-semibold">

                                                {
                                                    formatDate(
                                                        receipt.payment_date
                                                    )
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-xs text-muted-foreground">

                                                Student

                                            </p>

                                            <p className="font-semibold">

                                                {
                                                    receipt.student_name ||
                                                    selectedChild?.student_name ||
                                                    "—"
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-xs text-muted-foreground">

                                                Admission Number

                                            </p>

                                            <p className="font-semibold">

                                                {
                                                    receipt.admission_number ||
                                                    selectedChild?.admission_number ||
                                                    "—"
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-xs text-muted-foreground">

                                                Payment Method

                                            </p>

                                            <p className="font-semibold">

                                                {
                                                    getPaymentMethodLabel(
                                                        receipt.payment_method
                                                    )
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-xs text-muted-foreground">

                                                Amount Paid

                                            </p>

                                            <p className="text-xl font-bold">

                                                ₦
                                                {
                                                    formatCurrency(
                                                        receipt.amount_paid
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </div>


                                    {receipt.remarks && (

                                        <div className="mt-6 rounded-lg border p-4">

                                            <p className="text-xs text-muted-foreground">

                                                Remarks

                                            </p>

                                            <p className="mt-1">

                                                {
                                                    receipt.remarks
                                                }

                                            </p>

                                        </div>

                                    )}


                                    <div className="mt-8 text-center text-sm text-muted-foreground">

                                        Thank you for your payment.

                                    </div>

                                </div>


                                <div className="mt-5 flex justify-end gap-3">

                                    <Button

                                        type="button"

                                        variant="outline"

                                        onClick={() =>
                                            setSelectedReceiptNumber(
                                                ""
                                            )
                                        }

                                    >

                                        Close

                                    </Button>


                                    <Button

                                        type="button"

                                        onClick={() =>
                                            window.print()
                                        }

                                    >

                                        Print Receipt

                                    </Button>

                                </div>

                            </div>

                        ) : null}

                    </div>

                </div>

            )}

        </>

    );

}


export default ParentPaymentsPage;