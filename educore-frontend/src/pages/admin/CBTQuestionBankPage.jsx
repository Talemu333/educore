import { useEffect, useMemo, useState } from "react";
import { BookOpen, Copy, Edit3, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const emptyQuestion = {
    subject_id: "",
    class_id: "",
    question_text: "",
    image_url: "",
    marks: 1,
    explanation: "",
    is_active: true,
    options: [
        { option_text: "", option_image_url: "", option_order: 1, is_correct: true },
        { option_text: "", option_image_url: "", option_order: 2, is_correct: false },
        { option_text: "", option_image_url: "", option_order: 3, is_correct: false },
        { option_text: "", option_image_url: "", option_order: 4, is_correct: false },
    ],
};

function CBTQuestionBankPage() {
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [exams, setExams] = useState([]);
    const [question, setQuestion] = useState(emptyQuestion);
    const [editingId, setEditingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [copyExamId, setCopyExamId] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showCopy, setShowCopy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [q, s, c, e] = await Promise.all([
                api.get("/cbt-question-bank"),
                api.get("/subjects"),
                api.get("/classes"),
                api.get("/cbt/exams"),
            ]);
            setQuestions(q.data?.data || []);
            setSubjects(s.data?.data || []);
            setClasses(c.data?.data || []);
            setExams(e.data?.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load question bank.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setQuestion(emptyQuestion);
        setEditingId(null);
        setShowForm(false);
    };

    const filteredQuestions = useMemo(() => {
        const term = search.trim().toLowerCase();
        return questions.filter((q) => {
            const subjectMatch = !subjectFilter || String(q.subject_id) === String(subjectFilter);
            const classMatch = !classFilter || String(q.class_id) === String(classFilter);
            const textMatch = !term || `${q.question_text || ""} ${q.subject_name || ""} ${q.class_name || ""}`.toLowerCase().includes(term);
            return subjectMatch && classMatch && textMatch;
        });
    }, [questions, subjectFilter, classFilter, search]);

    const compatibleExams = useMemo(() => {
        if (!selectedIds.length) return [];
        const selected = questions.filter((q) => selectedIds.includes(q.id));
        if (!selected.length) return [];
        const subjectId = selected[0].subject_id;
        const classId = selected[0].class_id;
        if (selected.some((q) => String(q.subject_id) !== String(subjectId) || String(q.class_id) !== String(classId))) return [];
        return exams.filter((exam) => String(exam.subject_id) === String(subjectId) && String(exam.class_id) === String(classId));
    }, [selectedIds, questions, exams]);

    const editQuestion = (item) => {
        setEditingId(item.id);
        setQuestion({
            ...emptyQuestion,
            ...item,
            subject_id: item.subject_id || "",
            class_id: item.class_id || "",
            image_url: item.image_url || "",
            explanation: item.explanation || "",
            is_active: item.is_active !== false,
            options: (item.options || []).map((o, i) => ({
                option_text: o.option_text || "",
                option_image_url: o.option_image_url || "",
                option_order: o.option_order || i + 1,
                is_correct: Boolean(o.is_correct),
            })),
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const saveQuestion = async (event) => {
        event.preventDefault();
        if (!question.subject_id || !question.class_id || !question.question_text.trim()) {
            toast.error("Subject, class and question text are required.");
            return;
        }
        const filled = question.options.filter((o) => o.option_text.trim());
        if (filled.length < 2 || question.options.filter((o) => o.is_correct && o.option_text.trim()).length !== 1) {
            toast.error("Provide at least two non-empty options and exactly one correct option.");
            return;
        }
        setSaving(true);
        try {
            if (editingId) await api.put(`/cbt-question-bank/${editingId}`, question);
            else await api.post("/cbt-question-bank", question);
            toast.success(editingId ? "Question bank item updated." : "Question added to question bank.");
            resetForm();
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save question.");
        } finally {
            setSaving(false);
        }
    };

    const deleteQuestion = async (id) => {
        if (!window.confirm("Remove this question from the question bank?")) return;
        try {
            await api.delete(`/cbt-question-bank/${id}`);
            setSelectedIds((ids) => ids.filter((item) => item !== id));
            toast.success("Question removed from question bank.");
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove question.");
        }
    };

    const copySelected = async () => {
        if (!copyExamId) return toast.error("Select an examination.");
        if (!selectedIds.length) return toast.error("Select at least one question.");
        setSaving(true);
        try {
            const response = await api.post(`/cbt-question-bank/copy-to-exam/${copyExamId}`, { bankQuestionIds: selectedIds });
            toast.success(response.data?.message || "Questions added to examination.");
            setSelectedIds([]);
            setCopyExamId("");
            setShowCopy(false);
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add questions to examination.");
        } finally {
            setSaving(false);
        }
    };

    const setOption = (index, field, value) => {
        setQuestion((current) => ({
            ...current,
            options: current.options.map((option, i) => i === index ? { ...option, [field]: value } : option),
        }));
    };

    const toggleSelection = (id) => {
        setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
    };

    const selectVisible = () => setSelectedIds(filteredQuestions.map((q) => q.id));

    return (
        <div className="w-full space-y-6">
            <PageHeader title="CBT Question Bank" description="Create reusable MCQ questions and add selected questions to examinations." />

            <div className="flex flex-wrap gap-2">
                <Button onClick={() => { setQuestion(emptyQuestion); setEditingId(null); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
                <Button variant="outline" disabled={!selectedIds.length} onClick={() => setShowCopy(true)}>
                    <Copy className="mr-2 h-4 w-4" /> Add {selectedIds.length || "Selected"} to Exam
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardContent className="p-5 sm:p-7">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">{editingId ? "Edit Question" : "Add Question to Bank"}</h2>
                                <p className="text-sm text-slate-500">Questions are reusable across compatible CBT examinations.</p>
                            </div>
                            <Button variant="outline" onClick={resetForm}><X className="h-4 w-4" /></Button>
                        </div>
                        <form onSubmit={saveQuestion} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <select className="rounded-lg border p-3" required value={question.subject_id} onChange={(e) => setQuestion({ ...question, subject_id: e.target.value })}>
                                    <option value="">Select subject</option>
                                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                                </select>
                                <select className="rounded-lg border p-3" required value={question.class_id} onChange={(e) => setQuestion({ ...question, class_id: e.target.value })}>
                                    <option value="">Select class</option>
                                    {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                </select>
                            </div>
                            <textarea className="w-full rounded-lg border p-3" rows="4" required placeholder="Question text" value={question.question_text} onChange={(e) => setQuestion({ ...question, question_text: e.target.value })} />
                            <div className="rounded-lg border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium"><ImagePlus className="h-4 w-4" /> Question image URL (optional)</label>
                                <input className="mt-2 w-full outline-none" placeholder="https://..." value={question.image_url} onChange={(e) => setQuestion({ ...question, image_url: e.target.value })} />
                                {question.image_url && <img src={question.image_url} alt="Question preview" onError={(e) => { e.currentTarget.style.display = "none"; }} className="mt-3 max-h-56 rounded-lg border object-contain" />}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {question.options.map((option, index) => (
                                    <div key={index} className="rounded-lg border p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                                            <input className="w-full outline-none" placeholder="Option text" value={option.option_text} onChange={(e) => setOption(index, "option_text", e.target.value)} />
                                            <input type="radio" name="bank-correct" checked={option.is_correct} onChange={() => setQuestion((current) => ({ ...current, options: current.options.map((o, i) => ({ ...o, is_correct: i === index })) }))} />
                                        </div>
                                        <input className="mt-2 w-full border-t pt-2 text-xs outline-none" placeholder="Option image URL (optional)" value={option.option_image_url} onChange={(e) => setOption(index, "option_image_url", e.target.value)} />
                                        {option.option_image_url && <img src={option.option_image_url} alt="Option preview" onError={(e) => { e.currentTarget.style.display = "none"; }} className="mt-2 max-h-24 rounded object-contain" />}
                                    </div>
                                ))}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="rounded-lg border p-3">Marks<input className="mt-1 w-full outline-none" type="number" min="1" value={question.marks} onChange={(e) => setQuestion({ ...question, marks: Number(e.target.value) })} /></label>
                                <label className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={Boolean(question.is_active)} onChange={(e) => setQuestion({ ...question, is_active: e.target.checked })} /> Active question</label>
                            </div>
                            <textarea className="w-full rounded-lg border p-3" rows="2" placeholder="Explanation (optional)" value={question.explanation} onChange={(e) => setQuestion({ ...question, explanation: e.target.value })} />
                            <div className="flex gap-2">
                                <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Question" : "Save Question"}</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-5 sm:p-7">
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5" /><h2 className="font-semibold">Question Bank</h2></div>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center rounded-lg border px-3"><Search className="mr-2 h-4 w-4 text-slate-400" /><input className="w-52 py-2 outline-none" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                            <select className="rounded-lg border p-2" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}><option value="">All subjects</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}</select>
                            <select className="rounded-lg border p-2" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}><option value="">All classes</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}</select>
                        </div>
                    </div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                        <span>{filteredQuestions.length} question(s) shown • {selectedIds.length} selected</span>
                        <Button variant="outline" onClick={selectVisible} disabled={!filteredQuestions.length}>Select All Shown</Button>
                    </div>
                    {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading question bank...</p> : filteredQuestions.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No questions found.</p> : (
                        <div className="space-y-3">
                            {filteredQuestions.map((item, index) => (
                                <div key={item.id} className={`rounded-xl border p-4 ${selectedIds.includes(item.id) ? "border-slate-500 bg-slate-50" : ""}`}>
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex min-w-0 flex-1 gap-3">
                                            <input className="mt-1 h-4 w-4" type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelection(item.id)} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase text-slate-500"><span>Question {index + 1}</span><span>•</span><span>{item.subject_name}</span><span>•</span><span>{item.class_name}</span><span>•</span><span>{item.marks} mark{Number(item.marks) === 1 ? "" : "s"}</span>{item.is_active === false && <span className="text-red-500">• inactive</span>}</div>
                                                <p className="mt-1 font-medium">{item.question_text}</p>
                                                {item.image_url && <img src={item.image_url} alt="Question" onError={(e) => { e.currentTarget.style.display = "none"; }} className="mt-3 max-h-48 rounded-lg border object-contain" />}
                                                <div className="mt-3 grid gap-2 sm:grid-cols-2">{(item.options || []).map((option, optionIndex) => <div key={option.id || optionIndex} className={`rounded-lg border p-2 text-sm ${option.is_correct ? "border-green-400 bg-green-50" : ""}`}><div>{String.fromCharCode(65 + optionIndex)}. {option.option_text}</div>{option.option_image_url && <img src={option.option_image_url} alt="Option" onError={(e) => { e.currentTarget.style.display = "none"; }} className="mt-2 max-h-24 rounded object-contain" />}</div>)}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2"><Button variant="outline" onClick={() => editQuestion(item)}><Edit3 className="mr-1 h-4 w-4" /> Edit</Button><Button variant="outline" className="text-red-600" onClick={() => deleteQuestion(item.id)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {showCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <Card className="w-full max-w-lg"><CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Add Questions to Examination</h2><p className="text-sm text-slate-500">Only examinations with the same subject and class are shown.</p></div><Button variant="outline" onClick={() => setShowCopy(false)}><X className="h-4 w-4" /></Button></div>
                        {compatibleExams.length ? <select className="w-full rounded-lg border p-3" value={copyExamId} onChange={(e) => setCopyExamId(e.target.value)}><option value="">Select examination</option>{compatibleExams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title} • {exam.status}</option>)}</select> : <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">No compatible examination was found. Create an examination for the same subject and class first.</p>}
                        <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowCopy(false)}>Cancel</Button><Button disabled={!compatibleExams.length || saving} onClick={copySelected}>{saving ? "Adding..." : "Add Questions"}</Button></div>
                    </CardContent></Card>
                </div>
            )}
        </div>
    );
}

export default CBTQuestionBankPage;
