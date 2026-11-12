import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Copy, Edit3, ImagePlus, Layers, Plus, Search, Trash2, X } from "lucide-react";
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
    const [questionGroups, setQuestionGroups] = useState([]);
    const [targetGroupId, setTargetGroupId] = useState("");
    const [question, setQuestion] = useState(emptyQuestion);
    const [editingId, setEditingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [copyExamId, setCopyExamId] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showCopy, setShowCopy] = useState(false);
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [groupDraft, setGroupDraft] = useState({ title: "", material_type: "passage", instructions: "", material_text: "", image_url: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const groupFormRef = useRef(null);
    useEffect(() => {
        if (!showGroupForm) return;
        const frame = window.requestAnimationFrame(() => groupFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        return () => window.cancelAnimationFrame(frame);
    }, [showGroupForm, editingGroupId]);

    const load = async () => {
        setLoading(true);
        try {
            const [q, s, c, e, g] = await Promise.all([
                api.get("/cbt-question-bank"),
                api.get("/subjects"),
                api.get("/classes"),
                api.get("/cbt/exams"),
                api.get("/cbt-question-bank/groups"),
            ]);
            setQuestions(q.data?.data || []);
            setSubjects(s.data?.data || []);
            setClasses(c.data?.data || []);
            setExams(e.data?.data || []);
            setQuestionGroups(g.data?.data || []);
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

    const uniqueClasses = useMemo(() => {
        const seen = new Set();
        return classes.filter((item) => {
            const key = String(item.class_name || "").trim().replace(/\s+/g, " ").toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [classes]);

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
        const classId = selected[0].class_id;
        if (selected.some((q) => String(q.class_id) !== String(classId))) return [];
        const selectedSubjectIds = new Set(selected.map((q) => String(q.subject_id)));
        return exams.filter((exam) => {
            if (String(exam.class_id) !== String(classId)) return false;
            const examSubjectIds = new Set(
                (Array.isArray(exam.exam_subjects) && exam.exam_subjects.length
                    ? exam.exam_subjects.map((item) => item.subject_id)
                    : [exam.subject_id]
                ).map(String)
            );
            return [...selectedSubjectIds].every((subjectId) => examSubjectIds.has(subjectId));
        });
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
        // An option is usable when it contains text or an image. Ignore untouched option rows.
        const filled = question.options
            .map((option, index) => ({
                ...option,
                option_text: String(option.option_text || "").trim(),
                option_image_url: String(option.option_image_url || "").trim(),
                option_order: index + 1,
                is_correct: Boolean(option.is_correct),
            }))
            .filter((option) => option.option_text || option.option_image_url);

        if (filled.length < 2) {
            toast.error("Enter at least two options. Each option needs text or an image.");
            return;
        }
        if (filled.filter((option) => option.is_correct).length !== 1) {
            toast.error("Mark exactly one of your completed options as the correct answer.");
            return;
        }

        const payload = {
            ...question,
            question_text: question.question_text.trim(),
            options: filled,
        };

        setSaving(true);
        try {
            if (editingId) await api.put(`/cbt-question-bank/${editingId}`, payload);
            else await api.post("/cbt-question-bank", payload);
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

    const deleteSelected = async () => {
        if (!selectedIds.length) return toast.error("Select at least one question.");
        const confirmed = window.confirm(`Permanently remove ${selectedIds.length} selected question(s) from the question bank? This will not remove questions already copied into examinations.`);
        if (!confirmed) return;
        setSaving(true);
        try {
            const response = await api.delete("/cbt-question-bank/bulk", { data: { ids: selectedIds } });
            toast.success(response.data?.message || "Selected questions removed.");
            setSelectedIds([]);
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to delete selected questions.");
        } finally {
            setSaving(false);
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

    const createQuestionGroup = async (event) => {
        event.preventDefault();
        if (!editingGroupId && !selectedIds.length) return toast.error("Select the questions that should share this material.");
        if (!groupDraft.title.trim()) return toast.error("Enter a title for this question group.");
        if (!groupDraft.material_text.trim() && !groupDraft.image_url.trim()) return toast.error("Enter the passage/instruction or provide an image URL.");
        setSaving(true);
        try {
            const payload = { ...groupDraft, title: groupDraft.title.trim() };
            const response = editingGroupId
                ? await api.put(`/cbt-question-bank/groups/${editingGroupId}`, payload)
                : await api.post("/cbt-question-bank/groups", { ...payload, question_ids: selectedIds });
            toast.success(response.data?.message || (editingGroupId ? "Shared material updated." : "Question group created."));
            setSelectedIds([]);
            setEditingGroupId(null);
            setGroupDraft({ title: "", material_type: "passage", instructions: "", material_text: "", image_url: "" });
            setShowGroupForm(false);
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save shared material.");
        } finally {
            setSaving(false);
        }
    };

    const addSelectedToGroup = async () => {
        if (!targetGroupId) return toast.error("Choose a shared-material group.");
        if (!selectedIds.length) return toast.error("Select at least one question.");
        setSaving(true);
        try {
            const response = await api.post(`/cbt-question-bank/groups/${targetGroupId}/questions`, { question_ids: selectedIds });
            toast.success(response.data?.message || "Questions added to the group.");
            setSelectedIds([]);
            setTargetGroupId("");
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add questions to the group.");
        } finally { setSaving(false); }
    };

    const deleteQuestionGroup = async (group) => {
        if (!window.confirm(`Delete “${group.title}”? Questions will remain in the question bank and examinations; only their shared-material link will be removed.`)) return;
        setSaving(true);
        try {
            const response = await api.delete(`/cbt-question-bank/groups/${group.id}`);
            toast.success(response.data?.message || "Question group deleted. Questions were kept.");
            await load();
        } catch (error) { toast.error(error.response?.data?.message || "Unable to delete question group."); }
        finally { setSaving(false); }
    };
    const editGroup = (group) => {
        setEditingGroupId(group.id);
        setGroupDraft({ title: group.title || "", material_type: group.material_type || "passage", instructions: group.instructions || "", material_text: group.material_text || "", image_url: group.image_url || "" });
        setSelectedIds([]);
        setShowGroupForm(true);
    };
    const removeFromGroup = async (item) => {
        if (!item.question_group_id) return;
        if (!window.confirm("Remove this question from its shared-material group? The question and any examination copies will be kept.")) return;
        setSaving(true);
        try {
            const response = await api.delete(`/cbt-question-bank/groups/${item.question_group_id}/questions/${item.id}`);
            toast.success(response.data?.message || "Question removed from the group.");
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove question from the group.");
        } finally { setSaving(false); }
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
                <Button variant="outline" disabled={!selectedIds.length} onClick={() => { setEditingGroupId(null); setShowGroupForm(true); }}>
                    <Layers className="mr-2 h-4 w-4" /> Group Selected Questions
                </Button>
            </div>

            {selectedIds.length > 0 && questionGroups.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-slate-50 p-3">
                    <span className="text-sm font-medium">Add selected questions to an existing group:</span>
                    <select className="min-w-56 rounded-lg border bg-white p-2 text-sm" value={targetGroupId} onChange={(e) => setTargetGroupId(e.target.value)}>
                        <option value="">Select shared-material group</option>
                        {questionGroups.map((group) => <option key={group.id} value={group.id}>{group.title} — {group.subject_name} / {group.class_name}</option>)}
                    </select>
                    <Button size="sm" disabled={saving || !targetGroupId} onClick={addSelectedToGroup}>Add Selected</Button>
                </div>
            )}


            {questionGroups.length > 0 && (
                <Card><CardContent className="space-y-4 p-5 sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">Question Groups</h2><p className="text-sm text-slate-500">Manage passages, diagrams, instructions and other materials shared by questions.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{questionGroups.length} group(s)</span></div>
                    <div className="space-y-3">{questionGroups.map((group) => <div key={group.id} className="rounded-xl border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{group.title}</h3><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium capitalize text-blue-700">{group.material_type}</span></div>
                            <p className="mt-1 text-xs text-slate-500">{group.subject_name} • {group.class_name} • {group.question_count || 0} linked question(s)</p>
                            {group.instructions && <p className="mt-2 text-sm text-slate-600">{group.instructions}</p>}
                            {group.material_text && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{group.material_text.length > 280 ? `${group.material_text.slice(0,280)}…` : group.material_text}</p>}
                            {group.image_url && <a className="mt-2 inline-block text-sm text-blue-600 underline" href={group.image_url} target="_blank" rel="noreferrer">View shared image</a>}
                            {Array.isArray(group.questions) && group.questions.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-sm font-medium">View linked questions ({group.questions.length})</summary><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">{group.questions.map((item) => <li key={item.id}>{item.question_text}</li>)}</ol></details>}
                        </div><div className="flex shrink-0 flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => editGroup(group)}>Edit Material</Button><Button type="button" size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={saving} onClick={() => deleteQuestionGroup(group)}>Delete Group</Button></div></div>
                    </div>)}</div>
                </CardContent></Card>
            )}
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
                                    {uniqueClasses.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
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
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={selectVisible} disabled={!filteredQuestions.length}>Select All Shown</Button>
                            <Button variant="outline" onClick={() => setSelectedIds([])} disabled={!selectedIds.length}>Clear Selection</Button>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={deleteSelected} disabled={!selectedIds.length || saving}>
                                <Trash2 className="mr-2 h-4 w-4" /> {saving ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
                            </Button>
                        </div>
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
                                                {item.group_title && <div className="mt-2 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"><Layers className="h-3.5 w-3.5" /> Shared group: {item.group_title}</span><Button type="button" size="sm" variant="outline" onClick={() => { setEditingGroupId(item.question_group_id); setGroupDraft({ title: item.group_title || "", material_type: item.group_material_type || "passage", instructions: item.group_instructions || "", material_text: item.group_material_text || "", image_url: item.group_image_url || "" }); setSelectedIds([]); setShowGroupForm(true); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}>Edit Shared Material</Button><Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => removeFromGroup(item)}>Remove from Group</Button></div>}
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

            {showGroupForm && (\n                <div ref={groupFormRef} className="scroll-mt-6">
                <Card>
                    <CardContent className="space-y-4 p-5 sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div><h2 className="font-semibold">{editingGroupId ? "Edit shared material" : "Create a shared-material question group"}</h2><p className="text-sm text-slate-500">{editingGroupId ? "Changes apply to every question linked to this group, including existing examination copies." : "The selected questions will share one passage, diagram, graph, table or instruction."}</p></div>
                            <Button type="button" variant="outline" onClick={() => { setShowGroupForm(false); setEditingGroupId(null); }}><X className="h-4 w-4" /></Button>
                        </div>
                        <form className="space-y-4" onSubmit={createQuestionGroup}>
                            <label className="block text-sm font-medium">Group title<input className="mt-1 w-full rounded-lg border p-3" required value={groupDraft.title} onChange={e=>setGroupDraft({...groupDraft,title:e.target.value})} placeholder="e.g. English Comprehension – Section A" /></label>
                            <label className="block text-sm font-medium">Shared material type<select className="mt-1 w-full rounded-lg border p-3" value={groupDraft.material_type} onChange={e=>setGroupDraft({...groupDraft,material_type:e.target.value})}><option value="passage">Comprehension passage</option><option value="instruction">Instruction / information</option><option value="diagram">Diagram</option><option value="image">Picture / image</option><option value="table">Table</option><option value="graph">Graph</option><option value="mixed">Mixed materials</option></select></label>
                            <label className="block text-sm font-medium">Instruction shown to students (optional)<textarea className="mt-1 w-full rounded-lg border p-3" rows="2" value={groupDraft.instructions} onChange={e=>setGroupDraft({...groupDraft,instructions:e.target.value})} placeholder="Read the passage carefully and answer questions 1–5." /></label>
                            <label className="block text-sm font-medium">Passage / shared text<textarea className="mt-1 w-full rounded-lg border p-3" rows="6" value={groupDraft.material_text} onChange={e=>setGroupDraft({...groupDraft,material_text:e.target.value})} placeholder="Paste the comprehension passage, data, or instruction here. Leave blank if you are using an image." /></label>
                            <label className="block text-sm font-medium">Shared image URL (optional)<input className="mt-1 w-full rounded-lg border p-3" type="url" value={groupDraft.image_url} onChange={e=>setGroupDraft({...groupDraft,image_url:e.target.value})} placeholder="https://..." /></label>
                            {groupDraft.image_url && <img src={groupDraft.image_url} alt="Shared material preview" className="max-h-64 rounded-lg border bg-white object-contain p-2" onError={e=>{e.currentTarget.style.display="none";}} />}
                            {!editingGroupId && <p className="text-xs text-slate-500">{selectedIds.length} selected question(s). They must all belong to the same subject and class and must not already be in another group.</p>}
                            <div className="flex flex-wrap gap-2"><Button type="submit" disabled={saving}>{saving?(editingGroupId?"Saving changes...":"Creating group..."):(editingGroupId?"Update Shared Material":"Create Group")}</Button><Button type="button" variant="outline" onClick={()=>{setShowGroupForm(false);setEditingGroupId(null);}}>Cancel</Button></div>
                        </form>
                    </CardContent>
                </Card>
                </div>
            )}\n            {showCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                            <div>
                                <h2 className="text-lg font-semibold">Add Questions to Examination</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Only examinations containing all selected subjects and the same class are shown.</p>
                            </div>
                            <Button variant="outline" onClick={() => setShowCopy(false)} aria-label="Close modal"><X className="h-4 w-4" /></Button>
                        </div>
                        <div className="px-6 py-5">
                            {compatibleExams.length ? (
                                <label className="block text-sm font-medium">
                                    Select examination
                                    <select className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={copyExamId} onChange={(e) => setCopyExamId(e.target.value)}>
                                        <option value="">Select examination</option>
                                        {compatibleExams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title} • {exam.status}</option>)}
                                    </select>
                                </label>
                            ) : (
                                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">No compatible examination was found. Create an examination containing the selected subjects for this class first.</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setShowCopy(false)}>Cancel</Button>
                            <Button disabled={!compatibleExams.length || saving} onClick={copySelected}>{saving ? "Adding..." : "Add Questions"}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CBTQuestionBankPage;
