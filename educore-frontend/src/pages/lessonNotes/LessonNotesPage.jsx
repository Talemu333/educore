import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Edit3, FileText, Plus, Send, RotateCcw, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";

const EMPTY = {
    teacher_id: "", class_id: "", subject_id: "", session_id: "", term_id: "", week_number: 1,
    lesson_date: new Date().toISOString().slice(0, 10), topic: "", sub_topic: "", duration: "",
    objectives: "", instructional_materials: "", previous_knowledge: "", introduction: "",
    lesson_development: "", teacher_activities: "", student_activities: "", evaluation: "",
    conclusion: "", assignment: "", references: "", remarks: ""
};

const FIELDS = [
    ["objectives", "Learning Objectives"],
    ["instructional_materials", "Instructional Materials"],
    ["previous_knowledge", "Previous Knowledge"],
    ["introduction", "Introduction"],
    ["lesson_development", "Lesson Development"],
    ["teacher_activities", "Teacher Activities"],
    ["student_activities", "Students' Activities"],
    ["evaluation", "Evaluation"],
    ["conclusion", "Conclusion"],
    ["assignment", "Assignment"],
    ["references", "References"],
    ["remarks", "Remarks"]
];

const labelStatus = status => ({ draft: "Draft", submitted: "Submitted", approved: "Approved", returned: "Returned" }[status] || status);
const statusClass = status => ({ draft: "bg-slate-100 text-slate-600", submitted: "bg-amber-50 text-amber-700", approved: "bg-emerald-50 text-emerald-700", returned: "bg-red-50 text-red-700" }[status] || "bg-slate-100 text-slate-600");

