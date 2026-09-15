import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Edit3, Eye, FileText, Plus, Search, Send, X } from "lucide-react";
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
    ["objectives", "Learning Objectives"], ["instructional_materials", "Instructional Materials"],
    ["previous_knowledge", "Previous Knowledge"], ["introduction", "Introduction"],
    ["lesson_development", "Lesson Development"], ["teacher_activities", "Teacher Activities"],
    ["student_activities", "Students' Activities"], ["evaluation", "Evaluation"],
    ["conclusion", "Conclusion"], ["assignment", "Assignment"], ["references", "References"], ["remarks", "Remarks"]
];

const labelStatus = status => ({ draft: "Draft", submitted: "Submitted", approved: "Approved", returned: "Returned" }[status] || status);
const statusClass = status => ({ draft: "bg-slate-100 text-slate-600", submitted: "bg-amber-50 text-amber-700", approved: "bg-emerald-50 text-emerald-700", returned: "bg-red-50 text-red-700" }[status] || "bg-slate-100 text-slate-600");

function LessonNotesPage() {
    const { user } = useAuth();
    const isTeacher = user?.role_name === "Teacher";
    const [meta, setMeta] = useState(null);
    const [notes, setNotes] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [filters, setFilters] = useState({ teacher_id: "", class_id: "", subject_id: "", session_id: "", term_id: "", status: "", week_number: "", search: "" });
    const [selectedNote, setSelectedNote] = useState(null);
    const [reviewing, setReviewing] = useState(null);
    const [reviewComment, setReviewComment] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const [metaResponse, notesResponse] = await Promise.all([api.get("/lesson-notes/meta"), api.get("/lesson-notes")]);
            setMeta(metaResponse.data.data);
            setNotes(notesResponse.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load lesson notes.");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const assignments = meta?.assignments || [];
    const sessions = meta?.sessions || [];
    const terms = meta?.terms || [];
    const filterOptions = useMemo(() => ({
        teachers: [...new Map(assignments.map(a => [a.teacher_id, a.teacher_name])).entries()],
        classes: [...new Map(assignments.map(a => [a.class_id, a.class_name])).entries()],
        subjects: [...new Map(assignments.map(a => [a.subject_id, a.subject_name])).entries()]
    }), [assignments]);

    const filteredNotes = useMemo(() => notes.filter(note => {
        if (filters.teacher_id && String(note.teacher_id) !== String(filters.teacher_id)) return false;
        if (filters.class_id && String(note.class_id) !== String(filters.class_id)) return false;
        if (filters.subject_id && String(note.subject_id) !== String(filters.subject_id)) return false;
        if (filters.session_id && String(note.session_id) !== String(filters.session_id)) return false;
        if (filters.term_id && String(note.term_id) !== String(filters.term_id)) return false;
        if (filters.status && note.status !== filters.status) return false;
        if (filters.week_number && String(note.week_number) !== String(filters.week_number)) return false;
        if (filters.search) {
            const haystack = `${note.topic} ${note.sub_topic || ""} ${note.subject_name} ${note.class_name} ${note.teacher_name}`.toLowerCase();
            if (!haystack.includes(filters.search.toLowerCase())) return false;
        }
        return true;
    }), [notes, filters]);

    const loadTopics = async values => {
        if (!values.session_id || !values.term_id || !values.class_id || !values.subject_id || !values.week_number) { setTopics([]); return; }
        setTopicsLoading(true);
        try {
            const response = await api.get("/lesson-notes/topics", { params: { session_id: values.session_id, term_id: values.term_id, class_id: values.class_id, subject_id: values.subject_id, week_number: Number(values.week_number) } });
            setTopics(response.data.data || []);
        } catch (error) {
            setTopics([]);
            toast.error(error.response?.data?.message || "Unable to load syllabus topics.");
        } finally { setTopicsLoading(false); }
    };

    useEffect(() => { if (formOpen) loadTopics(form); }, [formOpen, form.session_id, form.term_id, form.class_id, form.subject_id, form.week_number]);

    const openNew = () => {
        setEditing(null); setTopics([]);
        setForm({ ...EMPTY, session_id: assignments[0]?.session_id || "", term_id: assignments[0]?.term_id || "", teacher_id: meta?.teacher_id || "" });
        setFormOpen(true);
    };

    const openEdit = note => {
        setEditing(note);
        setForm(Object.fromEntries(Object.keys(EMPTY).map(key => [key, note[key] ?? EMPTY[key]])));
        setFormOpen(true);
    };

    const selectAssignment = assignment => setForm(current => ({ ...current, teacher_id: assignment.teacher_id, class_id: assignment.class_id, subject_id: assignment.subject_id, session_id: assignment.session_id, term_id: assignment.term_id, topic: "", sub_topic: "" }));
    const selectTopic = topic => setForm(current => ({ ...current, topic: topic.topic, sub_topic: topic.sub_topic || "" }));

    const submitForm = async event => {
        event.preventDefault();
        if (!form.class_id || !form.subject_id || !form.session_id || !form.term_id) return toast.error("Select a valid teaching assignment.");
        if (!form.topic.trim()) return toast.error("Select or enter a lesson topic.");
        if (isTeacher && !topics.some(topic => topic.topic === form.topic)) return toast.error("Select a topic from the syllabus for this week.");
        setSaving(true);
        try {
            const payload = { ...form, week_number: Number(form.week_number) };
            if (editing) { await api.put(`/lesson-notes/${editing.id}`, payload); toast.success("Lesson note updated."); }
            else { await api.post("/lesson-notes", payload); toast.success("Lesson note saved as draft."); }
            setFormOpen(false); setEditing(null); await load();
        } catch (error) { toast.error(error.response?.data?.message || "Unable to save lesson note."); }
        finally { setSaving(false); }
    };

    const submitNote = async id => {
        try { await api.post(`/lesson-notes/${id}/submit`); toast.success("Lesson note submitted for review."); await load(); }
        catch (error) { toast.error(error.response?.data?.message || "Unable to submit lesson note."); }
    };

    const duplicateNote = async id => {
        try { await api.post(`/lesson-notes/${id}/duplicate`); toast.success("Lesson note duplicated as a draft."); await load(); }
        catch (error) { toast.error(error.response?.data?.message || "Unable to duplicate lesson note."); }
    };

    const reviewNote = async action => {
        if (!reviewing) return;
        try {
            await api.post(`/lesson-notes/${reviewing.id}/review`, { action, comment: reviewComment });
            toast.success(action === "approve" ? "Lesson note approved." : "Lesson note returned to the teacher.");
            setReviewing(null); setReviewComment(""); setSelectedNote(null); await load();
        } catch (error) { toast.error(error.response?.data?.message || "Unable to review lesson note."); }
    };

    const resetFilters = () => setFilters({ teacher_id: "", class_id: "", subject_id: "", session_id: "", term_id: "", status: "", week_number: "", search: "" });

    if (loading) return <Loading message="Loading lesson notes..." />;

    return (
        <div className="space-y-6">
            <PageHeader title="Lesson Notes" description={isTeacher ? "Prepare, submit and track your lesson notes." : "View, review and manage lesson notes submitted by teachers."} action={<button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" />New Lesson Note</button>} />

            <section className="app-surface p-5">
                <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">{isTeacher ? "My Lesson Notes" : "Lesson Note Filters"}</h2><button type="button" onClick={resetFilters} className="text-sm font-medium text-blue-600 hover:text-blue-700">Clear filters</button></div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative lg:col-span-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Search teacher, topic, subject or class..." className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm" /></div>
                    {!isTeacher && <select value={filters.teacher_id} onChange={e => setFilters({ ...filters, teacher_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All teachers</option>{filterOptions.teachers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>}
                    <select value={filters.class_id} onChange={e => setFilters({ ...filters, class_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All classes</option>{filterOptions.classes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
                    <select value={filters.subject_id} onChange={e => setFilters({ ...filters, subject_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All subjects</option>{filterOptions.subjects.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
                    <select value={filters.session_id} onChange={e => setFilters({ ...filters, session_id: e.target.value, term_id: "" })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All sessions</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.session_name}</option>)}</select>
                    <select value={filters.term_id} onChange={e => setFilters({ ...filters, term_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All terms</option>{terms.filter(t => !filters.session_id || String(t.session_id) === String(filters.session_id)).map(t => <option key={t.id} value={t.id}>{t.term_name}</option>)}</select>
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="returned">Returned</option></select>
                    <select value={filters.week_number} onChange={e => setFilters({ ...filters, week_number: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All weeks</option>{Array.from({ length: 52 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}</select>
                </div>
            </section>

            <section className="app-surface overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Lesson Note Records</h2><p className="mt-1 text-sm text-slate-500">{filteredNotes.length} record{filteredNotes.length === 1 ? "" : "s"}</p></div>
                {filteredNotes.length === 0 ? <div className="p-12 text-center"><FileText className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No lesson notes found.</p><p className="mt-1 text-sm text-slate-500">Adjust the filters or create a lesson note to get started.</p></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{["Teacher", "Week / Date", "Class", "Subject", "Topic", "Status", "Actions"].map((header, index) => <th key={header} className={`${index === 6 ? "text-right" : "text-left"} px-5 py-3 text-xs font-semibold uppercase text-slate-500`}>{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredNotes.map(note => <tr key={note.id} className="hover:bg-slate-50"><td className="px-5 py-4 text-sm font-medium text-slate-800">{note.teacher_name}</td><td className="px-5 py-4 text-sm text-slate-600">Week {note.week_number}<div className="text-xs text-slate-400">{note.lesson_date ? String(note.lesson_date).split("T")[0] : "No date"}</div></td><td className="px-5 py-4 text-sm text-slate-700">{note.class_name}</td><td className="px-5 py-4 text-sm text-slate-700">{note.subject_name}</td><td className="max-w-xs px-5 py-4 text-sm text-slate-700"><div className="truncate" title={note.topic}>{note.topic}</div>{note.sub_topic && <div className="truncate text-xs text-slate-400">{note.sub_topic}</div>}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(note.status)}`}>{labelStatus(note.status)}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button title="View lesson note" onClick={() => setSelectedNote(note)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><Eye className="h-4 w-4" /></button>{["draft", "returned"].includes(note.status) && <><button title="Edit" onClick={() => openEdit(note)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button><button title="Submit" onClick={() => submitNote(note.id)} className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"><Send className="h-4 w-4" /></button></>}<button title="Duplicate" onClick={() => duplicateNote(note.id)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><Copy className="h-4 w-4" /></button>{!isTeacher && note.status === "submitted" && <button title="Review" onClick={() => { setSelectedNote(note); setReviewing(note); }} className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"><CheckCircle2 className="h-4 w-4" /></button>}</div></td></tr>)}</tbody></table></div>}
            </section>

            {selectedNote && <div className="fixed inset-0 z-[75] overflow-y-auto bg-slate-950/60 p-4"><div className="mx-auto my-6 max-w-5xl rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"><div><h2 className="text-lg font-bold text-slate-900">Lesson Note</h2><p className="text-sm text-slate-500">{selectedNote.topic}{selectedNote.sub_topic ? ` • ${selectedNote.sub_topic}` : ""}</p></div><button type="button" onClick={() => setSelectedNote(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="space-y-6 p-6"><div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-semibold uppercase text-slate-400">Teacher</p><p className="mt-1 text-sm font-medium text-slate-800">{selectedNote.teacher_name}</p></div><div><p className="text-xs font-semibold uppercase text-slate-400">Class</p><p className="mt-1 text-sm font-medium text-slate-800">{selectedNote.class_name}</p></div><div><p className="text-xs font-semibold uppercase text-slate-400">Subject</p><p className="mt-1 text-sm font-medium text-slate-800">{selectedNote.subject_name}</p></div><div><p className="text-xs font-semibold uppercase text-slate-400">Session / Term</p><p className="mt-1 text-sm font-medium text-slate-800">{selectedNote.session_name} / {selectedNote.term_name}</p></div><div><p className="text-xs font-semibold uppercase text-slate-400">Week</p><p className="mt-1 text-sm font-medium text-slate-800">Week {selectedNote.week_number}</p></div><div><p className="text-xs font-semibold uppercase text-slate-400">Lesson Date</p><p className="mt-1 text-sm font-medium text-slate-800">{selectedNote.lesson_date ? String(selectedNote.lesson_date).split("T")[0] : "No date"}</p></div><div><p className="text-xs font-semibold uppercase text-slate-400">Duration</p><p className="mt-1 text-sm font-medium text-slate-800">{selectedNote.duration || "Not specified"}</p></div><div><p className="text-xs font-semibold uppercase text-slate-400">Status</p><span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(selectedNote.status)}`}>{labelStatus(selectedNote.status)}</span></div></div><div><h3 className="text-base font-bold text-slate-900">{selectedNote.topic}</h3>{selectedNote.sub_topic && <p className="mt-1 text-sm text-slate-500">Sub-topic: {selectedNote.sub_topic}</p>}</div><div className="grid gap-5 md:grid-cols-2">{FIELDS.map(([key, label]) => <div key={key} className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-700">{label}</p><div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedNote[key] || <span className="italic text-slate-300">Not provided</span>}</div></div>)}</div>{selectedNote.review_comment && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-900">Review Comment</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-amber-800">{selectedNote.review_comment}</p>{selectedNote.reviewer_name && <p className="mt-2 text-xs text-amber-700">Reviewed by {selectedNote.reviewer_name}</p>}</div>}<div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">{!isTeacher && selectedNote.status === "submitted" && <button type="button" onClick={() => { setReviewing(selectedNote); setReviewComment(""); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><CheckCircle2 className="h-4 w-4" />Review Lesson Note</button>}<button type="button" onClick={() => setSelectedNote(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button></div></div></div></div>}

            {reviewing && <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/60 p-4"><div className="mx-auto my-20 max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="text-lg font-bold text-slate-900">Review Lesson Note</h2><p className="text-sm text-slate-500">{reviewing.teacher_name} • {reviewing.topic}</p></div><button type="button" onClick={() => setReviewing(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="space-y-4 p-6"><p className="text-sm text-slate-600">Add a comment for the teacher. A comment is recommended when returning a note.</p><textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={5} placeholder="Enter review comment..." className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /><div className="flex justify-end gap-3"><button type="button" onClick={() => setReviewing(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={() => reviewNote("return")} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Return to Teacher</button><button type="button" onClick={() => reviewNote("approve")} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Approve</button></div></div></div></div>}

            {formOpen && <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/50 p-4"><div className="mx-auto my-6 max-w-5xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Lesson Note" : "New Lesson Note"}</h2><p className="text-sm text-slate-500">Saved first as a draft.</p></div><button onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={submitForm} className="space-y-5 p-6">
                {!isTeacher && <div><label className="mb-1 block text-sm font-medium text-slate-700">Teaching Assignment</label><select required value={`${form.teacher_id}|${form.class_id}|${form.subject_id}|${form.session_id}|${form.term_id}`} onChange={e => { const assignment = assignments.find(item => `${item.teacher_id}|${item.class_id}|${item.subject_id}|${item.session_id}|${item.term_id}` === e.target.value); if (assignment) selectAssignment(assignment); }} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select teacher / class / subject</option>{assignments.map((assignment, index) => <option key={`${assignment.teacher_id}-${assignment.class_id}-${assignment.subject_id}-${assignment.session_id}-${assignment.term_id}-${index}`} value={`${assignment.teacher_id}|${assignment.class_id}|${assignment.subject_id}|${assignment.session_id}|${assignment.term_id}`}>{assignment.teacher_name} — {assignment.class_name} — {assignment.subject_name} — {assignment.session_name} / {assignment.term_name}</option>)}</select></div>}
                {isTeacher && <div><label className="mb-1 block text-sm font-medium text-slate-700">Teaching Assignment</label><select required value={`${form.class_id}|${form.subject_id}|${form.session_id}|${form.term_id}`} onChange={e => { const assignment = assignments.find(item => `${item.class_id}|${item.subject_id}|${item.session_id}|${item.term_id}` === e.target.value); if (assignment) selectAssignment(assignment); }} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select class / subject</option>{assignments.map((assignment, index) => <option key={`${assignment.class_id}-${assignment.subject_id}-${assignment.session_id}-${assignment.term_id}-${index}`} value={`${assignment.class_id}|${assignment.subject_id}|${assignment.session_id}|${assignment.term_id}`}>{assignment.class_name} — {assignment.subject_name} — {assignment.session_name} / {assignment.term_name}</option>)}</select></div>}
                <div className="grid gap-4 md:grid-cols-4"><div><label className="mb-1 block text-sm font-medium text-slate-700">Week</label><input required type="number" min="1" max="52" value={form.week_number} onChange={e => setForm({ ...form, week_number: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><div><label className="mb-1 block text-sm font-medium text-slate-700">Lesson Date</label><input type="date" value={form.lesson_date} onChange={e => setForm({ ...form, lesson_date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><div><label className="mb-1 block text-sm font-medium text-slate-700">Duration</label><input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 40 minutes" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><div><label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>{isTeacher ? <select required value={form.topic} disabled={topicsLoading} onChange={e => { const topic = topics.find(item => item.topic === e.target.value); if (topic) selectTopic(topic); }} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">{topicsLoading ? "Loading syllabus topics..." : topics.length ? "Select syllabus topic" : "No syllabus topic"}</option>{topics.map(topic => <option key={topic.id} value={topic.topic}>{topic.topic}{topic.sub_topic ? ` — ${topic.sub_topic}` : ""}</option>)}</select> : <input required value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Enter lesson topic" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />}</div></div>
                {form.sub_topic && <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">Sub-topic: <span className="font-medium">{form.sub_topic}</span></div>}
                <div className="grid gap-4 md:grid-cols-2">{FIELDS.map(([key, label]) => <div key={key}><label className="mb-1 block text-sm font-medium text-slate-700">{label}</label><textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} rows={key === "lesson_development" || key === "teacher_activities" || key === "student_activities" ? 5 : 3} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div>)}</div>
                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={saving} type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : editing ? "Update Lesson Note" : "Save Draft"}</button></div>
            </form></div></div>}
        </div>
    );
}

export default LessonNotesPage;
