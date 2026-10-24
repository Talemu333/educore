import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Plus, RefreshCw, School, Wallet } from "lucide-react";
import { getPlatformBillingOverview, createPlatformSubscription, recordPlatformPayment } from "@/services/platformBillingService";

const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value || 0));
const today = () => new Date().toISOString().slice(0, 10);
const rateForCount = (count) => count <= 100 ? 1000 : count <= 300 ? 800 : count <= 600 ? 700 : null;
const planForCount = (count) => count <= 100 ? "EduProw Starter (1–100)" : count <= 300 ? "EduProw Standard (101–300)" : count <= 600 ? "EduProw Growth (301–600)" : "Custom (601+)";

const emptySubscription = { school_id: "", student_count: "", billing_period: "", start_date: today(), due_date: "", notes: "" };
const emptyPayment = { subscription_id: "", amount: "", payment_date: today(), payment_method: "bank_transfer", reference: "", notes: "" };

function Field({ label, children }) {
    return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary";
const textClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary";

export default function PlatformBillingPage() {
    const [data, setData] = useState({ schools: [], subscriptions: [], payments: [] });
    const [loading, setLoading] = useState(true);
    const [savingSubscription, setSavingSubscription] = useState(false);
    const [savingPayment, setSavingPayment] = useState(false);
    const [subscription, setSubscription] = useState(emptySubscription);
    const [customRate, setCustomRate] = useState("");
    const [payment, setPayment] = useState(emptyPayment);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("subscriptions");

    const load = async () => {
        setLoading(true); setError("");
        try {
            const response = await getPlatformBillingOverview();
            setData(response?.data || { schools: [], subscriptions: [], payments: [] });
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load platform billing records.");
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const count = Number(subscription.student_count || 0);
    const rate = count > 600 ? (customRate !== "" && Number.isFinite(Number(customRate)) && Number(customRate) >= 0 ? Number(customRate) : null) : count > 0 ? rateForCount(count) : null;
    const estimatedAmount = rate === null ? "" : count * rate;
    const selectedSubscription = data.subscriptions.find(item => String(item.id) === String(payment.subscription_id));
    const selectedBalance = selectedSubscription ? Number(selectedSubscription.balance) : 0;

    const stats = useMemo(() => ({
        schools: data.schools.length,
        subscriptions: data.subscriptions.length,
        received: data.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        outstanding: data.subscriptions.reduce((sum, item) => sum + Number(item.balance || 0), 0)
    }), [data]);

    const submitSubscription = async (event) => {
        event.preventDefault(); setError(""); setNotice("");
        if (count < 1) return setError("Enter a valid student population.");
        if (rate === null) return setError("For schools with more than 600 students, agree a custom rate before saving the subscription.");
        if (!subscription.school_id || !subscription.billing_period.trim()) return setError("Select a school and enter the billing period.");
        setSavingSubscription(true);
        try {
            await createPlatformSubscription({
                school_id: Number(subscription.school_id),
                plan_name: planForCount(count),
                student_count: count,
                rate_per_student: rate,
                amount_due: estimatedAmount,
                billing_period: subscription.billing_period.trim(),
                start_date: subscription.start_date || null,
                due_date: subscription.due_date || null,
                notes: subscription.notes.trim()
            });
            setSubscription(emptySubscription);
            setCustomRate("");
            setNotice("School subscription recorded.");
            await load();
        } catch (err) { setError(err.response?.data?.message || "Unable to save the subscription."); }
        finally { setSavingSubscription(false); }
    };

    const submitPayment = async (event) => {
        event.preventDefault(); setError(""); setNotice("");
        if (!payment.subscription_id) return setError("Select a subscription.");
        if (Number(payment.amount) <= 0) return setError("Enter a payment amount greater than zero.");
        if (Number(payment.amount) > selectedBalance) return setError("Payment cannot exceed the outstanding balance.");
        setSavingPayment(true);
        try {
            await recordPlatformPayment({ ...payment, subscription_id: Number(payment.subscription_id), amount: Number(payment.amount) });
            setPayment(emptyPayment);
            setNotice("Payment recorded successfully.");
            await load();
        } catch (err) { setError(err.response?.data?.message || "Unable to record payment."); }
        finally { setSavingPayment(false); }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium text-primary">Platform administration</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">School Subscriptions & Payments</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage EduProw plans, record school payments and track outstanding balances. These are platform payments, separate from student school fees.</p></div>
                <button type="button" onClick={load} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"><RefreshCw className="h-4 w-4" /> Refresh</button>
            </header>

            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="mr-2 inline h-4 w-4" />{notice}</div>}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "Schools in platform", value: stats.schools, icon: School },
                    { label: "Subscriptions recorded", value: stats.subscriptions, icon: CreditCard },
                    { label: "Payments recorded", value: money(stats.received), icon: Wallet },
                    { label: "Outstanding balances", value: money(stats.outstanding), icon: CreditCard }
                ].map((item) => <div key={item.label} className="rounded-xl border bg-background p-4 shadow-sm"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>{item.label}</span><item.icon className="h-4 w-4" /></div><p className="mt-3 text-xl font-semibold">{item.value}</p></div>)}
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <form onSubmit={submitSubscription} className="space-y-4 rounded-xl border bg-background p-4 shadow-sm sm:p-5">
                    <div><h2 className="text-lg font-semibold">Assign subscription plan</h2><p className="mt-1 text-sm text-muted-foreground">The standard rate is calculated automatically from the student-count band.</p></div>
                    <Field label="School">
                        <select required value={subscription.school_id} onChange={e => setSubscription(v => ({ ...v, school_id: e.target.value }))} className={inputClass}>
                            <option value="">Select a school</option>{data.schools.map(s => <option key={s.school_id} value={s.school_id}>{s.school_name}</option>)}
                        </select>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Total student population">
                            <input required type="number" min="1" step="1" value={subscription.student_count} onChange={e => setSubscription(v => ({ ...v, student_count: e.target.value }))} className={inputClass} placeholder="e.g. 150" />
                        </Field>
                        <Field label="Plan">
                            <input readOnly value={count > 0 ? planForCount(count) : ""} className={inputClass + " bg-muted"} placeholder="Calculated from student count" />
                        </Field>
                        <Field label="Rate per student / term">
                            <input type={count > 600 ? "number" : "text"} min={count > 600 ? "0" : undefined} step={count > 600 ? "0.01" : undefined} readOnly={count <= 600} value={count > 600 ? customRate : (rate === null ? "" : money(rate))} onChange={count > 600 ? e => setCustomRate(e.target.value) : undefined} className={inputClass + (count > 600 ? "" : " bg-muted")} placeholder={count > 600 ? "Enter agreed custom rate" : ""} />
                        </Field>
                        <Field label="Subscription amount (₦)">
                            <input readOnly value={estimatedAmount === "" ? "" : estimatedAmount} className={inputClass + " bg-muted"} placeholder="Calculated automatically" />
                        </Field>
                    </div>
                    {count > 600 && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Enter the agreed custom rate per student per term. The subscription total will be calculated automatically.</p>}
                    <Field label="Billing period / term">
                        <input required value={subscription.billing_period} onChange={e => setSubscription(v => ({ ...v, billing_period: e.target.value }))} className={inputClass} placeholder="e.g. 2026/2027 — First Term" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Start date"><input type="date" value={subscription.start_date} onChange={e => setSubscription(v => ({ ...v, start_date: e.target.value }))} className={inputClass} /></Field>
                        <Field label="Payment due date"><input type="date" value={subscription.due_date} onChange={e => setSubscription(v => ({ ...v, due_date: e.target.value }))} className={inputClass} /></Field>
                    </div>
                    <Field label="Notes (optional)"><textarea rows="2" value={subscription.notes} onChange={e => setSubscription(v => ({ ...v, notes: e.target.value }))} className={textClass} placeholder="Agreed terms or notes" /></Field>
                    <button disabled={savingSubscription || loading || rate === null} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Plus className="h-4 w-4" />{savingSubscription ? "Saving..." : "Save subscription"}</button>
                </form>

                <form onSubmit={submitPayment} className="space-y-4 rounded-xl border bg-background p-4 shadow-sm sm:p-5">
                    <div><h2 className="text-lg font-semibold">Record school payment</h2><p className="mt-1 text-sm text-muted-foreground">Record full or partial payments against an existing subscription.</p></div>
                    <Field label="School subscription">
                        <select required value={payment.subscription_id} onChange={e => {
                            const selected = data.subscriptions.find(s => String(s.id) === e.target.value);
                            setPayment(v => ({ ...v, subscription_id: e.target.value, amount: selected ? String(selected.balance || "") : "" }));
                        }} className={inputClass}>
                            <option value="">Select a subscription</option>
                            {data.subscriptions.filter(s => Number(s.balance) > 0).map(s => <option key={s.id} value={s.id}>{s.school_name} — {s.billing_period} — Balance {money(s.balance)}</option>)}
                        </select>
                    </Field>
                    {selectedSubscription && <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm"><div><p className="text-muted-foreground">Subscription amount</p><p className="mt-1 font-semibold">{money(selectedSubscription.amount_due)}</p></div><div><p className="text-muted-foreground">Outstanding balance</p><p className="mt-1 font-semibold">{money(selectedBalance)}</p></div></div>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Amount received (₦)"><input required type="number" min="0.01" max={selectedBalance || undefined} step="0.01" value={payment.amount} onChange={e => setPayment(v => ({ ...v, amount: e.target.value }))} className={inputClass} /></Field>
                        <Field label="Payment date"><input required type="date" value={payment.payment_date} onChange={e => setPayment(v => ({ ...v, payment_date: e.target.value }))} className={inputClass} /></Field>
                        <Field label="Payment method"><select value={payment.payment_method} onChange={e => setPayment(v => ({ ...v, payment_method: e.target.value }))} className={inputClass}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="card">Card</option><option value="pos">POS</option><option value="other">Other</option></select></Field>
                        <Field label="Transaction / reference"><input value={payment.reference} onChange={e => setPayment(v => ({ ...v, reference: e.target.value }))} className={inputClass} placeholder="Optional reference" /></Field>
                    </div>
                    <Field label="Notes (optional)"><textarea rows="2" value={payment.notes} onChange={e => setPayment(v => ({ ...v, notes: e.target.value }))} className={textClass} placeholder="Payment notes" /></Field>
                    <button disabled={savingPayment || loading || !selectedSubscription || Number(payment.amount) <= 0 || Number(payment.amount) > selectedBalance} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Plus className="h-4 w-4" />{savingPayment ? "Recording..." : "Record payment"}</button>
                </form>
            </div>

            <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="flex flex-wrap gap-2 border-b p-3 sm:p-4">
                    <button type="button" onClick={() => setActiveTab("subscriptions")} className={`rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "subscriptions" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Subscriptions</button>
                    <button type="button" onClick={() => setActiveTab("payments")} className={`rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "payments" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Payment history</button>
                </div>
                {loading ? <p className="p-6 text-sm text-muted-foreground">Loading records…</p> : activeTab === "subscriptions" ? (
                    <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>{["School","Plan / Period","Students","Amount due","Paid","Balance","Status"].map(x => <th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead><tbody className="divide-y">{data.subscriptions.map(s => <tr key={s.id}><td className="px-4 py-3 font-medium">{s.school_name}</td><td className="px-4 py-3"><div>{s.plan_name}</div><div className="text-xs text-muted-foreground">{s.billing_period}</div></td><td className="px-4 py-3">{s.student_count}</td><td className="px-4 py-3">{money(s.amount_due)}</td><td className="px-4 py-3">{money(s.amount_paid)}</td><td className="px-4 py-3 font-semibold">{money(s.balance)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${Number(s.balance) === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>{Number(s.balance) === 0 ? "Paid" : s.status}</span></td></tr>)}{data.subscriptions.length === 0 && <tr><td colSpan="7" className="px-4 py-10 text-center text-muted-foreground">No subscriptions recorded yet.</td></tr>}</tbody></table></div>
                ) : (
                    <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>{["Date","School","Billing period","Amount","Method","Reference"].map(x => <th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead><tbody className="divide-y">{data.payments.map(p => <tr key={p.id}><td className="px-4 py-3">{String(p.payment_date).slice(0,10)}</td><td className="px-4 py-3 font-medium">{p.school_name}</td><td className="px-4 py-3">{p.billing_period}</td><td className="px-4 py-3 font-semibold">{money(p.amount)}</td><td className="px-4 py-3">{String(p.payment_method).replace("_"," ")}</td><td className="px-4 py-3">{p.reference || "—"}</td></tr>)}{data.payments.length === 0 && <tr><td colSpan="6" className="px-4 py-10 text-center text-muted-foreground">No payments recorded yet.</td></tr>}</tbody></table></div>
                )}
            </section>
        </div>
    );
}
