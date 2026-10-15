import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, CircleAlert, Edit3, Megaphone, Plus, RefreshCw, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createAnnouncement, deactivateAnnouncement, getAnnouncements, updateAnnouncement } from "@/api/announcementApi";

const AUDIENCES = [
    { value: "all", label: "Everyone in the school" },
    { value: "students", label: "Students" },
    { value: "teachers", label: "Teachers" },
    { value: "parents", label: "Parents" },
    { value: "administrators", label: "Administrators" }
];
const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const emptyForm = () => ({ title: "", message: "", audience: "all", publish_date: today(), expiry_date: "", is_active: true });
const dateLabel = (value) => {
    if (!value) return "No expiry date";
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};
const audienceLabel = (value) => AUDIENCES.find((item) => item.value === value)?.label || value || "Everyone";
const isManager = (user) => {
    const role = String(user?.role_name || user?.role || "").trim().toLowerCase();
    const type = String(user?.admin_type || "").trim().toLowerCase();
    return role === "principal" || (role === "admin" && ["proprietor", "principal", "vice_principal"].includes(type));
};

function AnnouncementsPage() {
    const { user } = useAuth();
    const canManage = isManager(user);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const loadAnnouncements = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setLoadError("");
        try {
            setAnnouncements(await getAnnouncements());
        } catch (error) {
            setLoadError(error?.response?.data?.message || "Unable to load announcements. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

    const sorted = useMemo(() => [...announcements].sort((a, b) => {
        if (canManage) {
            const statusDiff = Number(Boolean(b.is_active)) - Number(Boolean(a.is_active));
            if (statusDiff) return statusDiff;
        }
        return String(b.publish_date || b.created_at || "").localeCompare(String(a.publish_date || a.created_at || ""));
    }), [announcements, canManage]);

    const updateField = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
    };
    const startCreate = () => { setEditingId(null); setForm(emptyForm()); setFormOpen(true); };
    const startEdit = (item) => {
        setEditingId(item.id);
        setForm({
            title: item.title || "", message: item.message || "", audience: item.audience || "all",
            publish_date: String(item.publish_date || today()).slice(0, 10),
            expiry_date: item.expiry_date ? String(item.expiry_date).slice(0, 10) : "",
            is_active: Boolean(item.is_active)
        });
        setFormOpen(true);
    };
    const cancelForm = () => { setFormOpen(false); setEditingId(null); setForm(emptyForm()); };

    const submitForm = async (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.message.trim()) return toast.error("Enter both a title and message.");
        if (form.expiry_date && form.expiry_date < form.publish_date) return toast.error("The expiry date cannot be earlier than the publication date.");
        setSaving(true);
        const payload = { ...form, title: form.title.trim(), message: form.message.trim(), expiry_date: form.expiry_date || null, is_active: Boolean(form.is_active) };
        try {
            if (editingId) {
                await updateAnnouncement(editingId, payload);
                toast.success("Announcement updated.");
            } else {
                await createAnnouncement(payload);
                toast.success("Announcement saved.");
            }
            cancelForm();
            await loadAnnouncements(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Could not save this announcement.");
        } finally { setSaving(false); }
    };

    const handleDeactivate = async (item) => {
        if (!window.confirm(`Deactivate "${item.title}"? It will no longer be shown to its audience.`)) return;
        try {
            await deactivateAnnouncement(item.id);
            toast.success("Announcement deactivated.");
            await loadAnnouncements(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Could not deactivate this announcement.");
        }
    };

    const statusFor = (item) => {
        if (!item.is_active) return ["Inactive", "bg-slate-100 text-slate-600"];
        if (String(item.publish_date || "").slice(0, 10) > today()) return ["Scheduled", "bg-blue-50 text-blue-700"];
        if (item.expiry_date && String(item.expiry_date).slice(0, 10) < today()) return ["Expired", "bg-amber-50 text-amber-700"];
        return ["Published", "bg-emerald-50 text-emerald-700"];
    };

    return <div className="mx-auto w-full min-w-0 space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Megaphone size={24} /></div>
                <div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Announcements</h1><p className="mt-1 text-sm text-slate-500">{canManage ? "Share important updates with the right people in your school." : "School notices and updates intended for you."}</p></div>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={() => loadAnnouncements(true)} disabled={refreshing || loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />Refresh</button>
                {canManage && <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={17} />New announcement</button>}
            </div>
        </header>

        {canManage && <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Total announcements</p><p className="mt-1 text-2xl font-bold text-slate-900">{announcements.length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Active</p><p className="mt-1 text-2xl font-bold text-emerald-700">{announcements.filter((item) => item.is_active).length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">For everyone</p><p className="mt-1 text-2xl font-bold text-blue-700">{announcements.filter((item) => item.audience === "all" && item.is_active).length}</p></div>
        </div>}

        {canManage && formOpen && <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit announcement" : "Create announcement"}</h2><p className="mt-1 text-sm text-slate-500">Choose who should see it and when it should be displayed.</p></div><button type="button" onClick={cancelForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close form"><X size={18} /></button></div>
            <form onSubmit={submitForm} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700 md:col-span-2">Title<input name="title" value={form.title} onChange={updateField} maxLength={200} required placeholder="e.g. Resumption date for the new term" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                    <label className="block text-sm font-medium text-slate-700 md:col-span-2">Message<textarea name="message" value={form.message} onChange={updateField} required rows={5} placeholder="Write the announcement details..." className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                    <label className="block text-sm font-medium text-slate-700">Audience<select name="audience" value={form.audience} onChange={updateField} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{AUDIENCES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                    <label className="block text-sm font-medium text-slate-700">Publish date<input type="date" name="publish_date" value={form.publish_date} onChange={updateField} required className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
                    <label className="block text-sm font-medium text-slate-700">Expiry date <span className="font-normal text-slate-400">(optional)</span><input type="date" name="expiry_date" value={form.expiry_date} min={form.publish_date} onChange={updateField} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700 md:col-span-2"><input type="checkbox" name="is_active" checked={form.is_active} onChange={updateField} className="h-4 w-4 accent-blue-600" /><span><span className="block font-semibold">Active announcement</span><span className="mt-0.5 block text-xs font-normal text-slate-500">Active announcements appear to their audience on or after the publish date.</span></span></label>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={cancelForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save size={16} />{saving ? "Saving..." : editingId ? "Save changes" : "Save announcement"}</button></div>
            </form>
        </section>}

        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"><RefreshCw className="mx-auto mb-3 animate-spin text-blue-600" size={24} />Loading announcements...</div>
        : loadError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 shrink-0 text-red-600" size={20} /><div><h2 className="font-semibold text-red-800">Unable to load announcements</h2><p className="mt-1 break-words text-sm text-red-700">{loadError}</p><button type="button" onClick={() => loadAnnouncements()} className="mt-3 text-sm font-semibold text-red-800 underline">Try again</button></div></div></div>
        : sorted.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Bell size={26} /></div><h2 className="mt-4 text-lg font-semibold text-slate-900">{canManage ? "No announcements yet" : "No announcements available"}</h2><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{canManage ? "Create an announcement to share an important notice with your school community." : "When your school publishes a notice for you, it will appear here."}</p>{canManage && <button type="button" onClick={startCreate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={16} />Create announcement</button>}</div>
        : <div className="space-y-3">{sorted.map((item) => {
            const [status, statusClass] = statusFor(item);
            return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Megaphone size={20} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-base font-bold text-slate-900">{item.title}</h2>{canManage && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{status}</span>}</div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.message}</p><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />Published {dateLabel(item.publish_date)}</span><span>{canManage ? `Audience: ${audienceLabel(item.audience)}` : item.expiry_date ? `Expires ${dateLabel(item.expiry_date)}` : "School announcement"}</span></div></div></div>{canManage && <div className="flex shrink-0 gap-2 sm:pl-3"><button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Edit3 size={15} />Edit</button>{item.is_active && <button type="button" onClick={() => handleDeactivate(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"><X size={15} />Deactivate</button>}</div>}</div></article>;
        })}</div>}
        {canManage && <p className="text-xs text-slate-500">Deactivation preserves the record and removes it from audience views.</p>}
    </div>;
}

export default AnnouncementsPage;
