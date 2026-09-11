import { useEffect, useState } from "react";
import { createPartnerLead, getPartnerDashboard, loginPartner, logoutPartner, registerPartner } from "@/api/partnerApi";

const formatMoney = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PartnerHeader = ({ dashboard = false, onLogout }) => (
    <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
            <a href="/eduprow" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white">E</span>
                <span><strong className="block text-lg text-slate-950">EduProw</strong><span className="text-[11px] text-slate-500">Partner Programme</span></span>
            </a>
            {dashboard ? <button onClick={onLogout} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Log out</button> : <a href="/partners/login" className="text-sm font-bold text-blue-600">Partner Sign In</a>}
        </div>
    </header>
);

const benefits = [
    ["🔗", "Your own referral link", "Share a unique EduProw link and let interested schools come through your network."],
    ["📋", "Register leads directly", "Meet a school offline? Add the school to your partner dashboard so the lead is recorded."],
    ["💰", "Track your earnings", "See eligible, approved and paid commissions from your referrals in one place."],
    ["📚", "Get sales resources", "Access product information, talking points and resources that make school outreach easier."]
];

const marketingSteps = [
    ["1", "Find the right schools", "Focus on private schools, school owners, administrators and education organisations that still rely heavily on paper records, spreadsheets or disconnected tools."],
    ["2", "Start with the problem", "Ask what is difficult today: results, attendance, fee tracking, parent communication, CBT, school websites or managing information across departments."],
    ["3", "Show the relevant solution", "Do not try to explain every feature at once. Match the school's biggest problem to the EduProw feature that solves it."],
    ["4", "Invite them to a demo", "Use your referral link or register the lead from your dashboard so EduProw can follow up and demonstrate the platform."],
    ["5", "Follow up professionally", "Keep the conversation helpful. Answer basic questions, share approved EduProw information and let the EduProw team handle pricing and implementation details."]
];

const pitchPoints = [
    "One connected platform for school administration and academics",
    "Dedicated experiences for administrators, teachers, parents and students",
    "Student records, attendance, results, finance, communication and CBT in one system",
    "A branded public website for each school",
    "Multi-school architecture that keeps school operations separated"
];

