import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DollarSign, Link2, Mail, MapPin, Phone, RefreshCw, ShieldAlert, UserRound, Users, X } from "lucide-react";
import { getPartnerAdminOverview, getPartnerAdminPartner, setPartnerStatus, setPartnerLeadStatus, createPartnerCommission, setPartnerCommissionStatus } from "../../api/partnerAdminApi";

const leadStatuses = ["submitted", "contacted", "demo_scheduled", "demo_completed", "negotiation", "converted", "lost"];
const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const labelize = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function PartnerDetailsModal({ partner, onClose, onRefresh }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true); setError("");
        try {
            const response = await getPartnerAdminPartner(partner.id);
            setDetails(response.data);
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to load partner details.");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [partner.id]);

    const copyReferralLink = async () => {
        const link = `${window.location.origin}/r/${partner.referral_code}`;
        try {
            await navigator.clipboard.writeText(link);
            setError("Referral link copied to clipboard.");
            setTimeout(() => setError(""), 2500);
        } catch { setError(link); }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Partner Profile</p><h2 className="mt-1 truncate text-xl font-bold text-slate-900">{partner.full_name}</h2><p className="mt-1 text-sm text-slate-500">Joined {date(partner.created_at)}</p></div>
                    <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-5 w-5" /></button>
                </div>
                <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
                    {error && <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{error}</div>}
                    {loading ? <div className="py-16 text-center text-sm text-slate-500">Loading partner details...</div> : details && <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[[Users, "Leads", details.partner.lead_count], [CheckCircle2, "Converted", details.partner.converted_count], [DollarSign, "Earned", money(details.partner.earned_commission)], [DollarSign, "Paid", money(details.partner.paid_commission)]].map(([Icon, label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><Icon className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>)}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                            <section className="rounded-xl border border-slate-200 p-5">
                                <h3 className="font-bold text-slate-900">Partner information</h3>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
                                    <div className="flex gap-3"><UserRound className="h-4 w-4 shrink-0 text-slate-400" /><div><p className="text-xs text-slate-500">Full name</p><p className="font-medium text-slate-800">{details.partner.full_name}</p></div></div>
                                    <div className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-slate-400" /><div><p className="text-xs text-slate-500">Email</p><p className="break-all font-medium text-slate-800">{details.partner.email}</p></div></div>
                                    <div className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-slate-400" /><div><p className="text-xs text-slate-500">Phone</p><p className="font-medium text-slate-800">{details.partner.phone}</p></div></div>
                                    <div className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /><div><p className="text-xs text-slate-500">Location</p><p className="font-medium text-slate-800">{details.partner.location || "Not provided"}</p></div></div>
                                </div>
                            </section>
                            <section className="rounded-xl border border-blue-100 bg-blue-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Referral code</p><p className="mt-2 font-mono text-lg font-bold text-slate-900">{details.partner.referral_code}</p><button type="button" onClick={copyReferralLink} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"><Link2 className="h-3.5 w-3.5" /> Copy referral link</button></section>
                        </div>

                        <section className="rounded-xl border border-slate-200"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Referred schools</h3></div><div className="divide-y divide-slate-100">{details.leads.map((lead) => <div key={lead.id} className="px-5 py-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{lead.school_name}</p><p className="mt-1 text-xs text-slate-500">{lead.contact_name || "No contact name"} • {lead.phone || "No phone"} • {lead.location || "No location"}</p></div><div className="flex items-center gap-3"><span className="text-xs text-slate-400">{date(lead.created_at)}</span><select value={lead.status} onChange={async (e) => { try { await setPartnerLeadStatus(lead.id, e.target.value); await load(); await onRefresh(); } catch (err) { setError(err?.response?.data?.message || "Unable to update lead."); } }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold">{leadStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}</select></div></div></div>)}{details.leads.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No referrals from this partner yet.</div>}</div></section>

                        <section className="rounded-xl border border-slate-200"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Commission history</h3></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">School</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{details.commissions.map((commission) => <tr key={commission.id}><td className="px-5 py-4 text-slate-700">{commission.school_name || "—"}</td><td className="px-5 py-4 font-semibold">{money(commission.amount)}</td><td className="px-5 py-4"><select value={commission.status} onChange={async (e) => { try { await setPartnerCommissionStatus(commission.id, e.target.value); await load(); await onRefresh(); } catch (err) { setError(err?.response?.data?.message || "Unable to update commission."); } }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></td><td className="px-5 py-4 text-xs text-slate-500">{date(commission.created_at)}</td></tr>)}</tbody></table>{details.commissions.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No commission records for this partner.</div>}</div></section>
                    </div>}
                </div>
            </div>
        </div>
    );
}

function PartnerManagementPage() {
    const [data, setData] = useState({ partners: [], leads: [], commissions: [], settings: null });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState("");
    const [message, setMessage] = useState("");
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [commission, setCommission] = useState({ partner_id: "", lead_id: "", amount: "" });

    const load = async () => {
        setLoading(true);
        try { const response = await getPartnerAdminOverview(); setData(response.data || { partners: [], leads: [], commissions: [], settings: null }); }
        catch (error) { setMessage(error?.response?.data?.message || "Unable to load partner programme data."); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const stats = useMemo(() => {
        const converted = data.leads.filter((l) => l.status === "converted").length;
        return { partners: data.partners.length, active: data.partners.filter((p) => p.status === "active").length, leads: data.leads.length, converted, conversionRate: data.leads.length ? Math.round((converted / data.leads.length) * 100) : 0, paid: data.commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.amount || 0), 0), pending: data.commissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + Number(c.amount || 0), 0) };
    }, [data]);

    const run = async (key, action, successMessage) => {
        setBusy(key); setMessage("");
        try { await action(); await load(); setMessage(successMessage); }
        catch (error) { setMessage(error?.response?.data?.message || "Action could not be completed."); }
        finally { setBusy(""); }
    };

    const submitCommission = async (event) => {
        event.preventDefault();
        await run("commission", () => createPartnerCommission({ ...commission, partner_id: Number(commission.partner_id), lead_id: commission.lead_id ? Number(commission.lead_id) : null, amount: Number(commission.amount) }), "Commission recorded.");
        setCommission({ partner_id: "", lead_id: "", amount: "" });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">Platform Administration</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Partner Programme</h1><p className="mt-1 text-sm text-slate-500">Manage EduProw marketers, referrals and commission records.</p></div><button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
                {message && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
                    {[[Users, "Partners", stats.partners], [CheckCircle2, "Active", stats.active], [Link2, "Leads", stats.leads], [CheckCircle2, "Converted", stats.converted], [CheckCircle2, "Conversion", `${stats.conversionRate}%`], [DollarSign, "Paid", money(stats.paid)], [Clock3, "Pending", money(stats.pending)]].map(([Icon, label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Icon className="h-5 w-5 text-blue-600" /><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>)}
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Partners</h2><p className="mt-1 text-xs text-slate-500">Select a partner to view their complete referral and commission history.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Partner</th><th className="px-5 py-3">Referral</th><th className="px-5 py-3">Leads</th><th className="px-5 py-3">Earned</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Joined</th></tr></thead><tbody className="divide-y divide-slate-100">{data.partners.map((p) => <tr key={p.id} onClick={() => setSelectedPartner(p)} className="cursor-pointer transition-colors hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{p.full_name}</p><p className="text-xs text-slate-500">{p.email} • {p.phone}</p></td><td className="px-5 py-4 font-mono text-xs text-slate-600">{p.referral_code}</td><td className="px-5 py-4 text-slate-700">{p.lead_count} <span className="text-xs text-slate-400">({p.converted_count} converted)</span></td><td className="px-5 py-4 font-semibold text-slate-800">{money(p.earned_commission)}</td><td className="px-5 py-4" onClick={(e) => e.stopPropagation()}><select value={p.status} disabled={busy === `partner-${p.id}`} onChange={(e) => run(`partner-${p.id}`, () => setPartnerStatus(p.id, e.target.value), "Partner status updated.")} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option></select></td><td className="px-5 py-4 text-xs text-slate-500">{date(p.created_at)}</td></tr>)}</tbody></table>{!loading && data.partners.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No partner accounts yet.</div>}</div></section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Referral leads</h2></div><div className="divide-y divide-slate-100">{data.leads.slice(0, 30).map((lead) => <div key={lead.id} className="space-y-2 px-5 py-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{lead.school_name}</p><p className="text-xs text-slate-500">{lead.partner_name} • {lead.contact_name || "No contact name"}</p></div><span className="text-xs text-slate-400">{date(lead.created_at)}</span></div><div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{lead.phone || "No phone"}</span><span>•</span><span>{lead.location || "No location"}</span>{lead.student_count ? <><span>•</span><span>{lead.student_count} students</span></>}{lead.status === "converted" && <span className="font-semibold text-emerald-600">Converted</span>}</div><select value={lead.status} disabled={busy === `lead-${lead.id}`} onChange={(e) => run(`lead-${lead.id}`, () => setPartnerLeadStatus(lead.id, e.target.value), "Lead status updated.")} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold">{leadStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}</select></div>)}{!loading && data.leads.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No referrals yet.</div>}</div></section>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Record commission</h2><p className="mt-1 text-xs text-slate-500">Record a qualifying commission after the referred school has made the agreed payment.</p></div><form onSubmit={submitCommission} className="space-y-4 p-5"><label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Partner</span><select required value={commission.partner_id} onChange={(e) => setCommission((v) => ({ ...v, partner_id: e.target.value, lead_id: "" }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">Select partner</option>{data.partners.map((p) => <option key={p.id} value={p.id}>{p.full_name} — {p.referral_code}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Lead (optional)</span><select value={commission.lead_id} onChange={(e) => setCommission((v) => ({ ...v, lead_id: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">No linked lead</option>{data.leads.filter((l) => String(l.partner_id) === String(commission.partner_id)).map((l) => <option key={l.id} value={l.id}>{l.school_name} — {labelize(l.status)}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Commission amount (₦)</span><input required min="1" step="0.01" type="number" value={commission.amount} onChange={(e) => setCommission((v) => ({ ...v, amount: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="e.g. 5000" /></label><button disabled={busy === "commission"} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{busy === "commission" ? "Saving..." : "Record commission"}</button></form></section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Commission records</h2></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Partner</th><th className="px-5 py-3">School</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{data.commissions.map((c) => <tr key={c.id}><td className="px-5 py-4 font-semibold text-slate-800">{c.partner_name}</td><td className="px-5 py-4 text-slate-600">{c.school_name || "—"}</td><td className="px-5 py-4 font-semibold">{money(c.amount)}</td><td className="px-5 py-4"><select value={c.status} disabled={busy === `commission-${c.id}`} onChange={(e) => run(`commission-${c.id}`, () => setPartnerCommissionStatus(c.id, e.target.value), "Commission status updated.")} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></td><td className="px-5 py-4 text-xs text-slate-500">{date(c.created_at)}</td></tr>)}</tbody></table>{!loading && data.commissions.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No commission records yet.</div>}</div></section>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Programme rule:</strong> the current partner programme is configured for a 5% referral commission on the first qualifying payment. Keep commission approval tied to confirmed payment receipt and your written partner terms.</p></div></div>
            </div>
            {selectedPartner && <PartnerDetailsModal partner={selectedPartner} onClose={() => setSelectedPartner(null)} onRefresh={load} />}
        </div>
    );
}

export default PartnerManagementPage;