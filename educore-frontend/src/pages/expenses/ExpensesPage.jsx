import { useMemo, useState } from "react";
import {
    CalendarDays,
    Edit3,
    FileText,
    Plus,
    Receipt,
    Search,
    Trash2,
    WalletCards,
    X
} from "lucide-react";
import toast from "react-hot-toast";

import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import {
    useCreateExpense,
    useDeleteExpense,
    useExpenses,
    useExpenseSummary,
    useUpdateExpense
} from "@/hooks/useExpenses";

const CATEGORY_OPTIONS = [
    "Salaries & Wages", "Utilities", "Electricity", "Water", "Internet",
    "Teaching Materials", "Stationery", "Repairs & Maintenance", "Transportation",
    "Security", "Cleaning", "Fuel", "Rent", "Events & Activities",
    "Food & Catering", "Equipment", "Other"
];

const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CARD", label: "Card / POS" },
    { value: "ONLINE", label: "Online Payment" }
];

const emptyForm = () => ({
    expense_date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: "",
    payment_method: "CASH",
    vendor: "",
    reference_number: "",
    notes: ""
});

const formatMoney = value =>
    `₦${Number(value || 0).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

// PostgreSQL DATE values may arrive as either YYYY-MM-DD or an ISO timestamp.
// Normalize to YYYY-MM-DD before creating the Date object so we never produce
// an invalid value such as "2026-09-04T00:00:00T00:00:00".
const formatDate = value => {
    if (!value) return "—";

    const datePart = String(value).split("T")[0];
    const date = new Date(`${datePart}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const paymentMethodLabel = value =>
    PAYMENT_METHODS.find(item => item.value === value)?.label || value || "—";