function PartnerHome() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PartnerHeader />
            <main>
                <section className="bg-slate-950 px-5 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                        <div>
                            <span className="inline-flex rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">EduProw Partner Programme</span>
                            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">Help schools discover EduProw and grow with us.</h1>
                            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">Join a structured partner programme for people who can introduce EduProw to schools, education organisations and school owners.</p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a href="/partners/register" className="rounded-xl bg-blue-600 px-7 py-3.5 text-center text-sm font-bold hover:bg-blue-500">Join the Partner Programme</a>
                                <a href="/partners/login" className="rounded-xl border border-white/15 px-7 py-3.5 text-center text-sm font-bold hover:bg-white/10">Partner Sign In</a>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                            <p className="text-sm font-bold text-blue-300">How it works</p>
                            <div className="mt-6 space-y-5">
                                {["Create your partner account", "Get your unique referral link", "Introduce EduProw to schools", "Track leads and conversions", "Receive commission on eligible sales"].map((item, index) => (
                                    <div key={item} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black">{index + 1}</span><p className="pt-1 text-sm font-semibold text-slate-200">{item}</p></div>
                                ))}
                            </div>
                            <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-6 text-slate-400">The current referral programme uses a 5% commission on the first payment received from a qualifying referred school. Commission becomes eligible after EduProw confirms receipt of that payment.</p>
                        </div>
                    </div>
                </section>

                <section className="px-5 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Partner benefits</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Everything you need to represent EduProw professionally.</h2></div>
                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map(([icon, title, description]) => <article key={title} className="rounded-3xl border border-slate-200 p-6 shadow-sm"><div className="text-2xl">{icon}</div><h3 className="mt-5 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-5 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">How to market EduProw</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">You do not need to be a professional salesperson.</h2>
                            <p className="mt-4 leading-7 text-slate-600">Your main job is to identify a genuine school need, introduce EduProw clearly and connect the interested school with the platform. The strongest approach is problem-first, not feature-first.</p>
                        </div>
                        <div className="mt-10 grid gap-4 lg:grid-cols-5">
                            {marketingSteps.map(([number, title, description]) => (
                                <article key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <span className="text-sm font-black text-blue-600">{number}</span>
                                    <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-5 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
                        <div className="rounded-3xl bg-slate-950 p-7 text-white sm:p-9">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-400">Your talking points</p>
                            <h2 className="mt-3 text-2xl font-black">Keep your introduction simple.</h2>
                            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
                                {pitchPoints.map(point => <li key={point} className="flex gap-3"><span className="font-bold text-blue-400">✓</span><span>{point}</span></li>)}
                            </ul>
                        </div>
                        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-7 sm:p-9">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">What happens after a referral?</p>
                            <div className="mt-6 space-y-5">
                                {[
                                    ["Lead recorded", "Your referral link or dashboard submission connects the school to your partner account."],
                                    ["EduProw follows up", "The team can contact the school, understand its needs and arrange a demonstration."],
                                    ["Sale confirmed", "If the referred school becomes a qualifying customer and makes the applicable payment, the referral can become commission-eligible."],
                                    ["Commission tracked", "Your dashboard will show the lead and the commission status as it moves through the process."]
                                ].map(([title, description]) => <div key={title}><h3 className="font-extrabold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>)}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-5 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center"><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to start introducing EduProw?</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Create your account, get your referral link and start building your school network.</p><a href="/partners/register" className="mt-7 inline-flex rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-bold text-white hover:bg-slate-800">Create Partner Account</a></div>
                </section>
            </main>
            <footer className="bg-slate-950 px-5 py-8 text-center text-xs text-slate-500">Powered by EduProw · <a href="/eduprow" className="hover:text-white">Back to EduProw</a></footer>
        </div>
    );
}

function PartnerAuth({ mode }) {
    const isRegister = mode === "register";
    const [form, setForm] = useState({ full_name: "", email: "", phone: "", location: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isRegister) await registerPartner(form);
            else await loginPartner({ email: form.email, password: form.password });
            window.location.href = "/partners/dashboard";
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to complete the request. Please try again.");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <PartnerHeader />
            <main className="mx-auto flex max-w-6xl justify-center px-5 py-14 sm:px-6 lg:py-20">
                <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{isRegister ? "Join EduProw" : "Partner Sign In"}</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight">{isRegister ? "Create your partner account." : "Welcome back."}</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{isRegister ? "Tell us a little about yourself. Your referral code will be generated automatically." : "Access your referrals, leads and commission information."}</p>
                    {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                    <form onSubmit={submit} className="mt-7 space-y-4">
                        {isRegister && <><label className="block"><span className="text-sm font-bold text-slate-700">Full name</span><input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label><label className="block"><span className="text-sm font-bold text-slate-700">Phone / WhatsApp</span><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label><label className="block"><span className="text-sm font-bold text-slate-700">Location <span className="font-normal text-slate-400">(optional)</span></span><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label></>}
                        <label className="block"><span className="text-sm font-bold text-slate-700">Email</span><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label>
                        <label className="block"><span className="text-sm font-bold text-slate-700">Password</span><input required minLength={8} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label>
                        <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Please wait..." : isRegister ? "Create Partner Account" : "Sign In"}</button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-500">{isRegister ? <>Already a partner? <a href="/partners/login" className="font-bold text-blue-600">Sign in</a></> : <>New to the programme? <a href="/partners/register" className="font-bold text-blue-600">Create an account</a></>}</p>
                </div>
            </main>
        </div>
    );
}

function PartnerDashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [lead, setLead] = useState({ school_name: "", contact_name: "", phone: "", email: "", location: "", student_count: "", notes: "" });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try { const response = await getPartnerDashboard(); setData(response.data); }
        catch (err) { if (err?.response?.status === 401) window.location.href = "/partners/login"; else setError(err?.response?.data?.message || "Unable to load your dashboard."); }
    };
    useEffect(() => { load(); }, []);

    const submitLead = async (event) => {
        event.preventDefault(); setSaving(true); setError("");
        try { await createPartnerLead(lead); setLead({ school_name: "", contact_name: "", phone: "", email: "", location: "", student_count: "", notes: "" }); setShowLeadForm(false); await load(); }
        catch (err) { setError(err?.response?.data?.message || "Unable to save the lead."); }
        finally { setSaving(false); }
    };

    const logout = async () => { await logoutPartner(); window.location.href = "/partners/login"; };
    if (!data) return <div className="min-h-screen bg-slate-50"><PartnerHeader /><div className="mx-auto max-w-7xl px-5 py-16 text-center text-slate-500">Loading partner dashboard...</div></div>;

    const { partner, stats, recent_leads: leads, programme } = data;
    const commissionText = programme?.commission_type === "percentage" && programme?.commission_rate != null ? `${programme.commission_rate}%` : programme?.commission_fixed_amount != null ? formatMoney(programme.commission_fixed_amount) : "Configured by EduProw";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <PartnerHeader dashboard onLogout={logout} />
            <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold text-blue-600">Partner Dashboard</p><h1 className="mt-1 text-3xl font-black tracking-tight">Welcome, {partner.full_name.split(" ")[0]}.</h1><p className="mt-2 text-sm text-slate-500">Your referral code: <strong className="text-slate-900">{partner.referral_code}</strong></p></div><button onClick={() => setShowLeadForm(!showLeadForm)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">{showLeadForm ? "Close Lead Form" : "Register a School Lead"}</button></div>
                {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat title="Schools referred" value={stats.leads} /><Stat title="Converted" value={stats.converted} /><Stat title="Approved commission" value={formatMoney(stats.approved_commission)} /><Stat title="Paid commission" value={formatMoney(stats.paid_commission)} /></div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Your referral link</h2><p className="mt-1 text-sm text-slate-500">Share this link with schools you introduce to EduProw.</p></div></div><div className="mt-5 flex flex-col gap-2 sm:flex-row"><input readOnly value={`${window.location.origin}/r/${partner.referral_code}`} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" /><button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/r/${partner.referral_code}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Copy Link</button></div></section>
                    <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Commission programme</p><h2 className="mt-2 text-xl font-black">{commissionText}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{programme?.commission_eligibility || "Commission is paid on qualifying EduProw sales."}</p></section>
                </div>

                {showLeadForm && <form onSubmit={submitLead} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Register a school lead</h2><p className="mt-1 text-sm text-slate-500">Use this when you introduce EduProw directly instead of through your referral link.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="School name" required value={lead.school_name} onChange={v => setLead({ ...lead, school_name: v })} /><Field label="Contact person" value={lead.contact_name} onChange={v => setLead({ ...lead, contact_name: v })} /><Field label="Phone" value={lead.phone} onChange={v => setLead({ ...lead, phone: v })} /><Field label="Email" type="email" value={lead.email} onChange={v => setLead({ ...lead, email: v })} /><Field label="Location" value={lead.location} onChange={v => setLead({ ...lead, location: v })} /><Field label="Estimated student count" type="number" value={lead.student_count} onChange={v => setLead({ ...lead, student_count: v })} /><div className="sm:col-span-2"><label className="block"><span className="text-sm font-bold text-slate-700">Notes</span><textarea value={lead.notes} onChange={e => setLead({ ...lead, notes: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label></div></div><button disabled={saving} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Submit Lead"}</button></form>}

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Recent leads</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3">School</th><th className="pb-3">Location</th><th className="pb-3">Status</th><th className="pb-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{leads.length ? leads.map(item => <tr key={item.id}><td className="py-4 font-bold">{item.school_name}</td><td className="py-4 text-slate-500">{item.location || "—"}</td><td className="py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{item.status.replaceAll("_", " ")}</span></td><td className="py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td></tr>) : <tr><td colSpan="4" className="py-10 text-center text-slate-400">No leads registered yet.</td></tr>}</tbody></table></div></section>
            </main>
        </div>
    );
}

function Stat({ title, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></div>; }
function Field({ label, value, onChange, required, type = "text" }) { return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label>; }

export default function EduProwPartnerPage({ mode = "home" }) {
    if (mode === "register" || mode === "login") return <PartnerAuth mode={mode} />;
    if (mode === "dashboard") return <PartnerDashboard />;
    return <PartnerHome />;
}
