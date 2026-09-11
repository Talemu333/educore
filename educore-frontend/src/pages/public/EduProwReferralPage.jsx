import { useState } from "react";
import { submitPartnerReferral } from "@/api/partnerApi";

export default function EduProwReferralPage({ code }) {
    const [form, setForm] = useState({ school_name: "", contact_name: "", phone: "", email: "", location: "", student_count: "", notes: "" });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault(); setLoading(true); setError("");
        try { await submitPartnerReferral(code, form); setSubmitted(true); }
        catch (err) { setError(err?.response?.data?.message || "Unable to submit your request. Please try again."); }
        finally { setLoading(false); }
    };

    return <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><a href="/eduprow" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white">E</span><strong className="text-lg">EduProw</strong></a><span className="text-sm font-semibold text-slate-500">School Enquiry</span></div></header>
        <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
            {submitted ? <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">✓</div><h1 className="mt-5 text-3xl font-black">Thank you for your interest in EduProw.</h1><p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">Your school enquiry has been received. The EduProw team will contact you using the details you provided.</p><a href="/eduprow" className="mt-7 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white">Back to EduProw</a></div> : <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">EduProw</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Tell us about your school.</h1><p className="mt-4 leading-7 text-slate-600">You were referred to EduProw by one of our partners. Complete this short form and our team will follow up with you.</p>{error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><Field label="School name" required value={form.school_name} setValue={v => setForm({ ...form, school_name: v })} /><Field label="Contact person" required value={form.contact_name} setValue={v => setForm({ ...form, contact_name: v })} /><Field label="Phone / WhatsApp" required value={form.phone} setValue={v => setForm({ ...form, phone: v })} /><Field label="Email" type="email" value={form.email} setValue={v => setForm({ ...form, email: v })} /><Field label="Location" value={form.location} setValue={v => setForm({ ...form, location: v })} /><Field label="Approx. student count" type="number" value={form.student_count} setValue={v => setForm({ ...form, student_count: v })} /><label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">What would you like EduProw to help with?</span><textarea rows={4} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label><button disabled={loading} className="sm:col-span-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? "Submitting..." : "Send School Enquiry"}</button></form></div>}
        </main>
    </div>;
}

function Field({ label, required, value, setValue, type = "text" }) { return <label><span className="text-sm font-bold text-slate-700">{label}</span><input required={required} type={type} value={value} onChange={e => setValue(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label>; }