function LessonNotesPage() {
    const { user } = useAuth();
    const isTeacher = user?.role_name === "Teacher";
    const [meta, setMeta] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [filters, setFilters] = useState({ status: "", week_number: "", search: "" });
    const [reviewing, setReviewing] = useState(null);
    const [reviewComment, setReviewComment] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const [metaResponse, notesResponse] = await Promise.all([
                api.get("/lesson-notes/meta"),
                api.get("/lesson-notes")
            ]);
            setMeta(metaResponse.data.data);
            setNotes(notesResponse.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load lesson notes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const assignments = meta?.assignments || [];
    const filteredNotes = useMemo(() => notes.filter(note => {
        if (filters.status && note.status !== filters.status) return false;
        if (filters.week_number && String(note.week_number) !== String(filters.week_number)) return false;
        if (filters.search) {
            const haystack = `${note.topic} ${note.subject_name} ${note.class_name} ${note.teacher_name}`.toLowerCase();
            if (!haystack.includes(filters.search.toLowerCase())) return false;
        }
        return true;
    }), [notes, filters]);

    const openNew = () => {
        setEditing(null);
        setForm({ ...EMPTY, session_id: assignments[0]?.session_id || "", term_id: assignments[0]?.term_id || "", teacher_id: meta?.teacher_id || "" });
        setFormOpen(true);
    };

    const openEdit = note => {
        setEditing(note);
        setForm(Object.fromEntries(Object.keys(EMPTY).map(key => [key, note[key] ?? EMPTY[key]])));
        setFormOpen(true);
    };

    const selectAssignment = assignment => {
        setForm(current => ({
            ...current,
            teacher_id: assignment.teacher_id,
            class_id: assignment.class_id,
            subject_id: assignment.subject_id,
            session_id: assignment.session_id,
            term_id: assignment.term_id
        }));
    };

    const submitForm = async event => {
        event.preventDefault();
        if (!form.topic.trim()) return toast.error("Enter the lesson topic.");
        if (!form.class_id || !form.subject_id || !form.session_id || !form.term_id) return toast.error("Select a valid teaching assignment.");
        setSaving(true);
        try {
            const payload = { ...form, week_number: Number(form.week_number) };
            if (editing) {
                await api.put(`/lesson-notes/${editing.id}`, payload);
                toast.success("Lesson note updated.");
            } else {
                await api.post("/lesson-notes", payload);
                toast.success("Lesson note saved as draft.");
            }
            setFormOpen(false);
            setEditing(null);
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save lesson note.");
        } finally {
            setSaving(false);
        }
    };

    const submitNote = async id => {
        try {
            await api.post(`/lesson-notes/${id}/submit`);
            toast.success("Lesson note submitted for review.");
            await load();
        } catch (error) { toast.error(error.response?.data?.message || "Unable to submit lesson note."); }
    };

    const duplicateNote = async id => {
        try {
            await api.post(`/lesson-notes/${id}/duplicate`);
            toast.success("Lesson note duplicated as a draft.");
            await load();
        } catch (error) { toast.error(error.response?.data?.message || "Unable to duplicate lesson note."); }
    };

    const reviewNote = async action => {
        if (!reviewing) return;
        try {
            await api.post(`/lesson-notes/${reviewing.id}/review`, { action, comment: reviewComment });
            toast.success(action === "approve" ? "Lesson note approved." : "Lesson note returned to the teacher.");
            setReviewing(null);
            setReviewComment("");
            await load();
        } catch (error) { toast.error(error.response?.data?.message || "Unable to review lesson note."); }
    };

    if (loading) return <Loading message="Loading lesson notes..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Lesson Notes"
                description={isTeacher ? "Prepare, submit and track your lesson notes." : "Review and manage lesson notes submitted by teachers."}
                action={<button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" />New Lesson Note</button>}
            />

            <section className="app-surface p-5">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Search topic, subject, class..." className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm" /></div>
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="returned">Returned</option></select>
                    <select value={filters.week_number} onChange={e => setFilters({ ...filters, week_number: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All weeks</option>{Array.from({ length: 13 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}</select>
                </div>
            </section>

            <section className="app-surface overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Lesson Note Records</h2><p className="mt-1 text-sm text-slate-500">{filteredNotes.length} record{filteredNotes.length === 1 ? "" : "s"}</p></div>
                {filteredNotes.length === 0 ? <div className="p-12 text-center"><FileText className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No lesson notes found.</p><p className="mt-1 text-sm text-slate-500">Create a lesson note to get started.</p></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Week / Date</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Class</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Subject</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Topic</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th><th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredNotes.map(note => <tr key={note.id} className="hover:bg-slate-50"><td className="px-5 py-4 text-sm text-slate-600">Week {note.week_number}<div className="text-xs text-slate-400">{note.lesson_date ? String(note.lesson_date).split("T")[0] : "No date"}</div></td><td className="px-5 py-4 text-sm font-medium text-slate-800">{note.class_name}</td><td className="px-5 py-4 text-sm text-slate-700">{note.subject_name}</td><td className="max-w-xs px-5 py-4 text-sm text-slate-700"><div className="truncate" title={note.topic}>{note.topic}</div><div className="text-xs text-slate-400">{note.teacher_name}</div></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(note.status)}`}>{labelStatus(note.status)}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{["draft", "returned"].includes(note.status) && <><button title="Edit" onClick={() => openEdit(note)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button><button title="Submit" onClick={() => submitNote(note.id)} className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"><Send className="h-4 w-4" /></button></>}<button title="Duplicate" onClick={() => duplicateNote(note.id)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><Copy className="h-4 w-4" /></button>{!isTeacher && note.status === "submitted" && <button title="Review" onClick={() => setReviewing(note)} className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"><CheckCircle2 className="h-4 w-4" /></button>}</div></td></tr>)}</tbody></table></div>}
            </section>

            {formOpen && <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/50 p-4"><div className="mx-auto my-6 max-w-5xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Lesson Note" : "New Lesson Note"}</h2><p className="text-sm text-slate-500">Saved first as a draft.</p></div><button onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={submitForm} className="space-y-5 p-6">
                {!isTeacher && <div><label className="mb-1 block text-sm font-medium">Teaching Assignment</label><select required value={`${form.teacher_id}|${form.class_id}|${form.subject_id}|${form.session_id}|${form.term_id}`} onChange={e => { const a = assignments.find(x => `${x.teacher_id}|${x.class_id}|${x.subject_id}|${x.session_id}|${x.term_id}` === e.target.value); if (a) selectAssignment(a); }} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select teacher / class / subject</option>{assignments.map((a, i) => <option key={`${a.teacher_id}-${a.class_id}-${a.subject_id}-${a.session_id}-${a.term_id}-${i}`} value={`${a.teacher_id}|${a.class_id}|${a.subject_id}|${a.session_id}|${a.term_id}`}>{a.teacher_name} — {a.class_name} — {a.subject_name} — {a.session_name} / {a.term_name}</option>)}</select></div>}
                {isTeacher && <div className="grid gap-4 md:grid-cols-2"><div><label className="mb-1 block text-sm font-medium">Teaching Assignment</label><select required value={`${form.class_id}|${form.subject_id}|${form.session_id}|${form.term_id}`} onChange={e => { const a = assignments.find(x => `${x.class_id}|${x.subject_id}|${x.session_id}|${x.term_id}` === e.target.value); if (a) selectAssignment(a); }} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select class / subject</option>{assignments.map((a, i) => <option key={`${a.class_id}-${a.subject_id}-${a.session_id}-${a.term_id}-${i}`} value={`${a.class_id}|${a.subject_id}|${a.session_id}|${a.term_id}`}>{a.class_name} — {a.subject_name} — {a.session_name} / {a.term_name}</option>)}</select></div></div>}
                <div className="grid gap-4 md:grid-cols-4"><div><label className="mb-1 block text-sm font-medium">Week</label><input type="number" min="1" max="52" value={form.week_number} onChange={e => setForm({ ...form, week_number: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><div><label className="mb-1 block text-sm font-medium">Lesson Date</label><input type="date" value={form.lesson_date || ""} onChange={e => setForm({ ...form, lesson_date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><div><label className="mb-1 block text-sm font-medium">Duration</label><input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 40 minutes" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><div><label className="mb-1 block text-sm font-medium">Topic</label><input required value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div></div>
                <div><label className="mb-1 block text-sm font-medium">Sub-topic</label><input value={form.sub_topic} onChange={e => setForm({ ...form, sub_topic: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div>
                <div className="grid gap-4 md:grid-cols-2">{FIELDS.map(([key, label]) => <div key={key}><label className="mb-1 block text-sm font-medium">{label}</label><textarea rows={key === "lesson_development" ? 6 : 4} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div>)}</div>
                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={saving} type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editing ? "Save Changes" : "Save Draft"}</button></div>
            </form></div></div>}

            {reviewing && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Review Lesson Note</h2><p className="mt-1 text-sm text-slate-500">{reviewing.subject_name} · {reviewing.class_name} · Week {reviewing.week_number}</p></div><button onClick={() => setReviewing(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-500">Topic</p><p className="mt-1 font-semibold text-slate-900">{reviewing.topic}</p></div><label className="mt-5 block text-sm font-medium">Review comment</label><textarea rows={5} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Optional for approval; required when returning..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /><div className="mt-5 flex justify-end gap-3"><button onClick={() => reviewNote("return")} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><RotateCcw className="h-4 w-4" />Return</button><button onClick={() => reviewNote("approve")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4" />Approve</button></div></div></div>}
        </div>
    );
}

export default LessonNotesPage;
