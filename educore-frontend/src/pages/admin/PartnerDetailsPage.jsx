import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, DollarSign, Link2, RefreshCw, Users } from "lucide-react";
import { getPartnerAdminPartner } from "../../api/partnerAdminApi";

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function PartnerDetailsPage({ partnerId, onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const load = async () => {
        setLoading(true);
        setMessage("");
        try {
            const response = await getPartnerAdminPartner(partnerId);
            setData(response.data || null);
        } catch (error) {
            setMessage(error?.response?.data?.message || "Unable to load partner details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (partnerId) load(); }, [partnerId]);

    const partner = data?.partner;
    const leads = data?.leads || [];
    const commissions = data?.commissions || [];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> Back to partners</button>
                    <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"><RefreshCw className="h-4 w-4" /> Refresh</button>
                </div>

                {message && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}
                {loading && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Loading partner details...</div>}

                {!loading && partner && <>
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div><p className="text-sm font-semibold text-blue-600">Partner profile</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{partner.full_name}</h1><p className="mt-1 text-sm text-slate-500">Referral code: <span className="font-mono font-semibold text-slate-700">{partner.referral_code}</span></p></div>
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-700">{partner.status}</span>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {[[Users, "Leads", partner.lead_count], [CheckCircle2, "Converted", partner.converted_count], [DollarSign, "Earned", money(partner.earned_commission)], [Clock3, "Joined", date(partner.created_at)]].map(([Icon, label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><Icon className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>)}
                        </div>
                        <div className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"><p><strong className="text-slate-800">Email:</strong> {partner.email}</p><p><strong className="text-slate-800">Phone:</strong> {partner.phone}</p><p><strong className="text-slate-800">Location:</strong> {partner.location || "—"}</p></div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Referral history</h2><p className="mt-1 text-xs text-slate-500">Schools submitted by this partner.</p></div><span className="text-xs font-semibold text-slate-400">{leads.length} total</span></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">School</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Students</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Converted</th></tr></thead><tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead.id}><td className="px-5 py-4"><p className="font-semibold text-slate-800">{lead.school_name}</p><p className="text-xs text-slate-500">{lead.contact_name || "No contact"} • {lead.phone || "No phone"}</p></td><td className="px-5 py-4 text-xs font-semibold capitalize">{lead.status.replace(/_/g, " ")}</td><td className="px-5 py-4 text-slate-600">{lead.student_count || "—"}</td><td className="px-5 py-4 text-xs text-slate-500">{date(lead.created_at)}</td><td className="px-5 py-4 text-xs text-slate-500">{date(lead.converted_at)}</td></tr>)}</tbody></table>{!leads.length && <div className="p-8 text-center text-sm text-slate-500">No referrals recorded.</div>}</div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Commission history</h2><p className="mt-1 text-xs text-slate-500">Automatic and manually recorded commissions.</p></div><span className="text-xs font-semibold text-slate-400">{commissions.length} total</span></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">School</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{commissions.map((item) => <tr key={item.id}><td className="px-5 py-4 text-slate-700">{item.school_name || "—"}</td><td className="px-5 py-4 font-semibold">{money(item.amount)}</td><td className="px-5 py-4 text-xs font-semibold capitalize">{item.status}</td><td className="px-5 py-4 text-xs text-slate-500">{item.payment_id ? `#${item.payment_id}` : "Manual / not linked"}</td><td className="px-5 py-4 text-xs text-slate-500">{date(item.created_at)}</td></tr>)}</tbody></table>{!commissions.length && <div className="p-8 text-center text-sm text-slate-500">No commissions recorded.</div>}</div>
                    </section>
                </>}
            </div>
        </div>
    );
}

export default PartnerDetailsPage;
