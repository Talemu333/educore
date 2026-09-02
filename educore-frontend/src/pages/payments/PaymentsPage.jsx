import { useEffect, useState } from "react";
import { CreditCard, FileText, Receipt, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import toast from "react-hot-toast";
import { useStudents } from "@/hooks/useStudents";
import { useSessions } from "@/hooks/useSessions";
import { useTerms } from "@/hooks/useTerms";
import {
    useStudentFinancialSummary,
    useStudentPayments,
    useCreatePayment,
    useReceipt
} from "@/hooks/usePayments";

function formatMoney(value) {
    return `₦${Number(value || 0).toLocaleString()}`;
}

function paymentMethodLabel(method) {
    const labels = {
        CASH: "Cash",
        BANK_TRANSFER: "Bank Transfer",
        CARD: "Card",
        ONLINE: "Online Payment"
    };

    return labels[method] || method || "—";
}

function statusClasses(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("paid")) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    if (value.includes("partial")) {
        return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    return "bg-red-50 text-red-700 ring-red-200";
}

function PaymentsPage() {
    const [studentId, setStudentId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [termId, setTermId] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [remarks, setRemarks] = useState("");
    const [selectedReceiptNumber, setSelectedReceiptNumber] = useState("");

    const {
        data: receipt,
        isLoading: isReceiptLoading,
        isError: isReceiptError
    } = useReceipt(selectedReceiptNumber);

    const {
        data: studentsResponse,
        isLoading: isStudentsLoading
    } = useStudents("", 1, 1000);

    const students = studentsResponse?.data || [];

    const {
        data: sessions = [],
        isLoading: isSessionsLoading
    } = useSessions();

    const {
        data: terms = [],
        isLoading: isTermsLoading
    } = useTerms();

    const filteredTerms = terms.filter(
        term => String(term.session_id) === String(sessionId)
    );

    const {
        data: financialSummary,
        isLoading: isFinancialSummaryLoading,
        isError: isFinancialSummaryError
    } = useStudentFinancialSummary(studentId, sessionId, termId);

    const {
        data: payments = [],
        isLoading: isPaymentsLoading
    } = useStudentPayments(studentId, sessionId, termId);

    const {
        mutate: createPaymentMutation,
        isPending: isSaving
    } = useCreatePayment();

    useEffect(() => {
        setAmountPaid("");
        setRemarks("");
    }, [studentId, sessionId, termId]);

    const handleRecordPayment = () => {
        if (!studentId) {
            toast.error("Please select a student.");
            return;
        }

        if (!sessionId) {
            toast.error("Please select an academic session.");
            return;
        }

        if (!termId) {
            toast.error("Please select a term.");
            return;
        }

        if (!amountPaid) {
            toast.error("Please enter the payment amount.");
            return;
        }

        const amount = Number(amountPaid);

        if (Number.isNaN(amount) || amount <= 0) {
            toast.error("Payment amount must be greater than zero.");
            return;
        }

        if (
            financialSummary &&
            amount > Number(financialSummary.balance)
        ) {
            toast.error(
                `Payment exceeds outstanding balance of ${formatMoney(financialSummary.balance)}.`
            );
            return;
        }

        const data = {
            student_id: Number(studentId),
            session_id: Number(sessionId),
            term_id: Number(termId),
            amount_paid: amount,
            payment_date: paymentDate,
            payment_method: paymentMethod,
            remarks: remarks.trim() || null
        };

        createPaymentMutation(data, {
            onSuccess: () => {
                toast.success("Payment recorded successfully.");
                setAmountPaid("");
                setRemarks("");
            },
            onError: error => {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to record payment."
                );
            }
        });
    };

    if (isStudentsLoading || isSessionsLoading || isTermsLoading) {
        return <Loading message="Loading payment information..." />;
    }

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #print-receipt, #print-receipt * { visibility: visible !important; }
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
                    #print-receipt .no-print { display: none !important; }
                    @page { size: A4; margin: 15mm; }
                }
            `}</style>

            <div className="space-y-6">
                <PageHeader
                    title="Payments"
                    description="Record, review and manage student school fee payments."
                    action={
                        studentId && sessionId && termId ? (
                            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 sm:flex">
                                <CreditCard className="h-4 w-4" />
                                Current payment record
                            </div>
                        ) : null
                    }
                />

                <section className="app-surface overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-6">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-white p-2.5 text-slate-700 shadow-sm ring-1 ring-slate-200">
                                <WalletCards className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Payment Details
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Select the student, academic session and term to view the account.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <div className="grid gap-5 md:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Student
                                </label>
                                <select
                                    value={studentId}
                                    onChange={event => setStudentId(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">Select Student</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.first_name} {student.surname} — {student.admission_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Academic Session
                                </label>
                                <select
                                    value={sessionId}
                                    onChange={event => {
                                        setSessionId(event.target.value);
                                        setTermId("");
                                    }}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">Select Session</option>
                                    {sessions.map(session => (
                                        <option key={session.id} value={session.id}>
                                            {session.session_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Term
                                </label>
                                <select
                                    value={termId}
                                    onChange={event => setTermId(event.target.value)}
                                    disabled={!sessionId}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">
                                        {!sessionId ? "Select session first" : "Select Term"}
                                    </option>
                                    {filteredTerms.map(term => (
                                        <option key={term.id} value={term.id}>
                                            {term.term_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {studentId && sessionId && termId && (
                    <>
                        {isFinancialSummaryLoading ? (
                            <Loading message="Loading financial summary..." />
                        ) : isFinancialSummaryError ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                Failed to load financial summary.
                            </div>
                        ) : financialSummary ? (
                            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="app-surface p-5">
                                    <p className="text-sm font-medium text-slate-500">Total Fees</p>
                                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        {formatMoney(financialSummary.totalFees)}
                                    </p>
                                </div>

                                <div className="app-surface p-5">
                                    <p className="text-sm font-medium text-slate-500">Total Paid</p>
                                    <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                                        {formatMoney(financialSummary.totalPaid)}
                                    </p>
                                </div>

                                <div className="app-surface p-5">
                                    <p className="text-sm font-medium text-slate-500">Outstanding Balance</p>
                                    <p className="mt-2 text-2xl font-bold tracking-tight text-rose-600">
                                        {formatMoney(financialSummary.balance)}
                                    </p>
                                </div>

                                <div className="app-surface p-5">
                                    <p className="text-sm font-medium text-slate-500">Payment Status</p>
                                    <span className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${statusClasses(financialSummary.status)}`}>
                                        {financialSummary.status || "Pending"}
                                    </span>
                                </div>
                            </section>
                        ) : null}

                        {financialSummary && Number(financialSummary.balance) > 0 && (
                            <section className="app-surface overflow-hidden">
                                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">Record Payment</h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Enter the amount received and payment details.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                Amount Paid
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">₦</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={amountPaid}
                                                    onChange={event => setAmountPaid(event.target.value)}
                                                    placeholder="Enter amount"
                                                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                Payment Method
                                            </label>
                                            <select
                                                value={paymentMethod}
                                                onChange={event => setPaymentMethod(event.target.value)}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                            >
                                                <option value="CASH">Cash</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="CARD">Card</option>
                                                <option value="ONLINE">Online Payment</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                Payment Date
                                            </label>
                                            <input
                                                type="date"
                                                value={paymentDate}
                                                onChange={event => setPaymentDate(event.target.value)}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                Remarks
                                            </label>
                                            <input
                                                type="text"
                                                value={remarks}
                                                onChange={event => setRemarks(event.target.value)}
                                                placeholder="Optional"
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-sm text-slate-500">
                                            Outstanding balance: <span className="font-semibold text-slate-800">{formatMoney(financialSummary.balance)}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleRecordPayment}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto"
                                        >
                                            {isSaving ? "Recording..." : "Record Payment"}
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {financialSummary && Number(financialSummary.balance) === 0 && (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
                                <Receipt className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Fees fully paid</p>
                                    <p className="mt-1 text-sm text-emerald-700">
                                        This student's fees have been fully paid for the selected term.
                                    </p>
                                </div>
                            </div>
                        )}

                        <section className="app-surface overflow-hidden">
                            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
                                            <p className="mt-1 text-sm text-slate-500">Previous payments for this student and term.</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">
                                        {payments.length} transaction{payments.length === 1 ? "" : "s"}
                                    </span>
                                </div>
                            </div>

                            {isPaymentsLoading ? (
                                <Loading message="Loading payment history..." />
                            ) : payments.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <p className="mt-4 font-medium text-slate-800">No payments recorded</p>
                                    <p className="mt-1 text-sm text-slate-500">No payments have been recorded for this term.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold">S/N</th>
                                                <th className="px-5 py-3 text-left font-semibold">Date</th>
                                                <th className="px-5 py-3 text-left font-semibold">Amount</th>
                                                <th className="px-5 py-3 text-left font-semibold">Method</th>
                                                <th className="px-5 py-3 text-left font-semibold">Receipt</th>
                                                <th className="px-5 py-3 text-left font-semibold">Received By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {payments.map((payment, index) => (
                                                <tr key={payment.id} className="transition hover:bg-slate-50/80">
                                                    <td className="px-5 py-4 text-slate-500">{index + 1}</td>
                                                    <td className="px-5 py-4 text-slate-700">
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-4 font-semibold text-slate-900">
                                                        {formatMoney(payment.amount_paid)}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        {paymentMethodLabel(payment.payment_method)}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs text-slate-600">
                                                                {payment.reference_number || "—"}
                                                            </span>
                                                            {payment.reference_number && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setSelectedReceiptNumber(payment.reference_number)}
                                                                >
                                                                    View
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        {payment.received_by || "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>

            {selectedReceiptNumber && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div
                        id="print-receipt"
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
                    >
                        <div className="no-print mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Payment document</p>
                                <h2 className="text-xl font-bold">Payment Receipt</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReceiptNumber("")}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                Close
                            </button>
                        </div>

                        {isReceiptLoading ? (
                            <div className="py-12 text-center text-sm text-slate-500">Loading receipt...</div>
                        ) : isReceiptError ? (
                            <div className="py-12 text-center text-sm text-red-600">Failed to load receipt.</div>
                        ) : receipt ? (
                            <div className="space-y-7">
                                <div className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                                        <Receipt className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-2xl font-bold tracking-tight">EDUCORE</h3>
                                    <p className="mt-1 text-sm text-slate-500">School Payment Receipt</p>
                                </div>

                                <div className="grid gap-x-8 gap-y-5 border-y border-slate-200 py-6 sm:grid-cols-2">
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Receipt Number</p><p className="mt-1 font-semibold">{receipt.reference_number}</p></div>
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Payment Date</p><p className="mt-1 font-semibold">{new Date(receipt.payment_date).toLocaleDateString()}</p></div>
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Student</p><p className="mt-1 font-semibold">{receipt.first_name} {receipt.surname}</p></div>
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Admission Number</p><p className="mt-1 font-semibold">{receipt.admission_number}</p></div>
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Class</p><p className="mt-1 font-semibold">{receipt.class_name}</p></div>
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Academic Session</p><p className="mt-1 font-semibold">{receipt.session_name}</p></div>
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Term</p><p className="mt-1 font-semibold">{receipt.term_name}</p></div>
                                    <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Payment Method</p><p className="mt-1 font-semibold">{paymentMethodLabel(receipt.payment_method)}</p></div>
                                </div>

                                <div className="rounded-2xl bg-slate-50 px-5 py-6 text-center ring-1 ring-slate-200">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount Paid</p>
                                    <p className="mt-2 text-3xl font-bold tracking-tight">{formatMoney(receipt.amount_paid)}</p>
                                </div>

                                {receipt.remarks && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Remarks</p>
                                        <p className="mt-1 text-sm font-medium text-slate-700">{receipt.remarks}</p>
                                    </div>
                                )}

                                <div className="border-t border-slate-200 pt-4 text-sm text-slate-500">
                                    Received by: <span className="font-semibold text-slate-900">{receipt.received_by || "—"}</span>
                                </div>

                                <div className="no-print flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelectedReceiptNumber("")}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => window.print()}
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

export default PaymentsPage;
