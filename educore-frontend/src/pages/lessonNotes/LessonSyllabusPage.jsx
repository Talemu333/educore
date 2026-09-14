import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronRight, Edit3, FileText, Plus, Printer, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";

const EMPTY = { session_id: "", term_id: "", class_id: "", subject_id: "", week_number: 1, topic: "", sub_topic: "", sort_order: 0 };

const NOTE_FIELDS = [
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

function LessonSyllabusPage() {
    const { user } = useAuth();
    const isAdmin = user?.role_name === "Admin";
    const [meta, setMeta] = useState(null);
    const [topics, setTopics] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [topicFormOpen, setTopicFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [filters, setFilters] = useState({ session_id: "", term_id: "", class_id: "", subject_id: "" });
    const [saving, setSaving] = useState(false);

    const assignments = meta?.assignments || [];
    const sessions = meta?.sessions || [];
    const terms = meta?.terms || [];

    const availableAssignments = useMemo(() => {
        if (!isAdmin) return assignments;
        return assignments;
    }, [assignments, isAdmin]);

    const loadMeta = async () => {
        const response = await api.get("/lesson-notes/meta");
        setMeta(response.data.data);
    };

    const loadTopics = async () => {
        const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
        const response = await api.get("/lesson-notes/topics", { params });
        setTopics(response.data.data || []);
    };

    const load = async () => {
        setLoading(true);
        try {
            await loadMeta();
            await loadTopics();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load syllabus topics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => {
        if (!loading) loadTopics().catch(error => toast.error(error.response?.data?.message || "Unable to load topics."));
    }, [filters.session_id, filters.term_id, filters.class_id, filters.subject_id]);

    const openTopic = async topic => {
        setSelectedTopic(topic);
        try {
            const response = await api.get("/lesson-notes", {
                params: {
                    session_id: topic.session_id,
                    term_id: topic.term_id,
                    class_id: topic.class_id,
                    subject_id: topic.subject_id,
                    week_number: topic.week_number,
                    search: topic.topic
                }
            });
            const all = response.data.data || [];
            setNotes(all.filter(note => note.topic?.trim().toLowerCase() === topic.topic.trim().toLowerCase()));
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load lesson notes for this topic.");
        }
    };

    const openNew = () => {
        const first = availableAssignments[0];
        setEditing(null);
        setForm({
            ...EMPTY,
            session_id: first?.session_id || "",
            term_id: first?.term_id || "",
            class_id: first?.class_id || "",
            subject_id: first?.subject_id || ""
        });
        setTopicFormOpen(true);
    };

    const openEdit = topic => {
        setEditing(topic);
        setForm({
            session_id: topic.session_id,
            term_id: topic.term_id,
            class_id: topic.class_id,
            subject_id: topic.subject_id,
            week_number: topic.week_number,
            topic: topic.topic,
            sub_topic: topic.sub_topic || "",
            sort_order: topic.sort_order || 0
        });
        setTopicFormOpen(true);
    };

    const saveTopic = async event => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, week_number: Number(form.week_number), sort_order: Number(form.sort_order || 0) };
            if (editing) {
                await api.put(`/lesson-notes/topics/${editing.id}`, payload);
                toast.success("Syllabus topic updated.");
            } else {
                await api.post("/lesson-notes/topics", payload);
                toast.success("Syllabus topic added.");
            }
            setTopicFormOpen(false);
            setEditing(null);
            await loadTopics();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save syllabus topic.");
        } finally {
            setSaving(false);
        }
    };

    const deleteTopic = async topic => {
        if (!window.confirm(`Delete the syllabus topic "${topic.topic}"?`)) return;
        try {
            await api.delete(`/lesson-notes/topics/${topic.id}`);
            toast.success("Syllabus topic deleted.");
            if (selectedTopic?.id === topic.id) {
                setSelectedTopic(null);
                setNotes([]);
            }
            await loadTopics();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to delete syllabus topic.");
        }
    };

    const termOptions = sessions.length ? terms.filter(term => !filters.session_id || String(term.session_id) === String(filters.session_id)) : terms;

    if (loading) return <Loading message="Loading syllabus topics..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Lesson Syllabus"
                description="Organize syllabus topics by subject, class, term and week, then open the lesson notes attached to each topic."
                action={isAdmin ? <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" />Add Topic</button> : null}
            />

            <section className="app-surface p-5">
                <div className="grid gap-3 md:grid-cols-4">
                    <select value={filters.session_id} onChange={e => setFilters({ ...filters, session_id: e.target.value, term_id: "" })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All sessions</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.session_name}</option>)}</select>
                    <select value={filters.term_id} onChange={e => setFilters({ ...filters, term_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All terms</option>{termOptions.map(t => <option key={t.id} value={t.id}>{t.term_name}</option>)}</select>
                    <select value={filters.class_id} onChange={e => setFilters({ ...filters, class_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All classes</option>{[...new Map(assignments.map(a => [a.class_id, a.class_name])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
                    <select value={filters.subject_id} onChange={e => setFilters({ ...filters, subject_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All subjects</option>{[...new Map(assignments.map(a => [a.subject_id, a.subject_name])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <section className="app-surface overflow-hidden">
                    <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Syllabus Topics</h2><p className="mt-1 text-sm text-slate-500">{topics.length} topic{topics.length === 1 ? "" : "s"}</p></div>
                    {topics.length === 0 ? <div className="p-10 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No syllabus topics found.</p><p className="mt-1 text-sm text-slate-500">{isAdmin ? "Add topics for the school's subjects and classes." : "Ask your administrator to add the syllabus topics."}</p></div> : <div className="divide-y divide-slate-100">{topics.map(topic => <button key={topic.id} type="button" onClick={() => openTopic(topic)} className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 ${selectedTopic?.id === topic.id ? "bg-blue-50" : ""}`}><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-400">W{topic.week_number}</span><p className="truncate font-semibold text-slate-800">{topic.topic}</p></div><p className="mt-1 truncate text-xs text-slate-500">{topic.class_name} • {topic.subject_name} • {topic.term_name}</p>{topic.sub_topic && <p className="mt-1 truncate text-xs text-slate-400">{topic.sub_topic}</p>}</div><div className="flex shrink-0 items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{topic.lesson_note_count} note{topic.lesson_note_count === 1 ? "" : "s"}</span>{isAdmin && <><span onClick={e => { e.stopPropagation(); openEdit(topic); }} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white"><Edit3 className="h-4 w-4" /></span><span onClick={e => { e.stopPropagation(); deleteTopic(topic); }} className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></span></>}<ChevronRight className="h-4 w-4 text-slate-400" /></div></button>)}</div>}
                </section>

                <section className="app-surface overflow-hidden">
                    <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Lesson Notes</h2><p className="mt-1 text-sm text-slate-500">{selectedTopic ? `${selectedTopic.topic} • Week ${selectedTopic.week_number}` : "Select a syllabus topic."}</p></div>
                    {!selectedTopic ? <div className="p-10 text-center"><FileText className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Select a topic to view its lesson notes.</p></div> : notes.length === 0 ? <div className="p-10 text-center"><FileText className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No lesson note has been created for this topic yet.</p><p className="mt-1 text-sm text-slate-500">Open Lesson Notes to create one using this topic.</p></div> : <div className="divide-y divide-slate-100">{notes.map(note => <button key={note.id} type="button" onClick={() => setSelectedNote(note)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"><div className="min-w-0"><p className="font-semibold text-slate-800">{note.sub_topic || note.topic}</p><p className="mt-1 text-xs text-slate-500">{note.class_name} • {note.subject_name} • {note.teacher_name}</p><p className="mt-1 text-xs text-slate-400">{note.lesson_date ? String(note.lesson_date).split("T")[0] : "No date"} • {note.status}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-slate-400" /></button>)}</div>}
                </section>
            </div>

            {topicFormOpen && <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/50 p-4"><div className="mx-auto my-6 max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Syllabus Topic" : "Add Syllabus Topic"}</h2><p className="text-sm text-slate-500">Define the topic teachers will use when preparing lesson notes.</p></div><button onClick={() => setTopicFormOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={saveTopic} className="space-y-4 p-6"><div className="grid gap-4 md:grid-cols-2"><select required value={form.session_id} onChange={e => setForm({ ...form, session_id: e.target.value, term_id: "" })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select session</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.session_name}</option>)}</select><select required value={form.term_id} onChange={e => setForm({ ...form, term_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select term</option>{terms.filter(t => !form.session_id || String(t.session_id) === String(form.session_id)).map(t => <option key={t.id} value={t.id}>{t.term_name}</option>)}</select><select required value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select class</option>{[...new Map(assignments.map(a => [a.class_id, a.class_name])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select><select required value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Select subject</option>{[...new Map(assignments.map(a => [a.subject_id, a.subject_name])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div><div className="grid gap-4 md:grid-cols-2"><input required type="number" min="1" max="52" value={form.week_number} onChange={e => setForm({ ...form, week_number: e.target.value })} placeholder="Week" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /><input type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} placeholder="Order" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><input required value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Topic" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /><input value={form.sub_topic} onChange={e => setForm({ ...form, sub_topic: e.target.value })} placeholder="Sub-topic (optional)" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /><div className="flex justify-end gap-3"><button type="button" onClick={() => setTopicFormOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={saving} type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editing ? "Update Topic" : "Add Topic"}</button></div></form></div></div>}

            {selectedNote && <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/60 p-4"><div className="mx-auto my-6 max-w-4xl rounded-2xl bg-white shadow-2xl"><div className="print:hidden flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="text-lg font-bold text-slate-900">Lesson Note</h2><p className="text-sm text-slate-500">{selectedNote.class_name} • {selectedNote.subject_name} • Week {selectedNote.week_number}</p></div><div className="flex gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"><Printer className="h-4 w-4" />Print / Save PDF</button><button onClick={() => setSelectedNote(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div></div><article className="p-8"><header className="border-b border-slate-200 pb-5"><h1 className="text-2xl font-bold text-slate-900">{selectedNote.topic}</h1>{selectedNote.sub_topic && <p className="mt-1 text-base text-slate-600">{selectedNote.sub_topic}</p>}<div className="mt-3 text-sm text-slate-500">{selectedNote.class_name} • {selectedNote.subject_name} • Week {selectedNote.week_number} • {selectedNote.lesson_date ? String(selectedNote.lesson_date).split("T")[0] : ""}</div></header><div className="mt-6 grid gap-6">{NOTE_FIELDS.map(([key, label]) => selectedNote[key] ? <section key={key}><h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</h3><div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedNote[key]}</div></section> : null)}</div></article></div></div>}
        </div>
    );
}

export default LessonSyllabusPage;
