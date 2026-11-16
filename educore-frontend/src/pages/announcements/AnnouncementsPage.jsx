import { useCallback, useEffect, useState } from "react";
import { Bell, CalendarDays, CircleAlert, Edit3, ExternalLink, Megaphone, Pin, Plus, RefreshCw, Save, Search, X, CheckCheck, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createAnnouncement, deactivateAnnouncement, getAnnouncements, getAnnouncementTargets, updateAnnouncement, setAnnouncementPinned, markAnnouncementRead, uploadAnnouncementAttachments, downloadAnnouncementAttachment, deleteAnnouncementAttachment } from "@/api/announcementApi";

const AUDIENCES = [
    { value: "all", label: "Everyone in the school" },
    { value: "students", label: "Students" },
    { value: "teachers", label: "Teachers" },
    { value: "parents", label: "Parents" },
    { value: "administrators", label: "Administrators" }
];
const today = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
const emptyForm = () => ({ title: "", message: "", audience: "all", publish_date: today(), expiry_date: "", is_active: true, is_pinned: false, attachment_url: "", attachment_name: "", class_ids: [], arm_ids: [], student_ids: [], parent_ids: [], files: [] });
const dateLabel = value => {
    if (!value) return "No expiry date";
    const d = new Date(String(value).slice(0, 10) + "T00:00:00");
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};
const audienceLabel = value => AUDIENCES.find(x => x.value === value)?.label || value || "Everyone";
const isManager = user => {
    const role = String(user?.role_name || user?.role || "").trim().toLowerCase();
    const type = String(user?.admin_type || "").trim().toLowerCase();
    return role === "principal" || (role === "admin" && ["proprietor", "principal", "vice_principal"].includes(type));
};
const selectedIds = value => Array.isArray(value) ? value.map(Number) : [];

