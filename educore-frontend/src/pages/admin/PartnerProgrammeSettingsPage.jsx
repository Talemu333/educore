import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Percent, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { getPartnerAdminOverview, updatePartnerProgrammeSettings } from "../../api/partnerAdminApi";

function PartnerProgrammeSettingsPage() {
    const [form, setForm] = useState({
        programme_name: "EduProw Partner Programme",
        commission_type: "percentage",
        commission_rate: "5",
        commission_fixed_amount: "",
        commission_eligibility: "Commission becomes eligible after EduProw confirms receipt of the first payment from a referred school."
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getPartnerAdminOverview();
            const settings = response.data?.settings;
            if (settings) {
                setForm({
                    programme_name: settings.programme_name || "EduProw Partner Programme",
                    commission_type: settings.commission_type || "percentage",
                    commission_rate: settings.commission_rate ?? "5",
                    commission_fixed_amount: settings.commission_fixed_amount ?? "",
                    commission_eligibility: settings.commission_eligibility || ""
                });
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to load programme settings.");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const save = async (event) => {
        event.preventDefault();
        setSaving(true); setMessage(""); setError("");
        try {
            const response = await updatePartnerProgrammeSettings({
                ...form,
                commission_rate: Number(form.commission_rate || 0),
                commission_fixed_amount: form.commission_fixed_amount === "" ? null : Number(form.commission_fixed_amount)
            });
            const settings = response.data;
            setForm((current) => ({ ...current, commission_rate: settings.commission_rate, commission_fixed_amount: settings.commission_fixed_amount ?? "" }));
            setMessage("Partner programme settings saved successfully.");
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to save programme settings.");
        } finally { setSaving(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <a href="/partner-management" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Partner Programme</a>
                        <h1 className="mt-3 text-2xl font-bold text-slate-900">Programme Settings</h1>
                        <p className="mt-1 text-sm text-slate-500">Control the commission rule used by the EduProw partner programme.</p>
                    </div>
                    <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
                </div>

                {message && <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 className="h-5 w-5" /> {message}</div>}
                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="font-bold text-slate-900">Commission settings</h2><p className="mt-1 text-sm text-slate-500">You can change the percentage later without changing the database structure.</p></div>
                    <div className="space-y-6 p-5 sm:p-6">
                        {loading ? <div className="py-12 text-center text-sm text-slate-500">Loading settings...</div> : <>
                            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Programme name</span><input required value={form.programme_name} onChange={(e) => setForm({ ...form, programme_name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" /></label>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Commission type</span><select value={form.commission_type} onChange={(e) => setForm({ ...form, commission_type: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"><option value="percentage">Percentage of qualifying payment</option><option value="fixed">Fixed amount</option></select></label>
                                {form.commission_type === "percentage" ? <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Commission percentage</span><div className="relative"><Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required min="0" max="100" step="0.01" type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500" /></div><p className="mt-2 text-xs text-slate-500">Current value: <strong>{form.commission_rate}%</strong></p></label> : <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Fixed commission (₦)</span><input required min="0" step="0.01" type="number" value={form.commission_fixed_amount} onChange={(e) => setForm({ ...form, commission_fixed_amount: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" /></label>}
                            </div>

                            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Commission eligibility rule</span><textarea rows={4} value={form.commission_eligibility} onChange={(e) => setForm({ ...form, commission_eligibility: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" /></label>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><p>Changing the percentage changes the programme rule for future commission calculations. Existing commission records are not automatically recalculated.</p></div></div>

                            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save programme settings"}</button>
                        </>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PartnerProgrammeSettingsPage;