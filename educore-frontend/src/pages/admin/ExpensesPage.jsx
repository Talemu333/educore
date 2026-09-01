import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
    createExpense,
    deleteExpense,
    getExpenseCategorySummary,
    getExpenses,
    getExpenseSummary,
    updateExpense
} from "@/services/expenseService";

const PAYMENT_METHODS = [
    "Cash",
    "Bank Transfer",
    "POS",
    "Cheque",
    "Other"
];

const CATEGORIES = [
    "Salaries",
    "Utilities",
    "Repairs & Maintenance",
    "Teaching Materials",
    "Office Supplies",
    "Transportation",
    "Rent",
    "Security",
    "Cleaning",
    "Events",
    "Other"
];

const emptyForm = {
    expense_date: new Date().toISOString().slice(0, 10),
    category: "",
    description: "",
    amount: "",
    payment_method: "Cash",
    payee: "",
    reference_number: "",
    notes: ""
};

const formatCurrency = (value) => new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
}).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({});
    const [categorySummary, setCategorySummary] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (category) params.category = category;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const [expenseRows, expenseSummary, categories] = await Promise.all([
                getExpenses(params),
                getExpenseSummary(),
                getExpenseCategorySummary()
            ]);

            setExpenses(expenseRows || []);
            setSummary(expenseSummary || {});
            setCategorySummary(categories || []);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Unable to load expenses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [search, category, dateFrom, dateTo]);

    const totalVisible = useMemo(
        () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses]
    );

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const openEdit = (expense) => {
        setEditingId(expense.id);
        setForm({
            expense_date: expense.expense_date?.slice(0, 10) || "",
            category: expense.category || "",
            description: expense.description || "",
            amount: expense.amount || "",
            payment_method: expense.payment_method || "Cash",
            payee: expense.payee || "",
            reference_number: expense.reference_number || "",
            notes: expense.notes || ""
        });
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm(current => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (editingId) {
                await updateExpense(editingId, form);
                setSuccess("Expense updated successfully.");
            } else {
                await createExpense(form);
                setSuccess("Expense recorded successfully.");
            }

            setShowForm(false);
            setForm({ ...emptyForm });
            setEditingId(null);
            await loadData();
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Unable to save expense.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this expense record? This action cannot be undone.")) return;

        try {
            setError("");
            await deleteExpense(id);
            setSuccess("Expense deleted successfully.");
            await loadData();
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Unable to delete expense.");
        }
    };

    return (
        <div className="w-full min-w-0 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Expenses</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Track and monitor your school&apos;s expenses.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Record Expense
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Expense Records</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total_count || 0}</p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <p className="text-sm text-red-700">Total Expenses</p>
                    <p className="mt-2 text-2xl font-bold text-red-800">{formatCurrency(summary.total_amount)}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <p className="text-sm text-amber-700">This Month</p>
                    <p className="mt-2 text-2xl font-bold text-amber-800">{formatCurrency(summary.monthly_amount)}</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-sm text-blue-700">This Year</p>
                    <p className="mt-2 text-2xl font-bold text-blue-800">{formatCurrency(summary.yearly_amount)}</p>
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <label className="md:col-span-2">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Description, payee or reference..."
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </label>

                    <label>
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All categories</option>
                            {CATEGORIES.map(item => <option key={item}>{item}</option>)}
                        </select>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        <label>
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">From</span>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">To</span>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                        </label>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-5 sm:px-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Expense Records</h2>
                            <p className="mt-1 text-sm text-slate-500">Visible total: {formatCurrency(totalVisible)}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-sm text-slate-500">Loading expenses...</div>
                    ) : expenses.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">No expense records found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Payee</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.map(expense => (
                                        <tr key={expense.id} className="hover:bg-slate-50">
                                            <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDate(expense.expense_date)}</td>
                                            <td className="px-4 py-4 font-medium text-slate-700">{expense.category}</td>
                                            <td className="max-w-xs px-4 py-4 text-slate-600">{expense.description}</td>
                                            <td className="px-4 py-4 text-slate-600">{expense.payee || "-"}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-900">{formatCurrency(expense.amount)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right">
                                                <button type="button" onClick={() => openEdit(expense)} className="mr-2 rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => handleDelete(expense.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">By Category</h2>
                    <p className="mt-1 text-sm text-slate-500">How school expenses are distributed.</p>
                    <div className="mt-5 space-y-3">
                        {categorySummary.length === 0 ? (
                            <p className="text-sm text-slate-400">No expense data yet.</p>
                        ) : categorySummary.map(item => (
                            <div key={item.category} className="rounded-xl bg-slate-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="truncate text-sm font-medium text-slate-700">{item.category}</span>
                                    <span className="shrink-0 text-sm font-bold text-slate-900">{formatCurrency(item.total)}</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{item.count} record(s)</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Expense" : "Record Expense"}</h2>
                                <p className="mt-1 text-xs text-slate-500">Record a school expense against the current school account.</p>
                            </div>
                            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label>
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Expense Date</span>
                                    <input required type="date" name="expense_date" value={form.expense_date} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
                                    <select required name="category" value={form.category} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(item => <option key={item}>{item}</option>)}
                                    </select>
                                </label>
                                <label className="sm:col-span-2">
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
                                    <input required name="description" value={form.description} onChange={handleChange} placeholder="e.g. Electricity bill for August" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Amount (₦)</span>
                                    <input required min="0.01" step="0.01" type="number" name="amount" value={form.amount} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Payment Method</span>
                                    <select name="payment_method" value={form.payment_method} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                                        {PAYMENT_METHODS.map(item => <option key={item}>{item}</option>)}
                                    </select>
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Payee / Vendor</span>
                                    <input name="payee" value={form.payee} onChange={handleChange} placeholder="Optional" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Reference Number</span>
                                    <input name="reference_number" value={form.reference_number} onChange={handleChange} placeholder="Receipt / transfer reference" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                                </label>
                                <label className="sm:col-span-2">
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Notes</span>
                                    <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Optional notes" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                                </label>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button disabled={saving} type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                                    {saving ? "Saving..." : editingId ? "Update Expense" : "Save Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpensesPage;
