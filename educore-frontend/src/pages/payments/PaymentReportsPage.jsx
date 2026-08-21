import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Button
} from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

import Loading from "@/components/common/Loading";

import toast from "react-hot-toast";

import {
    useSessions
} from "@/hooks/useSessions";

import {
    useTerms
} from "@/hooks/useTerms";

import {
    useStudents
} from "@/hooks/useStudents";

import {
    usePaymentReport,
    useReceipt
} from "@/hooks/usePayments";


function PaymentReportsPage() {

    /*
    =====================================
    FILTER STATES
    =====================================
    */

    const [
        sessionId,
        setSessionId
    ] = useState("");

    const [
        termId,
        setTermId
    ] = useState("");

    const [
        classId,
        setClassId
    ] = useState("");

    const [
        paymentMethod,
        setPaymentMethod
    ] = useState("");

    const [
        dateFrom,
        setDateFrom
    ] = useState("");

    const [
        dateTo,
        setDateTo
    ] = useState("");

    const [
        search,
        setSearch
    ] = useState("");


    /*
    =====================================
    RECEIPT MODAL STATE
    =====================================
    */

    const [
        selectedReceiptNumber,
        setSelectedReceiptNumber
    ] = useState("");

    const [
        isReceiptModalOpen,
        setIsReceiptModalOpen
    ] = useState(false);


    /*
    =====================================
    LOAD RECEIPT
    =====================================
    */

    const {
        data: receipt,
        isLoading: isReceiptLoading,
        isError: isReceiptError,
        error: receiptError
    } = useReceipt(
        selectedReceiptNumber
    );


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
    LOAD STUDENTS
    =====================================
    */

    const {
        data: studentsResponse,
        isLoading: isStudentsLoading
    } = useStudents(
        "",
        1,
        1000
    );


    const students =
        studentsResponse?.data || [];


    /*
    =====================================
    FILTER TERMS BY SESSION
    =====================================
    */

    const filteredTerms = useMemo(() => {

        if (!sessionId) {

            return terms;

        }

        return terms.filter(

            term =>
                String(term.session_id) ===
                String(sessionId)

        );

    }, [
        terms,
        sessionId
    ]);


    /*
    =====================================
    BUILD CLASS LIST
    =====================================
    */

    const classes = useMemo(() => {

        const classMap = new Map();

        students.forEach(student => {

            if (
                student.class_id &&
                student.class_name
            ) {

                classMap.set(
                    student.class_id,
                    student.class_name
                );

            }

        });

        return Array.from(
            classMap.entries()
        ).map(
            ([id, class_name]) => ({
                id,
                class_name
            })
        );

    }, [
        students
    ]);


    /*
    =====================================
    PAYMENT REPORT
    =====================================
    */

    const {
        data: reportData,
        isLoading: isReportLoading,
        isError: isReportError,
        error: reportError
    } = usePaymentReport({

        sessionId,

        termId,

        classId,

        paymentMethod,

        dateFrom,

        dateTo,

        search

    });


    /*
    =====================================
    REPORT DATA
    =====================================
    */

    const report =
        reportData?.report || [];

    const summary =
        reportData?.summary || {};


    /*
    =====================================
    RESET TERM WHEN SESSION CHANGES
    =====================================
    */

    useEffect(() => {

        setTermId("");

    }, [
        sessionId
    ]);


    /*
    =====================================
    FORMAT CURRENCY
    =====================================
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
    =====================================
    FORMAT DATE
    =====================================
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
    =====================================
    PAYMENT METHOD LABEL
    =====================================
    */

    const getPaymentMethodLabel = method => {

        switch (method) {

            case "CASH":
                return "Cash";

            case "BANK_TRANSFER":
                return "Bank Transfer";

            case "CARD":
                return "Card";

            case "ONLINE":
                return "Online";

            default:
                return method || "—";

        }

    };


    /*
    =====================================
    OPEN RECEIPT MODAL
    =====================================
    */

    const handleOpenReceipt = receiptNumber => {

        if (!receiptNumber) {

            return;

        }

        setSelectedReceiptNumber(
            receiptNumber
        );

        setIsReceiptModalOpen(true);

    };


    /*
    =====================================
    CLOSE RECEIPT MODAL
    =====================================
    */

    const handleCloseReceipt = open => {

        setIsReceiptModalOpen(open);

        if (!open) {

            setSelectedReceiptNumber("");

        }

    };


    /*
    =====================================
    PRINT RECEIPT
    =====================================
    */

    const handlePrintReceipt = () => {

        window.print();

    };


    /*
    =====================================
    CLEAR FILTERS
    =====================================
    */

    const handleClearFilters = () => {

        setSessionId("");

        setTermId("");

        setClassId("");

        setPaymentMethod("");

        setDateFrom("");

        setDateTo("");

        setSearch("");

        toast.success(
            "Report filters cleared."
        );

    };


    /*
    =====================================
    PRINT REPORT
    =====================================
    */

    const handlePrint = () => {

        window.print();

    };


    /*
    =====================================
    LOADING
    =====================================
    */

    if (
        isSessionsLoading ||
        isTermsLoading ||
        isStudentsLoading
    ) {

        return (

            <Loading
                message="Loading payment reports..."
            />

        );

    }


    /*
    =====================================
    RENDER
    =====================================
    */

    return (

        <div className="space-y-6">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">

                <div>

                    <h1 className="text-2xl font-bold">

                        Payment Reports

                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">

                        View, filter and analyse
                        student payment records.

                    </p>

                </div>


                <Button
                    type="button"
                    onClick={handlePrint}
                >

                    Print Report

                </Button>

            </div>


            {/* =================================
                FILTERS
            ================================= */}

            <div className="rounded-xl border bg-background p-6 shadow-sm print:hidden">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-lg font-semibold">

                            Report Filters

                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">

                            Filter payments by session,
                            term, class, method or date.

                        </p>

                    </div>

                </div>


                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">


                    {/* SESSION */}

                    <div>

                        <label className="text-sm font-medium">

                            Academic Session

                        </label>

                        <select

                            value={sessionId}

                            onChange={event =>
                                setSessionId(
                                    event.target.value
                                )
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                All Sessions

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

                            disabled={
                                !sessionId
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                        >

                            <option value="">

                                All Terms

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


                    {/* CLASS */}

                    <div>

                        <label className="text-sm font-medium">

                            Class

                        </label>

                        <select

                            value={classId}

                            onChange={event =>
                                setClassId(
                                    event.target.value
                                )
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                All Classes

                            </option>


                            {classes.map(
                                schoolClass => (

                                    <option
                                        key={
                                            schoolClass.id
                                        }
                                        value={
                                            schoolClass.id
                                        }
                                    >

                                        {
                                            schoolClass.class_name
                                        }

                                    </option>

                                )
                            )}

                        </select>

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

                            <option value="">

                                All Methods

                            </option>

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


                    {/* DATE FROM */}

                    <div>

                        <label className="text-sm font-medium">

                            Date From

                        </label>

                        <input

                            type="date"

                            value={
                                dateFrom
                            }

                            onChange={event =>
                                setDateFrom(
                                    event.target.value
                                )
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        />

                    </div>


                    {/* DATE TO */}

                    <div>

                        <label className="text-sm font-medium">

                            Date To

                        </label>

                        <input

                            type="date"

                            value={
                                dateTo
                            }

                            onChange={event =>
                                setDateTo(
                                    event.target.value
                                )
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        />

                    </div>


                    {/* SEARCH */}

                    <div className="md:col-span-2 lg:col-span-2">

                        <label className="text-sm font-medium">

                            Search Student

                        </label>

                        <input

                            type="text"

                            value={search}

                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }

                            placeholder="Search by name or admission number"

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        />

                    </div>


                    {/* CLEAR */}

                    <div className="flex items-end">

                        <Button

                            type="button"

                            variant="outline"

                            onClick={
                                handleClearFilters
                            }

                            className="w-full"

                        >

                            Clear Filters

                        </Button>

                    </div>

                </div>

            </div>


            {/* =================================
                PRINT HEADER
            ================================= */}

            <div className="hidden print:block">

                <div className="text-center">

                    <h1 className="text-2xl font-bold">

                        EDUCORE

                    </h1>

                    <p className="text-sm">

                        Student Payment Report

                    </p>

                    <p className="mt-2 text-sm">

                        Generated:{" "}

                        {
                            new Date()
                                .toLocaleString(
                                    "en-NG"
                                )
                        }

                    </p>

                </div>

            </div>


            {/* =================================
                ERROR
            ================================= */}

            {isReportError && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">

                    <p className="font-semibold">

                        Failed to load payment report.

                    </p>

                    <p className="mt-1 text-sm">

                        {
                            reportError
                                ?.response
                                ?.data
                                ?.message ||
                            "Please try again."
                        }

                    </p>

                </div>

            )}


            {/* =================================
                REPORT LOADING
            ================================= */}

            {isReportLoading ? (

                <Loading
                    message="Generating payment report..."
                />

            ) : (

                <>


                    {/* =================================
                        SUMMARY CARDS
                    ================================= */}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


                        {/* TOTAL COLLECTED */}

                        <div className="rounded-xl border bg-background p-5 shadow-sm">

                            <p className="text-sm text-muted-foreground">

                                Total Collected

                            </p>

                            <p className="mt-2 text-2xl font-bold">

                                ₦
                                {
                                    formatCurrency(
                                        summary.total_amount
                                    )
                                }

                            </p>

                        </div>


                        {/* TRANSACTIONS */}

                        <div className="rounded-xl border bg-background p-5 shadow-sm">

                            <p className="text-sm text-muted-foreground">

                                Transactions

                            </p>

                            <p className="mt-2 text-2xl font-bold">

                                {
                                    Number(
                                        summary.transaction_count ||
                                        0
                                    ).toLocaleString()
                                }

                            </p>

                        </div>


                        {/* STUDENTS */}

                        <div className="rounded-xl border bg-background p-5 shadow-sm">

                            <p className="text-sm text-muted-foreground">

                                Students

                            </p>

                            <p className="mt-2 text-2xl font-bold">

                                {
                                    Number(
                                        summary.student_count ||
                                        0
                                    ).toLocaleString()
                                }

                            </p>

                        </div>


                        {/* AVERAGE */}

                        <div className="rounded-xl border bg-background p-5 shadow-sm">

                            <p className="text-sm text-muted-foreground">

                                Average Payment

                            </p>

                            <p className="mt-2 text-2xl font-bold">

                                ₦

                                {
                                    formatCurrency(

                                        Number(
                                            summary.transaction_count ||
                                            0
                                        ) > 0

                                            ?

                                            Number(
                                                summary.total_amount ||
                                                0
                                            ) /
                                            Number(
                                                summary.transaction_count
                                            )

                                            :

                                            0

                                    )
                                }

                            </p>

                        </div>

                    </div>


                    {/* =================================
                        PAYMENT METHOD BREAKDOWN
                    ================================= */}

                    <div className="rounded-xl border bg-background p-6 shadow-sm">

                        <div>

                            <h2 className="text-lg font-semibold">

                                Payment Method Breakdown

                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">

                                Total amount collected
                                through each payment method.

                            </p>

                        </div>


                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


                            {/* CASH */}

                            <div className="rounded-lg border p-4">

                                <p className="text-sm text-muted-foreground">

                                    Cash

                                </p>

                                <p className="mt-2 text-xl font-bold">

                                    ₦
                                    {
                                        formatCurrency(
                                            summary.cash_amount
                                        )
                                    }

                                </p>

                            </div>


                            {/* BANK TRANSFER */}

                            <div className="rounded-lg border p-4">

                                <p className="text-sm text-muted-foreground">

                                    Bank Transfer

                                </p>

                                <p className="mt-2 text-xl font-bold">

                                    ₦
                                    {
                                        formatCurrency(
                                            summary.transfer_amount
                                        )
                                    }

                                </p>

                            </div>


                            {/* CARD */}

                            <div className="rounded-lg border p-4">

                                <p className="text-sm text-muted-foreground">

                                    Card

                                </p>

                                <p className="mt-2 text-xl font-bold">

                                    ₦
                                    {
                                        formatCurrency(
                                            summary.card_amount
                                        )
                                    }

                                </p>

                            </div>


                            {/* ONLINE */}

                            <div className="rounded-lg border p-4">

                                <p className="text-sm text-muted-foreground">

                                    Online

                                </p>

                                <p className="mt-2 text-xl font-bold">

                                    ₦
                                    {
                                        formatCurrency(
                                            summary.online_amount
                                        )
                                    }

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        PAYMENT TABLE
                    ================================= */}

                    <div className="rounded-xl border bg-background shadow-sm">

                        <div className="border-b p-6">

                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold">

                                        Payment Transactions

                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">

                                        Detailed list of
                                        recorded payments.

                                    </p>

                                </div>

                                <p className="text-sm font-medium">

                                    {
                                        report.length
                                    }{" "}

                                    transaction
                                    {
                                        report.length === 1
                                            ? ""
                                            : "s"
                                    }

                                </p>

                            </div>

                        </div>


                        {report.length === 0 ? (

                            <div className="p-10 text-center text-muted-foreground">

                                No payment records found
                                for the selected filters.

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

                                                Student

                                            </th>

                                            <th className="px-4 py-3 text-left">

                                                Admission No.

                                            </th>

                                            <th className="px-4 py-3 text-left">

                                                Class

                                            </th>

                                            <th className="px-4 py-3 text-left">

                                                Session

                                            </th>

                                            <th className="px-4 py-3 text-left">

                                                Term

                                            </th>

                                            <th className="px-4 py-3 text-left">

                                                Method

                                            </th>

                                            <th className="px-4 py-3 text-right">

                                                Amount

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

                                        {report.map(
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


                                                    <td className="px-4 py-3 font-medium whitespace-nowrap">

                                                        {
                                                            payment.first_name
                                                        }{" "}

                                                        {
                                                            payment.surname
                                                        }

                                                    </td>


                                                    <td className="px-4 py-3 whitespace-nowrap">

                                                        {
                                                            payment.admission_number
                                                        }

                                                    </td>


                                                    <td className="px-4 py-3">

                                                        {
                                                            payment.class_name
                                                        }

                                                    </td>


                                                    <td className="px-4 py-3 whitespace-nowrap">

                                                        {
                                                            payment.session_name
                                                        }

                                                    </td>


                                                    <td className="px-4 py-3">

                                                        {
                                                            payment.term_name
                                                        }

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


                                                    {/* =================================
                                                        RECEIPT BUTTON
                                                    ================================= */}

                                                    <td className="px-4 py-3 whitespace-nowrap">

                                                        {payment.reference_number ? (

                                                            <button

                                                                type="button"

                                                                onClick={() =>
                                                                    handleOpenReceipt(
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
                                                            payment.received_by ||
                                                            "—"
                                                        }

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>


                                    {/* TABLE TOTAL */}

                                    <tfoot>

                                        <tr className="border-t bg-muted font-bold">

                                            <td
                                                colSpan="8"
                                                className="px-4 py-4 text-right"
                                            >

                                                Total

                                            </td>

                                            <td className="px-4 py-4 text-right">

                                                ₦
                                                {
                                                    formatCurrency(
                                                        summary.total_amount
                                                    )
                                                }

                                            </td>

                                            <td
                                                colSpan="2"
                                            />

                                        </tr>

                                    </tfoot>

                                </table>

                            </div>

                        )}

                    </div>

                </>

            )}


            {/* =============================================
                RECEIPT MODAL
            ============================================= */}

            <Dialog
                open={isReceiptModalOpen}
                onOpenChange={
                    handleCloseReceipt
                }
            >

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

                    <DialogHeader>

                        <DialogTitle>

                            Payment Receipt

                        </DialogTitle>

                    </DialogHeader>


                    {/* =================================
                        RECEIPT LOADING
                    ================================= */}

                    {isReceiptLoading && (

                        <div className="py-10">

                            <Loading
                                message="Loading receipt..."
                            />

                        </div>

                    )}


                    {/* =================================
                        RECEIPT ERROR
                    ================================= */}

                    {isReceiptError && (

                        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">

                            <p className="font-semibold">

                                Failed to load receipt.

                            </p>

                            <p className="mt-1 text-sm">

                                {
                                    receiptError
                                        ?.response
                                        ?.data
                                        ?.message ||
                                    "Unable to retrieve this receipt."
                                }

                            </p>

                        </div>

                    )}


                    {/* =================================
                        RECEIPT CONTENT
                    ================================= */}

                    {!isReceiptLoading &&
                    !isReceiptError &&
                    receipt && (

                        <div
                            id="payment-receipt"
                           className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl text-black"
                        >


                            {/* RECEIPT HEADER */}

                            <div className="border-b pb-5 text-center">

                                <h2 className="text-2xl font-bold">

                                    EDUCORE

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">

                                    Student Payment Receipt

                                </p>

                                <p className="mt-3 text-sm font-medium">

                                    Receipt No:{" "}

                                    <span className="font-bold">

                                        {
                                            receipt.reference_number
                                        }

                                    </span>

                                </p>

                            </div>


                            {/* STUDENT INFORMATION */}

                            <div className="grid gap-4 rounded-lg border p-5 sm:grid-cols-2">

                                <div>

                                    <p className="text-xs text-muted-foreground">

                                        Student Name

                                    </p>

                                    <p className="mt-1 font-semibold">

                                        {
                                            receipt.first_name
                                        }{" "}

                                        {
                                            receipt.surname
                                        }

                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-muted-foreground">

                                        Admission Number

                                    </p>

                                    <p className="mt-1 font-semibold">

                                        {
                                            receipt.admission_number
                                        }

                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-muted-foreground">

                                        Class

                                    </p>

                                    <p className="mt-1 font-semibold">

                                        {
                                            receipt.class_name
                                        }

                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-muted-foreground">

                                        Academic Session

                                    </p>

                                    <p className="mt-1 font-semibold">

                                        {
                                            receipt.session_name
                                        }

                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-muted-foreground">

                                        Term

                                    </p>

                                    <p className="mt-1 font-semibold">

                                        {
                                            receipt.term_name
                                        }

                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-muted-foreground">

                                        Payment Date

                                    </p>

                                    <p className="mt-1 font-semibold">

                                        {
                                            formatDate(
                                                receipt.payment_date
                                            )
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* PAYMENT INFORMATION */}

                            <div className="rounded-lg border">

                                <div className="border-b bg-muted px-5 py-3">

                                    <h3 className="font-semibold">

                                        Payment Information

                                    </h3>

                                </div>


                                <div className="space-y-4 p-5">

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">

                                            Amount Paid

                                        </span>

                                        <span className="text-xl font-bold">

                                            ₦
                                            {
                                                formatCurrency(
                                                    receipt.amount_paid
                                                )
                                            }

                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">

                                            Payment Method

                                        </span>

                                        <span className="font-medium">

                                            {
                                                getPaymentMethodLabel(
                                                    receipt.payment_method
                                                )
                                            }

                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">

                                            Receipt Number

                                        </span>

                                        <span className="font-medium">

                                            {
                                                receipt.reference_number
                                            }

                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">

                                            Received By

                                        </span>

                                        <span className="font-medium">

                                            {
                                                receipt.received_by ||
                                                "—"
                                            }

                                        </span>

                                    </div>


                                    <div>

                                        <p className="text-muted-foreground">

                                            Remarks

                                        </p>

                                        <p className="mt-1 font-medium">

                                            {
                                                receipt.remarks ||
                                                "—"
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* RECEIPT FOOTER */}

                            <div className="border-t pt-5 text-center">

                                <p className="text-sm text-muted-foreground">

                                    Thank you for your payment.

                                </p>

                            </div>


                            {/* RECEIPT ACTIONS */}

                            <div className="flex justify-end gap-3 print:hidden">

                                <Button

                                    type="button"

                                    variant="outline"

                                    onClick={() =>
                                        setIsReceiptModalOpen(
                                            false
                                        )
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

                    )}

                </DialogContent>

            </Dialog>

        </div>

    );

}


export default PaymentReportsPage;