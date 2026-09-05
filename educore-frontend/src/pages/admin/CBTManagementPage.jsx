import { useEffect, useState } from "react";
import { BookOpen, Edit3, FilePlus2, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const emptyExam = {
    title: "", description: "", subject_id: "", class_id: "", arm_id: "",
    duration_minutes: 30, total_marks: 0, pass_mark: 50, max_attempts: 1,
    randomize_questions: false, randomize_options: false,
    show_result_immediately: true, starts_at: "", ends_at: "", status: "draft"
};

const emptyQuestion = { question_text: "", image_url: "", marks: 1, question_order: 1, explanation: "", options: [
    { option_text: "", option_order: 1, is_correct: true },
    { option_text: "", option_order: 2, is_correct: false },
    { option_text: "", option_order: 3, is_correct: false },
    { option_text: "", option_order: 4, is_correct: false }
] };

function CBTManagementPage() {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [arms, setArms] = useState([]);
    const [exam, setExam] = useState(emptyExam);
    const [question, setQuestion] = useState(emptyQuestion);
    const [editingId, setEditingId] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [examRes, subjectRes, classRes] = await Promise.all([
                api.get("/cbt/exams"), api.get("/subjects"), api.get("/classes")
            ]);
            setExams(examRes.data?.data || []);
            setSubjects(subjectRes.data?.data || []);
            setClasses(classRes.data?.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load CBT management data.");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const loadArms = async (classId) => {
        setExam((v) => ({ ...v, class_id: classId, arm_id: "" }));
        if (!classId) return setArms([]);
        try {
            const response = await api.get(`/classes/${classId}/arms`);
            setArms(response.data?.data || []);
        } catch { setArms([]); }
    };

    const saveExam = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            if (editingId) await api.put(`/cbt/exams/${editingId}`, exam);
            else await api.post("/cbt/exams", exam);
            toast.success(editingId ? "CBT examination updated." : "CBT examination created.");
            setExam(emptyExam); setEditingId(null); await load();
        } catch (error) { toast.error(error.response?.data?.message || "Unable to save examination."); }
        finally { setSaving(false); }
    };

    const editExam = async (item) => {
        setEditingId(item.id);
        setExam({ ...emptyExam, ...item, subject_id: item.subject_id || "", class_id: item.class_id || "", arm_id: item.arm_id || "", starts_at: item.starts_at ? item.starts_at.slice(0, 16) : "", ends_at: item.ends_at ? item.ends_at.slice(0, 16) : "" });
        if (item.class_id) {
            try { const response = await api.get(`/classes/${item.class_id}/arms`); setArms(response.data?.data || []); } catch { setArms([]); }
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteExam = async (id) => {
        if (!window.confirm("Delete this examination and its questions?")) return;
        try { await api.delete(`/cbt/exams/${id}`); toast.success("Examination deleted."); if (selectedExam?.id === id) setSelectedExam(null); await load(); }
        catch (error) { toast.error(error.response?.data?.message || "Unable to delete examination."); }
    };

    const openQuestions = async (item) => {
        try {
            const response = await api.get(`/cbt/exams/${item.id}`);
            setSelectedExam(response.data?.data || null);
            setQuestion({ ...emptyQuestion, question_order: (response.data?.data?.questions?.length || 0) + 1 });
        } catch (error) { toast.error(error.response?.data?.message || "Unable to load questions."); }
    };

    const saveQuestion = async (event) => {
        event.preventDefault();
        if (!selectedExam) return;
        if (question.options.filter((o) => o.is_correct).length !== 1) return toast.error("Select exactly one correct option.");
        if (question.options.some((o) => !o.option_text.trim())) return toast.error("All four options are required.");
        setSaving(true);
        try {
            await api.post(`/cbt/exams/${selectedExam.id}/questions`, question);
            toast.success("Question added.");
            await openQuestions(selectedExam);
        } catch (error) { toast.error(error.response?.data?.message || "Unable to add question."); }
        finally { setSaving(false); }
    };

    const setOption = (index, field, value) => setQuestion((q) => ({ ...q, options: q.options.map((o, i) => i === index ? { ...o, [field]: value } : o) }));
    const reset = () => { setExam(emptyExam); setEditingId(null); setArms([]); };

    return (
        <div className="w-full space-y-6">
            <PageHeader title="CBT Management" description="Create computer-based examinations and manage their questions." />

            <Card>
                <CardContent className="p-5 sm:p-7">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div><h2 className="font-semibold text-slate-900">{editingId ? "Edit Examination" : "Create Examination"}</h2><p className="text-sm text-slate-500">Configure the examination before adding questions.</p></div>
                        {editingId && <Button variant="outline" onClick={reset}><X className="mr-2 h-4 w-4" />Cancel</Button>}
                    </div>
                    <form onSubmit={saveExam} className="grid gap-4 md:grid-cols-2">
                        <input className="rounded-lg border p-3 md:col-span-2" placeholder="Examination title" required value={exam.title} onChange={(e) => setExam({ ...exam, title: e.target.value })} />
                        <textarea className="rounded-lg border p-3 md:col-span-2" rows="3" placeholder="Description" value={exam.description} onChange={(e) => setExam({ ...exam, description: e.target.value })} />
                        <select className="rounded-lg border p-3" required value={exam.subject_id} onChange={(e) => setExam({ ...exam, subject_id: e.target.value })}><option value="">Select subject</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}</select>
                        <select className="rounded-lg border p-3" required value={exam.class_id} onChange={(e) => loadArms(e.target.value)}><option value="">Select class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}</select>
                        <select className="rounded-lg border p-3" value={exam.arm_id} onChange={(e) => setExam({ ...exam, arm_id: e.target.value })}><option value="">All arms</option>{arms.map((a) => <option key={a.id} value={a.id}>{a.arm_name}</option>)}</select>
                        <select className="rounded-lg border p-3" value={exam.status} onChange={(e) => setExam({ ...exam, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select>
                        <label className="rounded-lg border p-3">Duration (minutes)<input className="mt-1 w-full outline-none" type="number" min="1" required value={exam.duration_minutes} onChange={(e) => setExam({ ...exam, duration_minutes: Number(e.target.value) })} /></label>
                        <label className="rounded-lg border p-3">Total marks<input className="mt-1 w-full outline-none" type="number" min="0" value={exam.total_marks} onChange={(e) => setExam({ ...exam, total_marks: Number(e.target.value) })} /></label>
                        <label className="rounded-lg border p-3">Pass mark<input className="mt-1 w-full outline-none" type="number" min="0" value={exam.pass_mark} onChange={(e) => setExam({ ...exam, pass_mark: Number(e.target.value) })} /></label>
                        <label className="rounded-lg border p-3">Maximum attempts<input className="mt-1 w-full outline-none" type="number" min="1" value={exam.max_attempts} onChange={(e) => setExam({ ...exam, max_attempts: Number(e.target.value) })} /></label>
                        <label className="rounded-lg border p-3">Starts at<input className="mt-1 w-full outline-none" type="datetime-local" value={exam.starts_at} onChange={(e) => setExam({ ...exam, starts_at: e.target.value })} /></label>
                        <label className="rounded-lg border p-3">Ends at<input className="mt-1 w-full outline-none" type="datetime-local" value={exam.ends_at} onChange={(e) => setExam({ ...exam, ends_at: e.target.value })} /></label>
                        <div className="flex flex-wrap gap-4 md:col-span-2">{[["randomize_questions","Randomize questions"],["randomize_options","Randomize options"],["show_result_immediately","Show result immediately"]].map(([key,label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(exam[key])} onChange={(e) => setExam({ ...exam, [key]: e.target.checked })} />{label}</label>)}</div>
                        <Button type="submit" disabled={saving} className="md:w-fit"><Plus className="mr-2 h-4 w-4" />{saving ? "Saving..." : editingId ? "Update Examination" : "Create Examination"}</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-700" /><h2 className="font-semibold">Examinations</h2></div>
                    {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading...</p> : exams.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No CBT examinations created yet.</p> : <div className="space-y-3">{exams.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-slate-500">{item.subject_name} • {item.class_name}{item.arm_name ? ` • ${item.arm_name}` : ""} • {item.duration_minutes} min</p><span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize">{item.status}</span></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => openQuestions(item)}><FilePlus2 className="mr-2 h-4 w-4" />Questions</Button><Button variant="outline" onClick={() => editExam(item)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button><Button variant="outline" onClick={() => deleteExam(item.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</Button></div></div>)}</div>}
                </CardContent>
            </Card>

            {selectedExam && <Card><CardContent className="p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Questions: {selectedExam.title}</h2><p className="text-sm text-slate-500">{selectedExam.questions?.length || 0} question(s)</p></div><Button variant="outline" onClick={() => setSelectedExam(null)}>Close</Button></div><form onSubmit={saveQuestion} className="space-y-4"><textarea className="w-full rounded-lg border p-3" rows="4" required placeholder="Question text" value={question.question_text} onChange={(e) => setQuestion({ ...question, question_text: e.target.value })} /><div className="grid gap-3 sm:grid-cols-2">{question.options.map((option, index) => <div key={index} className="rounded-lg border p-3"><div className="flex items-center gap-2"><span className="font-bold">{String.fromCharCode(65 + index)}.</span><input className="w-full outline-none" placeholder="Option text" value={option.option_text} onChange={(e) => setOption(index, "option_text", e.target.value)} /><input type="radio" name="correct" checked={option.is_correct} onChange={() => setQuestion((q) => ({ ...q, options: q.options.map((o, i) => ({ ...o, is_correct: i === index })) }))} /></div></div>)}</div><div className="grid gap-3 sm:grid-cols-3"><label className="rounded-lg border p-3">Marks<input className="mt-1 w-full outline-none" type="number" min="1" value={question.marks} onChange={(e) => setQuestion({ ...question, marks: Number(e.target.value) })} /></label><label className="rounded-lg border p-3">Question order<input className="mt-1 w-full outline-none" type="number" min="1" value={question.question_order} onChange={(e) => setQuestion({ ...question, question_order: Number(e.target.value) })} /></label><input className="rounded-lg border p-3" placeholder="Image URL (optional)" value={question.image_url} onChange={(e) => setQuestion({ ...question, image_url: e.target.value })} /></div><textarea className="w-full rounded-lg border p-3" rows="2" placeholder="Explanation (optional)" value={question.explanation} onChange={(e) => setQuestion({ ...question, explanation: e.target.value })} /><Button type="submit" disabled={saving}><Plus className="mr-2 h-4 w-4" />Add Question</Button></form></CardContent></Card>}
        </div>
    );
}

export default CBTManagementPage;
