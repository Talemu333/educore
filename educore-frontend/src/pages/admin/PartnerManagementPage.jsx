import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DollarSign, Eye, Link2, RefreshCw, ShieldAlert, Users, X } from "lucide-react";
import { getPartnerAdminOverview, getPartnerAdminPartner, setPartnerStatus, setPartnerLeadStatus, createPartnerCommission, setPartnerCommissionStatus } from "../../api/partnerAdminApi";

const leadStatuses = ["submitted", "contacted", "demo_scheduled", "demo_completed", "negotiation", "converted", "lost"];
const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function PartnerManagementPage() {
    const [data, setData] = useState({ partners: [], leads: [], commissions: [], settings: null, schools: [] });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState("");
    const [message, setMessage] = useState("");
    const [commission, setCommission] = useState({ partner_id: "", lead_id: "", amount: "" });
    const [leadSchools, setLeadSchools] = useState({});
    const [selectedPartnerId, setSelectedPartnerId] = useState(null);
    const [partnerDetails, setPartnerDetails] = useState(null);
    const [partnerDetailsLoading, setPartnerDetailsLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const response = await getPartnerAdminOverview();
            const nextData = response.data || { partners: [], leads: [], commissions: [], settings: null, schools: [] };
            setData({ ...nextData, schools: nextData.schools || [] });
            setLeadSchools((current) => {
                const next = { ...current };
                (nextData.leads || []).forEach((lead) => {
                    if (lead.school_id) next[lead.id] = String(lead.school_id);
                });
                return next;
            });
        } catch (error) {
            setMessage(error?.response?.data?.message || "Unable to load partner programme data.");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openPartnerDetails = async (partnerId) => {
        setSelectedPartnerId(partnerId);
        setPartnerDetails(null);
        setPartnerDetailsLoading(true);
        try {
            const response = await getPartnerAdminPartner(partnerId);
            setPartnerDetails(response.data || null);
        } catch (error) {
            setMessage(error?.response?.data?.message || "Unable to load partner details.");
            setSelectedPartnerId(null);
        } finally { setPartnerDetailsLoading(false); }
    };

    const closePartnerDetails = () => {
        if (partnerDetailsLoading) return;
        setSelectedPartnerId(null);
        setPartnerDetails(null);
    };

    const stats = useMemo(() => ({
        partners: data.partners.length,
        active: data.partners.filter((p) => p.status === "active").length,
        leads: data.leads.length,
        converted: data.leads.filter((l) => l.status === "converted").length,
        paid: data.commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.amount || 0), 0),
        pending: data.commissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + Number(c.amount || 0), 0),
    }), [data]);

    const run = async (key, action, successMessage) => {
        setBusy(key); setMessage("");
        try {
            await action();
            await load();
            setMessage(successMessage);
            return true;
        } catch (error) {
            setMessage(error?.response?.data?.message || "Action could not be completed.");
            return false;
        } finally { setBusy(""); }
    };

    const changeLeadStatus = async (lead, status) => {
        if (status === "converted") {
            const schoolId = leadSchools[lead.id] || lead.school_id || "";
            if (!schoolId) {
                setMessage("Select the actual school before marking this lead as converted.");
                return;
            }
            await run(`lead-${lead.id}`, () => setPartnerLeadStatus(lead.id, status, Number(schoolId)), "Lead converted and linked to the school.");
            return;
        }
        await run(`lead-${lead.id}`, () => setPartnerLeadStatus(lead.id, status), "Lead status updated.");
    };

    const submitCommission = async (event) => {
        event.preventDefault();
        if (busy === "commission") return;
        setBusy("commission");
        setMessage("");
        try {
            await createPartnerCommission({
                ...commission,
                partner_id: Number(commission.partner_id),
                lead_id: commission.lead_id ? Number(commission.lead_id) : null,
                amount: Number(commission.amount)
            });
            setCommission({ partner_id: "", lead_id: "", amount: "" });
            await load();
            setMessage("Commission recorded successfully and added to Earned.");
        } catch (error) {
            setMessage(error?.response?.data?.message || "Commission could not be recorded.");
        } finally { setBusy(""); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="text-sm font-semibold text-blue-600">Platform Administration</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Partner Programme</h1><p className="mt-1 text-sm text-slate-500">Manage EduProw marketers, referrals and commission records.</p></div>
                    <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
                </div>
                {message && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{[[Users, "Partners", stats.partners], [CheckCircle2, "Active", stats.active], [Link2, "Leads", stats.leads], [CheckCircle2, "Converted", stats.converted], [DollarSign, "Paid", money(stats.paid)], [Clock3, "Pending", money(stats.pending)]].map(([Icon, label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Icon className="h-5 w-5 text-blue-600" /><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>)}</div>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Partners</h2></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Partner</th><th className="px-5 py-3">Referral</th><th className="px-5 py-3">Leads</th><th className="px-5 py-3">Earned</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{data.partners.map((p) => <tr key={p.id}><td className="px-5 py-4"><button type="button" onClick={() => openPartnerDetails(p.id)} className="text-left"><p className="font-semibold text-blue-700 hover:text-blue-900">{p.full_name}</p><p className="text-xs text-slate-500">{p.email} • {p.phone}</p></button></td><td className="px-5 py-4 font-mono text-xs text-slate-600">{p.referral_code}</td><td className="px-5 py-4 text-slate-700">{p.lead_count} <span className="text-xs text-slate-400">({p.converted_count} converted)</span></td><td className="px-5 py-4 font-semibold text-slate-800">{money(p.earned_commission)}</td><td className="px-5 py-4"><select value={p.status} disabled={busy === `partner-${p.id}`} onChange={(e) => run(`partner-${p.id}`, () => setPartnerStatus(p.id, e.target.value), "Partner status updated.")} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option></select></td><td className="px-5 py-4"><button type="button" onClick={() => openPartnerDetails(p.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Eye className="h-3.5 w-3.5" /> View</button></td></tr>)}</tbody></table>{!loading && data.partners.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No partner accounts yet.</div>}</div></section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Referral leads</h2></div><div className="divide-y divide-slate-100">{data.leads.slice(0, 30).map((lead) => <div key={lead.id} className="space-y-2 px-5 py-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{lead.school_name}</p><p className="text-xs text-slate-500">{lead.partner_name} • {lead.contact_name || "No contact name"}</p></div><span className="text-xs text-slate-400">{date(lead.created_at)}</span></div><div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{lead.phone || "No phone"}</span><span>•</span><span>{lead.location || "No location"}</span>{lead.student_count ? <><span>•</span><span>{lead.student_count} students</span></> : null}{lead.status === "converted" && <span className="font-semibold text-emerald-600">Converted</span>}</div>{lead.status !== "converted" && <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Actual school</span><select value={leadSchools[lead.id] || ""} onChange={(e) => setLeadSchools((current) => ({ ...current, [lead.id]: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"><option value="">Select school before converting</option>{data.schools.map((school) => <option key={school.id} value={school.id}>{school.school_name}</option>)}</select></label>}<div className="flex items-center gap-2"><select value={lead.status} disabled={busy === `lead-${lead.id}`} onChange={(e) => changeLeadStatus(lead, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold">{leadStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, " ")}</option>)}</select>{lead.status !== "converted" && <span className="text-[11px] text-slate-400">Choose the school above, then select Converted.</span>}</div></div>)}{!loading && data.leads.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No referrals yet.</div>}</div></section>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Record commission</h2><p className="mt-1 text-xs text-slate-500">Only record a qualifying commission after the referred school has made the agreed payment.</p></div><form onSubmit={submitCommission} className="space-y-4 p-5"><label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Partner</span><select required value={commission.partner_id} onChange={(e) => setCommission((v) => ({ ...v, partner_id: e.target.value, lead_id: "" }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">Select partner</option>{data.partners.map((p) => <option key={p.id} value={p.id}>{p.full_name} — {p.referral_code}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Lead (optional)</span><select value={commission.lead_id} onChange={(e) => setCommission((v) => ({ ...v, lead_id: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">No linked lead</option>{data.leads.filter((l) => String(l.partner_id) === String(commission.partner_id)).map((l) => <option key={l.id} value={l.id}>{l.school_name} — {l.status}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Commission amount (₦)</span><input required min="1" step="0.01" type="number" value={commission.amount} onChange={(e) => setCommission((v) => ({ ...v, amount: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="e.g. 5000" /></label><button type="submit" disabled={busy === "commission"} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{busy === "commission" ? "Saving..." : "Record commission"}</button></form></section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Commission records</h2></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Partner</th><th className="px-5 py-3">School</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{data.commissions.map((c) => <tr key={c.id}><td className="px-5 py-4 font-semibold text-slate-800">{c.partner_name}</td><td className="px-5 py-4 text-slate-600">{c.school_name || "—"}</td><td className="px-5 py-4 font-semibold">{money(c.amount)}</td><td className="px-5 py-4"><select value={c.status} disabled={busy === `commission-${c.id}`} onChange={(e) => run(`commission-${c.id}`, () => setPartnerCommissionStatus(c.id, e.target.value), "Commission status updated.")} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></td><td className="px-5 py-4 text-xs text-slate-500">{date(c.created_at)}</td></tr>)}</tbody></table>{!loading && data.commissions.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No commission records yet.</div>}</div></section>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Programme rule:</strong> the current partner programme is configured for a 5% referral commission on the first qualifying payment. Keep commission approval tied to confirmed payment receipt and your written partner terms.</p></div></div>
            </div>

            {selectedPartnerId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closePartnerDetails(); }}>
                <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Partner details</p><h2 className="mt-1 text-xl font-bold text-slate-900">{partnerDetails?.partner?.full_name || "Loading partner..."}</h2>{partnerDetails?.partner && <p className="mt-1 text-xs text-slate-500">Referral code: <span className="font-mono font-semibold">{partnerDetails.partner.referral_code}</span></p>}</div><button type="button" onClick={closePartnerDetails} disabled={partnerDetailsLoading} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Close partner details"><X className="h-5 w-5" /></button></div>
                    {partnerDetailsLoading && <div className="p-8 text-center text-sm text-slate-500">Loading partner details...</div>}
                    {!partnerDetailsLoading && partnerDetails?.partner && <div className="space-y-6 p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Status", partnerDetails.partner.status], ["Leads", partnerDetails.partner.lead_count], ["Converted", partnerDetails.partner.converted_count], ["Earned", money(partnerDetails.partner.earned_commission)]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>)}</div><div className="rounded-xl border border-slate-200 p-4"><h3 className="font-bold text-slate-900">Contact</h3><div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><p><span className="font-semibold text-slate-800">Email:</span> {partnerDetails.partner.email}</p><p><span className="font-semibold text-slate-800">Phone:</span> {partnerDetails.partner.phone}</p><p><span className="font-semibold text-slate-800">Location:</span> {partnerDetails.partner.location || "—"}</p><p><span className="font-semibold text-slate-800">Joined:</span> {date(partnerDetails.partner.created_at)}</p></div></div><div><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Referral history</h3><span className="text-xs text-slate-400">{partnerDetails.leads.length} total</span></div><div className="mt-3 overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">School</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Students</th><th className="px-4 py-3">Converted</th></tr></thead><tbody className="divide-y divide-slate-100">{partnerDetails.leads.map((lead) => <tr key={lead.id}><td className="px-4 py-3"><p className="font-semibold text-slate-800">{lead.school_name}</p><p className="text-xs text-slate-500">{lead.contact_name || "No contact"} • {lead.phone || "No phone"}</p></td><td className="px-4 py-3 text-xs font-semibold capitalize">{lead.status.replace(/_/g, " ")}</td><td className="px-4 py-3 text-slate-600">{lead.student_count || "—"}</td><td className="px-4 py-3 text-xs text-slate-500">{date(lead.converted_at)}</td></tr>)}</tbody></table>{!partnerDetails.leads.length && <div className="p-6 text-center text-sm text-slate-500">No referrals recorded.</div>}</div></div><div><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Commission history</h3><span className="text-xs text-slate-400">{partnerDetails.commissions.length} total</span></div><div className="mt-3 overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">School</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payment</th></tr></thead><tbody className="divide-y divide-slate-100">{partnerDetails.commissions.map((item) => <tr key={item.id}><td className="px-4 py-3 text-slate-700">{item.school_name || "—"}</td><td className="px-4 py-3 font-semibold">{money(item.amount)}</td><td className="px-4 py-3 text-xs font-semibold capitalize">{item.status}</td><td className="px-4 py-3 text-xs text-slate-500">{item.payment_id ? `#${item.payment_id}` : "Manual / not linked"}</td></tr>)}</tbody></table>{!partnerDetails.commissions.length && <div className="p-6 text-center text-sm text-slate-500">No commissions recorded.</div>}</div></div></div>}
                </div>
            </div>}
        </div>
    );
}

export default PartnerManagementPage;