function ExpensesPage() {
    const [filters, setFilters] = useState({
        dateFrom: "", dateTo: "", category: "", paymentMethod: "", search: ""
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const expenseFilters = useMemo(() => filters, [filters]);
    const summaryFilters = useMemo(() => ({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        category: filters.category,
        paymentMethod: filters.paymentMethod
    }), [filters.dateFrom, filters.dateTo, filters.category, filters.paymentMethod]);

    const { data: expenses = [], isLoading, isError } = useExpenses(expenseFilters);
    const { data: summary, isLoading: isSummaryLoading } = useExpenseSummary(summaryFilters);

    const createMutation = useCreateExpense();
    const updateMutation = useUpdateExpense();
    const deleteMutation = useDeleteExpense();
    const isSaving = createMutation.isPending || updateMutation.isPending;

    const openCreateForm = () => {
        setEditingExpense(null);
        setForm(emptyForm());
        setIsFormOpen(true);
    };

    const openEditForm = expense => {
        setEditingExpense(expense);
        setForm({
            expense_date: expense.expense_date ? String(expense.expense_date).split("T")[0] : "",
            category: expense.category || "",
            description: expense.description || "",
            amount: expense.amount || "",
            payment_method: expense.payment_method || "CASH",
            vendor: expense.vendor || "",
            reference_number: expense.reference_number || "",
            notes: expense.notes || ""
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        if (isSaving) return;
        setIsFormOpen(false);
        setEditingExpense(null);
        setForm(emptyForm());
    };

    const updateField = (field, value) => {
        setForm(current => ({ ...current, [field]: value }));
    };

    const handleSubmit = event => {
        event.preventDefault();

        if (!form.expense_date) return toast.error("Please select the expense date.");
        if (!form.category.trim()) return toast.error("Please enter an expense category.");
        if (!form.description.trim()) return toast.error("Please enter a description.");

        const amount = Number(form.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return toast.error("Expense amount must be greater than zero.");
        }

        const data = {
            expense_date: form.expense_date,
            category: form.category.trim(),
            description: form.description.trim(),
            amount,
            payment_method: form.payment_method,
            vendor: form.vendor.trim() || null,
            reference_number: form.reference_number.trim() || null,
            notes: form.notes.trim() || null
        };

        const options = {
            onSuccess: () => {
                toast.success(editingExpense ? "Expense updated successfully." : "Expense recorded successfully.");
                closeForm();
            },
            onError: error => toast.error(error.response?.data?.message || "Unable to save expense.")
        };

        if (editingExpense) {
            updateMutation.mutate({ id: editingExpense.id, data }, options);
        } else {
            createMutation.mutate(data, options);
        }
    };

    const handleDelete = expense => {
        if (!window.confirm(`Delete this expense of ${formatMoney(expense.amount)}? This action cannot be undone.`)) return;

        deleteMutation.mutate(expense.id, {
            onSuccess: () => toast.success("Expense deleted successfully."),
            onError: error => toast.error(error.response?.data?.message || "Unable to delete expense.")
        });
    };

    const clearFilters = () => setFilters({
        dateFrom: "", dateTo: "", category: "", paymentMethod: "", search: ""
    });

    if (isLoading || isSummaryLoading) return <Loading message="Loading expense records..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Expenses"
                description="Record, review and manage your school's operating expenses."
                action={<button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Plus className="h-4 w-4" />Record Expense</button>}
            />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="app-surface p-5"><div className="flex items-center justify-between"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><WalletCards className="h-5 w-5" /></div><span className="text-xs font-medium text-slate-400">Selected period</span></div><p className="mt-4 text-sm font-medium text-slate-500">Total Expenses</p><p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(summary?.total_amount)}</p></div>
                <div className="app-surface p-5"><div className="flex items-center justify-between"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><Receipt className="h-5 w-5" /></div></div><p className="mt-4 text-sm font-medium text-slate-500">Transactions</p><p className="mt-1 text-2xl font-bold text-slate-900">{Number(summary?.transaction_count || 0).toLocaleString()}</p></div>
                <div className="app-surface p-5"><div className="flex items-center justify-between"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><FileText className="h-5 w-5" /></div></div><p className="mt-4 text-sm font-medium text-slate-500">Average Expense</p><p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(summary?.average_amount)}</p></div>
                <div className="app-surface p-5"><div className="flex items-center justify-between"><div className="rounded-xl bg-red-50 p-2.5 text-red-600"><Receipt className="h-5 w-5" /></div></div><p className="mt-4 text-sm font-medium text-slate-500">Highest Expense</p><p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(summary?.highest_amount)}</p></div>
            </section>

            <section className="app-surface p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="xl:col-span-2"><label className="mb-1.5 block text-sm font-medium text-slate-700">Search</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={filters.search} onChange={event => setFilters(current => ({ ...current, search: event.target.value }))} placeholder="Description, vendor or reference..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label><select value={filters.category} onChange={event => setFilters(current => ({ ...current, category: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">All categories</option>{CATEGORY_OPTIONS.map(category => <option key={category} value={category}>{category}</option>)}</select></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label><select value={filters.paymentMethod} onChange={event => setFilters(current => ({ ...current, paymentMethod: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">All methods</option>{PAYMENT_METHODS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</select></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Date From</label><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="date" value={filters.dateFrom} onChange={event => setFilters(current => ({ ...current, dateFrom: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Date To</label><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="date" value={filters.dateTo} onChange={event => setFilters(current => ({ ...current, dateTo: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>
                </div>
                <div className="mt-4 flex justify-end"><button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"><X className="h-4 w-4" />Clear Filters</button></div>
            </section>

            <section className="app-surface overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-semibold text-slate-900">Expense Records</h2><p className="mt-1 text-sm text-slate-500">{expenses.length} record{expenses.length === 1 ? "" : "s"} found</p></div></div>
                {isError ? <div className="p-8 text-center text-sm text-red-600">Unable to load expense records. Please try again.</div> : expenses.length === 0 ? <div className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Receipt className="h-6 w-6" /></div><h3 className="mt-4 text-sm font-semibold text-slate-900">No expenses found</h3><p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Record your school's first expense or adjust the filters above.</p><button type="button" onClick={openCreateForm} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" />Record Expense</button></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</th><th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Method</th><th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{expenses.map(expense => <tr key={expense.id} className="transition hover:bg-slate-50/80"><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(expense.expense_date)}</td><td className="px-5 py-4 text-sm font-medium text-slate-800">{expense.category}</td><td className="max-w-xs px-5 py-4 text-sm text-slate-700"><div className="truncate" title={expense.description}>{expense.description}</div>{expense.reference_number && <div className="mt-1 text-xs text-slate-400">Ref: {expense.reference_number}</div>}</td><td className="px-5 py-4 text-sm text-slate-600">{expense.vendor || "—"}</td><td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-900">{formatMoney(expense.amount)}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{paymentMethodLabel(expense.payment_method)}</td><td className="whitespace-nowrap px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEditForm(expense)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Edit expense"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(expense)} disabled={deleteMutation.isPending} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50" title="Delete expense"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}
            </section>

            {isFormOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-semibold text-slate-900">{editingExpense ? "Edit Expense" : "Record Expense"}</h2><p className="mt-1 text-sm text-slate-500">Enter the expense details below.</p></div><button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close"><X className="h-5 w-5" /></button></div><form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Expense Date *</label><input type="date" value={form.expense_date} onChange={event => updateField("expense_date", event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Category *</label><select value={form.category} onChange={event => updateField("category", event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">Select category</option>{CATEGORY_OPTIONS.map(category => <option key={category} value={category}>{category}</option>)}</select></div></div><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Description *</label><input value={form.description} onChange={event => updateField("description", event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Amount *</label><input type="number" min="0.01" step="0.01" value={form.amount} onChange={event => updateField("amount", event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label><select value={form.payment_method} onChange={event => updateField("payment_method", event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{PAYMENT_METHODS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</select></div></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Vendor</label><input value={form.vendor} onChange={event => updateField("vendor", event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Reference Number</label><input value={form.reference_number} onChange={event => updateField("reference_number", event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div><div><label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label><textarea rows="3" value={form.notes} onChange={event => updateField("notes", event.target.value)} className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={closeForm} disabled={isSaving} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Saving..." : editingExpense ? "Update Expense" : "Save Expense"}</button></div></form></div></div>}
        </div>
    );
}

export default ExpensesPage;