function AnnouncementsPage() {
    const { user } = useAuth();
    const canManage = isManager(user);
    const [announcements, setAnnouncements] = useState([]);
    const [targets, setTargets] = useState({ classes: [], arms: [], students: [], parents: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filters, setFilters] = useState({ q: "", audience: "", status: "", read: "", pinned: "" });
    const [appliedFilters, setAppliedFilters] = useState({ q: "", audience: "", status: "", read: "", pinned: "" });
    const pageSize = 10;

    const loadAnnouncements = useCallback(async (refresh = false, nextPage = page, currentFilters = appliedFilters) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setLoadError("");
        try {
            const result = await getAnnouncements({ ...currentFilters, page: nextPage, limit: pageSize });
            const items = Array.isArray(result) ? result : result?.items || [];
            setAnnouncements(items);
            setTotal(Number(result?.total || items.length));
            setUnreadCount(Number(result?.unread_count || 0));
            setPage(Number(result?.page || nextPage));
        } catch (error) {
            setLoadError(error?.response?.data?.message || "Unable to load announcements. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, appliedFilters]);

    useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);
    useEffect(() => {
        if (!canManage) return;
        getAnnouncementTargets().then(data => setTargets(data || { classes: [], arms: [], students: [], parents: [] }))
            .catch(error => toast.error(error?.response?.data?.message || "Could not load class and student targeting options."));
    }, [canManage]);

    const updateField = event => {
        const { name, value, type, checked, selectedOptions } = event.target;
        if (type === "select-multiple") {
            setForm(old => ({ ...old, [name]: Array.from(selectedOptions, option => Number(option.value)) }));
        } else {
            setForm(old => ({ ...old, [name]: type === "checkbox" ? checked : value }));
        }
    };
    const startCreate = () => { setEditingId(null); setForm(emptyForm()); setFormOpen(true); };
    const startEdit = item => {
        setEditingId(item.id);
        setForm({
            title: item.title || "", message: item.message || "", audience: item.audience || "all",
            publish_date: String(item.publish_date || today()).slice(0, 10),
            expiry_date: item.expiry_date ? String(item.expiry_date).slice(0, 10) : "",
            is_active: Boolean(item.is_active), is_pinned: Boolean(item.is_pinned),
            attachment_url: item.attachment_url || "", attachment_name: item.attachment_name || "",
            class_ids: selectedIds(item.class_ids), arm_ids: selectedIds(item.arm_ids), student_ids: selectedIds(item.student_ids), parent_ids: selectedIds(item.parent_ids)
        });
        setFormOpen(true);
    };
    const cancelForm = () => { setFormOpen(false); setEditingId(null); setForm(emptyForm()); };
    const submitForm = async event => {
        event.preventDefault();
        if (!form.title.trim() || !form.message.trim()) return toast.error("Enter both a title and message.");
        if (form.expiry_date && form.expiry_date < form.publish_date) return toast.error("The expiry date cannot be earlier than the publication date.");
        setSaving(true);
        const { files: selectedFiles = [], ...formFields } = form;
        const payload = { ...formFields, title: form.title.trim(), message: form.message.trim(), expiry_date: form.expiry_date || null, attachment_url: form.attachment_url.trim() || null, attachment_name: form.attachment_name.trim() || null };
        try {
            const saved = editingId ? await updateAnnouncement(editingId, payload) : await createAnnouncement(payload);
            if (selectedFiles.length) {
                try {
                    await uploadAnnouncementAttachments(saved.id, selectedFiles);
                    toast.success(editingId ? "Announcement updated with attachments." : "Announcement created with attachments.");
                } catch (uploadError) {
                    toast.error(uploadError?.response?.data?.message || "Announcement saved, but file attachments could not be uploaded.");
                }
            } else {
                toast.success(editingId ? "Announcement updated." : "Announcement created.");
            }
            cancelForm();
            await loadAnnouncements(true, 1);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Could not save this announcement.");
        } finally { setSaving(false); }
    };
    const handleDeactivate = async item => {
        if (!window.confirm("Deactivate \"" + item.title + "\"? It will no longer appear to its audience.")) return;
        try {
            await deactivateAnnouncement(item.id);
            toast.success("Announcement deactivated.");
            await loadAnnouncements(true);
        } catch (error) { toast.error(error?.response?.data?.message || "Could not deactivate this announcement."); }
    };
    const togglePinned = async item => {
        try {
            await setAnnouncementPinned(item.id, !item.is_pinned);
            toast.success(item.is_pinned ? "Announcement unpinned." : "Announcement pinned.");
            await loadAnnouncements(true);
        } catch (error) { toast.error(error?.response?.data?.message || "Could not update pin status."); }
    };
    const markRead = async item => {
        try {
            await markAnnouncementRead(item.id);
            setAnnouncements(old => old.map(x => x.id === item.id ? { ...x, is_read: true } : x));
            setUnreadCount(old => Math.max(0, old - (item.is_read ? 0 : 1)));
        } catch (error) { toast.error(error?.response?.data?.message || "Could not mark this announcement as read."); }
    };
    const applyFilters = () => { setAppliedFilters({ ...filters }); setPage(1); loadAnnouncements(false, 1, { ...filters }); };
    const clearFilters = () => {
        const cleared = { q: "", audience: "", status: "", read: "", pinned: "" };
        setFilters(cleared); setAppliedFilters(cleared); setPage(1); loadAnnouncements(false, 1, cleared);
    };
    const statusFor = item => {
        if (!item.is_active) return ["Inactive", "bg-slate-100 text-slate-600"];
        if (String(item.publish_date || "").slice(0, 10) > today()) return ["Scheduled", "bg-blue-50 text-blue-700"];
        if (item.expiry_date && String(item.expiry_date).slice(0, 10) < today()) return ["Expired", "bg-amber-50 text-amber-700"];
        return ["Published", "bg-emerald-50 text-emerald-700"];
    };
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return <div className="mx-auto w-full min-w-0 space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Megaphone size={24} /></div>
                <div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Announcements</h1><p className="mt-1 text-sm text-slate-500">{canManage ? "Publish and manage notices for your school community." : "School notices and updates intended for you."}</p>
                    {!canManage && <p className="mt-1 text-sm font-semibold text-blue-700">{unreadCount} unread notice{unreadCount === 1 ? "" : "s"}</p>}</div>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={() => loadAnnouncements(true)} disabled={refreshing || loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />Refresh</button>
                {canManage && <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={17} />New announcement</button>}
            </div>
        </header>

        {canManage && <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Matching announcements</p><p className="mt-1 text-2xl font-bold text-slate-900">{total}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Active on this page</p><p className="mt-1 text-2xl font-bold text-emerald-700">{announcements.filter(x => x.is_active).length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Pinned on this page</p><p className="mt-1 text-2xl font-bold text-blue-700">{announcements.filter(x => x.is_pinned).length}</p></div>
        </div>}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-xs font-semibold text-slate-600 lg:col-span-2">Search announcements<div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3"><Search size={16} className="shrink-0 text-slate-400" /><input value={filters.q} onChange={e => setFilters(old => ({ ...old, q: e.target.value }))} onKeyDown={e => e.key === "Enter" && applyFilters()} placeholder="Title or message" className="h-10 w-full bg-transparent text-sm outline-none" /></div></label>
                <label className="text-xs font-semibold text-slate-600">Audience<select value={filters.audience} onChange={e => setFilters(old => ({ ...old, audience: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm"><option value="">All audiences</option>{AUDIENCES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
                <label className="text-xs font-semibold text-slate-600">{canManage ? "Status" : "Read status"}<select value={canManage ? filters.status : filters.read} onChange={e => setFilters(old => ({ ...old, [canManage ? "status" : "read"]: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm">{canManage ? <><option value="">All statuses</option><option value="active">Published</option><option value="scheduled">Scheduled</option><option value="expired">Expired</option><option value="inactive">Inactive</option></> : <><option value="">All notices</option><option value="unread">Unread</option><option value="read">Read</option></>}</select></label>
                <label className="text-xs font-semibold text-slate-600">Pinned<select value={filters.pinned} onChange={e => setFilters(old => ({ ...old, pinned: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm"><option value="">All</option><option value="true">Pinned only</option><option value="false">Not pinned</option></select></label>
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2"><button type="button" onClick={clearFilters} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Clear</button><button type="button" onClick={applyFilters} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Apply filters</button></div>
        </section>

        {canManage && formOpen && <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit announcement" : "Create announcement"}</h2><p className="mt-1 text-sm text-slate-500">Select the audience and optionally narrow the notice to specific classes, arms, or students.</p></div><button type="button" onClick={cancelForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close form"><X size={18} /></button></div>
            <form onSubmit={submitForm} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700 md:col-span-2">Title<input name="title" value={form.title} onChange={updateField} maxLength={200} required placeholder="e.g. Resumption date for the new term" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                    <label className="block text-sm font-medium text-slate-700 md:col-span-2">Message<textarea name="message" value={form.message} onChange={updateField} required rows={5} placeholder="Write the announcement details..." className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                    <label className="block text-sm font-medium text-slate-700">Audience<select name="audience" value={form.audience} onChange={updateField} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{AUDIENCES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
                    <label className="block text-sm font-medium text-slate-700">Publish date<input type="date" name="publish_date" value={form.publish_date} onChange={updateField} required className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
                    <label className="block text-sm font-medium text-slate-700">Expiry date <span className="font-normal text-slate-400">(optional)</span><input type="date" name="expiry_date" value={form.expiry_date} min={form.publish_date} onChange={updateField} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
                    <label className="block text-sm font-medium text-slate-700">Attachment link <span className="font-normal text-slate-400">(optional)</span><input type="url" name="attachment_url" value={form.attachment_url} onChange={updateField} placeholder="https://..." className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /><span className="mt-1 block text-xs font-normal text-slate-500">Paste a share link to a document or file. Upload storage is not configured here.</span></label>
                    <label className="block text-sm font-medium text-slate-700">Attachment label <span className="font-normal text-slate-400">(optional)</span><input name="attachment_name" value={form.attachment_name} onChange={updateField} maxLength={255} placeholder="e.g. School calendar PDF" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
                    <label className="block text-sm font-medium text-slate-700 md:col-span-2">Upload files <span className="font-normal text-slate-400">(optional; PDF, images, text, Word, Excel or PowerPoint; 5 MB max per file)</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={event => {
                        const files = Array.from(event.target.files || []);
                        if (files.length > 5) { toast.error("Select no more than 5 files at a time."); event.target.value = ""; return; }
                        setForm(old => ({ ...old, files }));
                    }} className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:font-semibold file:text-blue-700" />{form.files?.length > 0 && <span className="mt-1 block text-xs text-slate-500">{form.files.length} file(s) selected. Files upload when you save the announcement.</span>}</label>
                    <label className="block text-sm font-medium text-slate-700">Target classes <span className="font-normal text-slate-400">(optional)</span><select multiple name="class_ids" value={form.class_ids.map(String)} onChange={updateField} className="mt-1.5 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm">{targets.classes.map(x => <option key={x.id} value={x.id}>{x.class_name}</option>)}</select><span className="mt-1 block text-xs font-normal text-slate-500">Use Ctrl or Command to select more than one.</span></label>
                    <label className="block text-sm font-medium text-slate-700">Target arms <span className="font-normal text-slate-400">(optional)</span><select multiple name="arm_ids" value={form.arm_ids.map(String)} onChange={updateField} className="mt-1.5 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm">{targets.arms.map(x => <option key={x.id} value={x.id}>{(targets.classes.find(c => c.id === x.class_id)?.class_name || "Class") + " — " + x.arm_name}</option>)}</select><span className="mt-1 block text-xs font-normal text-slate-500">Choose arms only if you want a narrower target.</span></label>
                    <label className="block text-sm font-medium text-slate-700 md:col-span-2">Specific students <span className="font-normal text-slate-400">(optional)</span><select multiple name="student_ids" value={form.student_ids.map(String)} onChange={updateField} className="mt-1.5 min-h-36 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm">{targets.students.map(x => <option key={x.id} value={x.id}>{[x.surname,x.first_name,x.middle_name].filter(Boolean).join(" ") + " — " + (x.class_name || "No class") + (x.arm_name ? " / " + x.arm_name : "") + (x.admission_number ? " (" + x.admission_number + ")" : "")}</option>)}</select><span className="mt-1 block text-xs font-normal text-slate-500">For a parent audience, the selected students' linked parents can also see the notice.</span></label>
                    <label className="block text-sm font-medium text-slate-700 md:col-span-2">Specific parents <span className="font-normal text-slate-400">(optional)</span><select multiple name="parent_ids" value={form.parent_ids.map(String)} onChange={updateField} className="mt-1.5 min-h-32 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm">{(targets.parents || []).map(x => <option key={x.id} value={x.id}>{[x.surname,x.first_name,x.middle_name].filter(Boolean).join(" ") + (x.children_names ? " — Parent of " + x.children_names : "")}</option>)}</select><span className="mt-1 block text-xs font-normal text-slate-500">This targets selected parent accounts directly.</span></label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700"><input type="checkbox" name="is_active" checked={form.is_active} onChange={updateField} className="h-4 w-4 accent-blue-600" /><span><span className="block font-semibold">Active announcement</span><span className="mt-0.5 block text-xs font-normal text-slate-500">Inactive notices are hidden from their audience.</span></span></label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700"><input type="checkbox" name="is_pinned" checked={form.is_pinned} onChange={updateField} className="h-4 w-4 accent-blue-600" /><span><span className="block font-semibold">Pin this notice</span><span className="mt-0.5 block text-xs font-normal text-slate-500">Pinned notices appear before other announcements.</span></span></label>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={cancelForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save size={16} />{saving ? "Saving..." : editingId ? "Save changes" : "Save announcement"}</button></div>
            </form>
        </section>}

        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"><RefreshCw className="mx-auto mb-3 animate-spin text-blue-600" size={24} />Loading announcements...</div>
        : loadError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 shrink-0 text-red-600" size={20} /><div><h2 className="font-semibold text-red-800">Unable to load announcements</h2><p className="mt-1 break-words text-sm text-red-700">{loadError}</p><button type="button" onClick={() => loadAnnouncements()} className="mt-3 text-sm font-semibold text-red-800 underline">Try again</button></div></div></div>
        : announcements.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Bell size={26} /></div><h2 className="mt-4 text-lg font-semibold text-slate-900">{canManage ? "No announcements match" : "No announcements available"}</h2><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{canManage ? "Create a notice or adjust your filters." : "When your school publishes a notice for you, it will appear here."}</p>{canManage && <button type="button" onClick={startCreate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={16} />Create announcement</button>}</div>
        : <div className="space-y-3">{announcements.map(item => {
            const status = statusFor(item);
            return <article key={item.id} className={"rounded-2xl border bg-white p-4 shadow-sm sm:p-5 " + (item.is_read === false ? "border-blue-200" : "border-slate-200")}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Megaphone size={20} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-base font-bold text-slate-900">{item.title}</h2>{item.is_pinned && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><Pin size={12} />Pinned</span>}{canManage && <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + status[1]}>{status[0]}</span>}{!canManage && item.is_read === false && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Unread</span>}</div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.message}</p>{item.attachment_url && <a href={item.attachment_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex max-w-full items-center gap-2 break-all rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"><ExternalLink size={15} />{item.attachment_name || "Open attachment"}</a>}{Array.isArray(item.attachments) && item.attachments.length > 0 && <div className="mt-3 space-y-2">{item.attachments.map(attachment => <div key={attachment.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><Paperclip size={14} className="shrink-0 text-slate-500" /><span className="min-w-0 flex-1 break-all text-sm text-slate-700">{attachment.file_name}</span><button type="button" onClick={() => downloadAnnouncementAttachment(item.id, attachment).catch(error => toast.error(error?.response?.data?.message || "Could not download attachment."))} className="text-xs font-semibold text-blue-700 hover:underline">Download</button>{canManage && <button type="button" onClick={async () => { if (!window.confirm("Delete attachment \"" + attachment.file_name + "\"?")) return; try { await deleteAnnouncementAttachment(item.id, attachment.id); toast.success("Attachment deleted."); await loadAnnouncements(true); } catch (error) { toast.error(error?.response?.data?.message || "Could not delete attachment."); } }} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>}</div>)}</div>}<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />Published {dateLabel(item.publish_date)}</span><span>{canManage ? "Audience: " + audienceLabel(item.audience) : item.expiry_date ? "Expires " + dateLabel(item.expiry_date) : "School announcement"}</span></div></div></div>{canManage ? <div className="flex shrink-0 flex-wrap gap-2 sm:pl-3"><button type="button" onClick={() => togglePinned(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pin size={15} />{item.is_pinned ? "Unpin" : "Pin"}</button><button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Edit3 size={15} />Edit</button>{item.is_active && <button type="button" onClick={() => handleDeactivate(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"><X size={15} />Deactivate</button>}</div> : !item.is_read && <button type="button" onClick={() => markRead(item)} className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><CheckCheck size={15} />Mark read</button>}</div></article>;
        })}</div>}
        {!loading && !loadError && total > 0 && <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}</p><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => loadAnnouncements(false, page - 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-slate-600">Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => loadAnnouncements(false, page + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40">Next</button></div></div>}
        {canManage && <p className="text-xs text-slate-500">Uploaded files are stored in the school database (up to 5 files per announcement, 5 MB each). Shareable links remain available too. Deactivation preserves the record and hides it from audience views.</p>}
    </div>;
}
export default AnnouncementsPage;
