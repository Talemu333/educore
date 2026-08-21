import {
    useEffect,
    useState,
    useRef
} from "react";

import {
    Button
} from "@/components/ui/Button";

import Loading
from "@/components/common/Loading";

import toast
from "react-hot-toast";

import {
    useStudents
} from "@/hooks/useStudents";

import {
    useSessions
} from "@/hooks/useSessions";

import {
    useTerms
} from "@/hooks/useTerms";

import {
    useStudentFinancialSummary,
    useStudentPayments,
    useCreatePayment,
    useReceipt
} from "@/hooks/usePayments";


function PaymentsPage() {

    /*
    =====================================
    FILTER STATES
    =====================================
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
    =====================================
    PAYMENT FORM
    =====================================
    */

    const [
        amountPaid,
        setAmountPaid
    ] = useState("");

    const [
        paymentMethod,
        setPaymentMethod
    ] = useState("CASH");

    const [
        paymentDate,
        setPaymentDate
    ] = useState(

        new Date()
            .toISOString()
            .split("T")[0]

    );

    const [
        remarks,
        setRemarks
    ] = useState("");


    /*
    =====================================
    RECEIPT
    =====================================
    */

    const [
        selectedReceiptNumber,
        setSelectedReceiptNumber
    ] = useState("");


    const receiptRef = useRef(null);


    const {
        data: receipt,
        isLoading: isReceiptLoading,
        isError: isReceiptError
    } = useReceipt(
        selectedReceiptNumber
    );


    /*
    =====================================
    LOAD STUDENTS
    =====================================
    */

    const {
        data: studentsResponse,
        isLoading: isStudentsLoading
    } = useStudents("", 1, 1000);


    const students =
        studentsResponse?.data || [];


    /*
    =====================================
    LOAD SESSIONS
    =====================================
    */

    const {
        data: sessions = [],
        isLoading: isSessionsLoading
    } = useSessions();


    /*
    =====================================
    LOAD TERMS
    =====================================
    */

    const {
        data: terms = [],
        isLoading: isTermsLoading
    } = useTerms();


    /*
    =====================================
    FILTER TERMS BY SESSION
    =====================================
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
    =====================================
    FINANCIAL SUMMARY
    =====================================
    */

    const {
        data: financialSummary,
        isLoading:
            isFinancialSummaryLoading,
        isError:
            isFinancialSummaryError
    } =
        useStudentFinancialSummary(

            studentId,
            sessionId,
            termId

        );


    /*
    =====================================
    PAYMENT HISTORY
    =====================================
    */

    const {
        data: payments = [],
        isLoading:
            isPaymentsLoading
    } =
        useStudentPayments(

            studentId,
            sessionId,
            termId

        );


    /*
    =====================================
    CREATE PAYMENT
    =====================================
    */

    const {
        mutate:
            createPaymentMutation,

        isPending:
            isSaving

    } =
        useCreatePayment();


    /*
    =====================================
    RESET PAYMENT FORM
    =====================================
    */

    useEffect(() => {

        setAmountPaid("");

        setRemarks("");

    }, [
        studentId,
        sessionId,
        termId
    ]);


    /*
    =====================================
    HANDLE RECORD PAYMENT
    =====================================
    */

    const handleRecordPayment = () => {

        /*
        ---------------------------------
        VALIDATION
        ---------------------------------
        */

        if (!studentId) {

            toast.error(
                "Please select a student."
            );

            return;

        }


        if (!sessionId) {

            toast.error(
                "Please select an academic session."
            );

            return;

        }


        if (!termId) {

            toast.error(
                "Please select a term."
            );

            return;

        }


        if (!amountPaid) {

            toast.error(
                "Please enter the payment amount."
            );

            return;

        }


        const amount =
            Number(amountPaid);


        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {

            toast.error(
                "Payment amount must be greater than zero."
            );

            return;

        }


        /*
        ---------------------------------
        CHECK BALANCE
        ---------------------------------
        */

        if (
            financialSummary &&
            amount >
                Number(
                    financialSummary.balance
                )
        ) {

            toast.error(

                `Payment exceeds outstanding balance of ₦${Number(
                    financialSummary.balance
                ).toLocaleString()}.`

            );

            return;

        }


        /*
        ---------------------------------
        BUILD PAYMENT DATA
        ---------------------------------
        */

        const data = {

            student_id:
                Number(studentId),

            session_id:
                Number(sessionId),

            term_id:
                Number(termId),

            amount_paid:
                amount,

            payment_date:
                paymentDate,

            payment_method:
                paymentMethod,

            remarks:
                remarks.trim() || null

        };


        /*
        ---------------------------------
        SEND PAYMENT
        ---------------------------------
        */

        createPaymentMutation(

            data,

            {

                onSuccess: payment => {

                    toast.success(
                        "Payment recorded successfully."
                    );

                    setAmountPaid("");

                    setRemarks("");

                    console.log(
                        "Payment:",
                        payment
                    );

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to record payment."

                    );

                }

            }

        );

    };


    /*
    =====================================
    PRINT RECEIPT
    =====================================
    */

    const handlePrintReceipt = () => {

        if (!receipt) {

            toast.error(
                "Receipt is not available."
            );

            return;

        }

        window.print();

    };


    /*
    =====================================
    LOADING
    =====================================
    */

    if (
        isStudentsLoading ||
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
    =====================================
    RENDER
    =====================================
    */

    return (

        <>

            {/* 
            =====================================
            PRINT STYLES
            =====================================
            */}

            <style>

                {`

                    @media print {

                        body * {

                            visibility: hidden !important;

                        }


                        #print-receipt,
                        #print-receipt * {

                            visibility: visible !important;

                        }


                        #print-receipt {

                            position: absolute !important;

                            left: 0 !important;

                            top: 0 !important;

                            width: 100% !important;

                            margin: 0 !important;

                            padding: 30px !important;

                            background: white !important;

                            color: black !important;

                            box-shadow: none !important;

                            border: none !important;

                            border-radius: 0 !important;

                        }


                        #print-receipt .no-print {

                            display: none !important;

                        }


                        @page {

                            size: A4;

                            margin: 15mm;

                        }

                    }

                `}

            </style>


            {/* 
            =====================================
            MAIN PAGE
            =====================================
            */}

            <div className="space-y-6">


                {/* PAGE HEADER */}

                <div>

                    <h1 className="text-2xl font-bold">

                        Payments

                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">

                        Record and manage student
                        school fee payments.

                    </p>

                </div>


                {/* 
                =====================================
                SELECTION
                =====================================
                */}

                <div className="rounded-xl border bg-background p-6 shadow-sm">

                    <h2 className="text-lg font-semibold">

                        Payment Details

                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">

                        Select a student, academic
                        session and term.

                    </p>


                    <div className="mt-5 grid gap-4 md:grid-cols-3">


                        {/* STUDENT */}

                        <div>

                            <label className="text-sm font-medium">

                                Student

                            </label>

                            <select

                                value={studentId}

                                onChange={event =>

                                    setStudentId(
                                        event.target.value
                                    )

                                }

                                className="mt-1 w-full rounded-md border px-3 py-2"

                            >

                                <option value="">

                                    Select Student

                                </option>


                                {students.map(

                                    student => (

                                        <option

                                            key={
                                                student.id
                                            }

                                            value={
                                                student.id
                                            }

                                        >

                                            {
                                                student.first_name
                                            }

                                            {" "}

                                            {
                                                student.surname
                                            }

                                            {" — "}

                                            {
                                                student.admission_number
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

                                value={sessionId}

                                onChange={event => {

                                    setSessionId(
                                        event.target.value
                                    );

                                    setTermId("");

                                }}

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

                                value={termId}

                                onChange={event =>

                                    setTermId(
                                        event.target.value
                                    )

                                }

                                disabled={!sessionId}

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


                {/* 
                =====================================
                FINANCIAL SUMMARY
                =====================================
                */}

                {studentId &&
                    sessionId &&
                    termId && (

                        <>

                            {

                                isFinancialSummaryLoading ? (

                                    <Loading
                                        message="Loading financial summary..."
                                    />

                                ) : isFinancialSummaryError ? (

                                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">

                                        Failed to load
                                        financial summary.

                                    </div>

                                ) : financialSummary ? (

                                    <div className="grid gap-4 md:grid-cols-4">


                                        {/* TOTAL FEES */}

                                        <div className="rounded-xl border bg-background p-5 shadow-sm">

                                            <p className="text-sm text-muted-foreground">

                                                Total Fees

                                            </p>

                                            <p className="mt-2 text-2xl font-bold">

                                                ₦

                                                {

                                                    Number(
                                                        financialSummary.totalFees
                                                    ).toLocaleString()

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

                                                    Number(
                                                        financialSummary.totalPaid
                                                    ).toLocaleString()

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

                                                    Number(
                                                        financialSummary.balance
                                                    ).toLocaleString()

                                                }

                                            </p>

                                        </div>


                                        {/* STATUS */}

                                        <div className="rounded-xl border bg-background p-5 shadow-sm">

                                            <p className="text-sm text-muted-foreground">

                                                Payment Status

                                            </p>

                                            <p className="mt-2 text-xl font-bold">

                                                {
                                                    financialSummary.status
                                                }

                                            </p>

                                        </div>

                                    </div>

                                ) : null

                            }


                            {/* 
                            =====================================
                            RECORD PAYMENT
                            =====================================
                            */}

                            {

                                financialSummary &&
                                Number(
                                    financialSummary.balance
                                ) > 0 && (

                                    <div className="rounded-xl border bg-background p-6 shadow-sm">

                                        <h2 className="text-lg font-semibold">

                                            Record Payment

                                        </h2>


                                        <div className="mt-5 grid gap-4 md:grid-cols-2">


                                            {/* AMOUNT */}

                                            <div>

                                                <label className="text-sm font-medium">

                                                    Amount Paid

                                                </label>

                                                <input

                                                    type="number"

                                                    min="1"

                                                    value={
                                                        amountPaid
                                                    }

                                                    onChange={event =>

                                                        setAmountPaid(
                                                            event.target.value
                                                        )

                                                    }

                                                    placeholder="Enter amount"

                                                    className="mt-1 w-full rounded-md border px-3 py-2"

                                                />

                                            </div>


                                            {/* PAYMENT METHOD */}

                                            <div>

                                                <label className="text-sm font-medium">

                                                    Payment Method

                                                </label>

                                                <select

                                                    value={
                                                        paymentMethod
                                                    }

                                                    onChange={event =>

                                                        setPaymentMethod(
                                                            event.target.value
                                                        )

                                                    }

                                                    className="mt-1 w-full rounded-md border px-3 py-2"

                                                >

                                                    <option value="CASH">

                                                        Cash

                                                    </option>

                                                    <option value="BANK_TRANSFER">

                                                        Bank Transfer

                                                    </option>

                                                    <option value="CARD">

                                                        Card

                                                    </option>

                                                    <option value="ONLINE">

                                                        Online Payment

                                                    </option>

                                                </select>

                                            </div>


                                            {/* PAYMENT DATE */}

                                            <div>

                                                <label className="text-sm font-medium">

                                                    Payment Date

                                                </label>

                                                <input

                                                    type="date"

                                                    value={
                                                        paymentDate
                                                    }

                                                    onChange={event =>

                                                        setPaymentDate(
                                                            event.target.value
                                                        )

                                                    }

                                                    className="mt-1 w-full rounded-md border px-3 py-2"

                                                />

                                            </div>


                                            {/* REMARKS */}

                                            <div>

                                                <label className="text-sm font-medium">

                                                    Remarks

                                                </label>

                                                <input

                                                    type="text"

                                                    value={
                                                        remarks
                                                    }

                                                    onChange={event =>

                                                        setRemarks(
                                                            event.target.value
                                                        )

                                                    }

                                                    placeholder="Optional"

                                                    className="mt-1 w-full rounded-md border px-3 py-2"

                                                />

                                            </div>

                                        </div>


                                        <div className="mt-5 flex justify-end">

                                            <Button

                                                type="button"

                                                onClick={
                                                    handleRecordPayment
                                                }

                                                disabled={
                                                    isSaving
                                                }

                                            >

                                                {

                                                    isSaving

                                                        ? "Recording..."

                                                        : "Record Payment"

                                                }

                                            </Button>

                                        </div>

                                    </div>

                                )

                            }


                            {/* 
                            =====================================
                            FULLY PAID
                            =====================================
                            */}

                            {

                                financialSummary &&

                                Number(
                                    financialSummary.balance
                                ) === 0 && (

                                    <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-700">

                                        <p className="font-semibold">

                                            This student's fees
                                            have been fully paid
                                            for the selected term.

                                        </p>

                                    </div>

                                )

                            }


                            {/* 
                            =====================================
                            PAYMENT HISTORY
                            =====================================
                            */}

                            <div className="rounded-xl border bg-background shadow-sm">

                                <div className="border-b p-6">

                                    <h2 className="text-lg font-semibold">

                                        Payment History

                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">

                                        Previous payments for
                                        this student and term.

                                    </p>

                                </div>


                                {

                                    isPaymentsLoading ? (

                                        <Loading
                                            message="Loading payment history..."
                                        />

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

                                                            Amount

                                                        </th>

                                                        <th className="px-4 py-3 text-left">

                                                            Method

                                                        </th>

                                                        <th className="px-4 py-3 text-left">

                                                            Receipt

                                                        </th>

                                                        <th className="px-4 py-3 text-left">

                                                            Received By

                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {

                                                        payments.map(

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


                                                                    <td className="px-4 py-3">

                                                                        {
                                                                            new Date(
                                                                                payment.payment_date
                                                                            ).toLocaleDateString()
                                                                        }

                                                                    </td>


                                                                    <td className="px-4 py-3 font-medium">

                                                                        ₦

                                                                        {

                                                                            Number(
                                                                                payment.amount_paid
                                                                            ).toLocaleString()

                                                                        }

                                                                    </td>


                                                                    <td className="px-4 py-3">

                                                                        {
                                                                            payment.payment_method
                                                                        }

                                                                    </td>


                                                                    <td className="px-4 py-3">

                                                                        <div className="flex items-center gap-2">

                                                                            <span>

                                                                                {
                                                                                    payment.reference_number
                                                                                }

                                                                            </span>


                                                                            {payment.reference_number && (

                                                                                <Button

                                                                                    type="button"

                                                                                    variant="outline"

                                                                                    size="sm"

                                                                                    onClick={() =>
                                                                                        setSelectedReceiptNumber(
                                                                                            payment.reference_number
                                                                                        )
                                                                                    }

                                                                                >

                                                                                    View

                                                                                </Button>

                                                                            )}

                                                                        </div>

                                                                    </td>


                                                                    <td className="px-4 py-3">

                                                                        {
                                                                            payment.received_by ||
                                                                            "—"
                                                                        }

                                                                    </td>

                                                                </tr>

                                                            )

                                                        )

                                                    }

                                                </tbody>

                                            </table>

                                        </div>

                                    )

                                }

                            </div>

                        </>

                    )}


            </div>


            {/* 
            =====================================
            RECEIPT MODAL
            =====================================
            */}

            {

                selectedReceiptNumber && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">


                        <div

                            id="print-receipt"

                            ref={receiptRef}

                            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl text-black"

                        >


                            {/* RECEIPT HEADER */}

                            <div className="flex items-center justify-between border-b pb-4 no-print">

                                <h2 className="text-xl font-bold">

                                    Payment Receipt

                                </h2>


                                <button

                                    type="button"

                                    onClick={() =>
                                        setSelectedReceiptNumber("")
                                    }

                                    className="text-sm text-gray-500 hover:text-gray-900"

                                >

                                    Close

                                </button>

                            </div>


                            {

                                isReceiptLoading ? (

                                    <div className="py-10 text-center">

                                        Loading receipt...

                                    </div>

                                ) : isReceiptError ? (

                                    <div className="py-10 text-center text-red-600">

                                        Failed to load receipt.

                                    </div>

                                ) : receipt ? (

                                    <div className="mt-6 space-y-6">


                                        {/* SCHOOL HEADER */}

                                        <div className="text-center border-b pb-5">

                                            <h3 className="text-3xl font-bold tracking-wide">

                                                EDUCORE

                                            </h3>


                                            <p className="text-sm text-gray-600">

                                                School Payment Receipt

                                            </p>

                                        </div>


                                        {/* RECEIPT INFORMATION */}

                                        <div className="grid gap-4 border-b py-5 md:grid-cols-2">


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Receipt Number

                                                </p>

                                                <p className="font-semibold">

                                                    {
                                                        receipt.reference_number
                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Payment Date

                                                </p>

                                                <p className="font-semibold">

                                                    {

                                                        new Date(

                                                            receipt.payment_date

                                                        ).toLocaleDateString()

                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Student

                                                </p>

                                                <p className="font-semibold">

                                                    {
                                                        receipt.first_name
                                                    }

                                                    {" "}

                                                    {
                                                        receipt.surname
                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Admission Number

                                                </p>

                                                <p className="font-semibold">

                                                    {
                                                        receipt.admission_number
                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Class

                                                </p>

                                                <p className="font-semibold">

                                                    {
                                                        receipt.class_name
                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Academic Session

                                                </p>

                                                <p className="font-semibold">

                                                    {
                                                        receipt.session_name
                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Term

                                                </p>

                                                <p className="font-semibold">

                                                    {
                                                        receipt.term_name
                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">

                                                    Payment Method

                                                </p>

                                                <p className="font-semibold">

                                                    {
                                                        receipt.payment_method
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        {/* AMOUNT */}

                                        <div className="rounded-lg border p-5 text-center">

                                            <p className="text-sm text-gray-500">

                                                Amount Paid

                                            </p>


                                            <p className="mt-2 text-3xl font-bold">

                                                ₦

                                                {

                                                    Number(

                                                        receipt.amount_paid

                                                    ).toLocaleString()

                                                }

                                            </p>

                                        </div>


                                        {/* REMARKS */}

                                        {

                                            receipt.remarks && (

                                                <div className="border-b pb-4">

                                                    <p className="text-sm text-gray-500">

                                                        Remarks

                                                    </p>


                                                    <p className="font-medium">

                                                        {
                                                            receipt.remarks
                                                        }

                                                    </p>

                                                </div>

                                            )

                                        }


                                        {/* RECEIVED BY */}

                                        <div className="border-t pt-4 text-sm text-gray-600">

                                            Received by:{" "}


                                            <span className="font-medium text-black">

                                                {
                                                    receipt.received_by ||
                                                    "—"
                                                }

                                            </span>

                                        </div>


                                        {/* BUTTONS */}

                                        <div className="flex justify-end gap-3 no-print">

                                            <Button

                                                type="button"

                                                variant="outline"

                                                onClick={() =>
                                                    setSelectedReceiptNumber("")
                                                }

                                            >

                                                Close

                                            </Button>


                                            <Button

                                                type="button"

                                                onClick={
                                                    handlePrintReceipt
                                                }

                                            >

                                                Print Receipt

                                            </Button>

                                        </div>


                                    </div>

                                ) : null

                            }

                        </div>

                    </div>

                )

            }

        </>

    );

}


export default PaymentsPage;