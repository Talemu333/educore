import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const emptyOptions = () => [1, 2, 3, 4].map((order) => ({
    option_order: order,
    option_text: "",
    option_image_url: "",
    is_correct: order === 1,
}));

const normalizeQuestion = (q) => ({
    ...q,
    subject_id: q.subject_id || "",
    question_text: q.question_text || "",
    image_url: q.image_url || "",
    marks: Number(q.marks || 1),
    explanation: q.explanation || "",
    is_active: q.is_active !== false,
    options: (q.options || []).length ? q.options.map((o, index) => ({
        option_order: index + 1,
        option_text: o.option_text || "",
        option_image_url: o.option_image_url || "",
        is_correct: Boolean(o.is_correct),
    })) : emptyOptions(),
});

function CBTPdfImportPage() {
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [exams, setExams] = useState([]);
    const [targetExamId, setTargetExamId] = useState("");
    const [targetExam, setTargetExam] = useState(null);
    const [subjectId, setSubjectId] = useState("");
    const [classId, setClassId] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const draftExams = exams.filter((exam) => String(exam.status || "").trim().toLowerCase() === "draft");

    useEffect(() => {
        Promise.all([api.get("/subjects"), api.get("/classes"), api.get("/cbt/exams")])
            .then(([s, c, e]) => {
                setSubjects(s.data?.data || []);
                setClasses(c.data?.data || []);
                setExams(e.data?.data || []);
            })
            .catch((error) => toast.error(error.response?.data?.message || "Unable to load subjects and classes."));
    }, []);

    const chooseExam = async (id) => {
        setTargetExamId(id);
        setTargetExam(null);
        if (!id) return;
        try {
            const response = await api.get(`/cbt/exams/${id}`);
            setTargetExam(response.data?.data || null);
        } catch (error) {
            setTargetExamId("");
            toast.error(error.response?.data?.message || "Unable to load the selected examination.");
        }
    };

    const chooseFile = (event) => {
        const selected = event.target.files?.[0];
        if (!selected) return;
        if (!selected.name.toLowerCase().endsWith(".pdf")) {
            toast.error("Please select a PDF file.");
            return;
        }
        if (selected.size > 10 * 1024 * 1024) {
            toast.error("PDF must be 10 MB or smaller.");
            return;
        }
        setFile(selected);
        setPreview(null);
    };

    const parsePdf = async () => {
        if (!file) return toast.error("Select a PDF file first.");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("pdf", file);
            const response = await api.post("/cbt-question-bank/import-pdf/preview", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPreview({
                ...response.data.data,
                questions: (response.data.data.questions || []).map(normalizeQuestion),
            });
            toast.success(`${response.data.data.valid_count} question(s) ready for review.`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to read this PDF.");
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = (index, field, value) => {
        setPreview((current) => ({
            ...current,
            questions: current.questions.map((q, i) => i === index ? { ...q, [field]: value, valid: field === "question_text" ? Boolean(String(value).trim()) : q.valid } : q),
        }));
    };

    const updateOption = (questionIndex, optionIndex, field, value) => {
        setPreview((current) => ({
            ...current,
            questions: current.questions.map((q, qi) => qi !== questionIndex ? q : {
                ...q,
                options: q.options.map((o, oi) => oi === optionIndex ? { ...o, [field]: value } : o),
            }),
        }));
    };

    const setCorrect = (questionIndex, optionIndex) => {
        setPreview((current) => ({
            ...current,
            questions: current.questions.map((q, qi) => qi !== questionIndex ? q : {
                ...q,
                options: q.options.map((o, oi) => ({ ...o, is_correct: oi === optionIndex })),
                valid: true,
                warning: null,
            }),
        }));
    };

    const removeQuestion = (index) => {
        setPreview((current) => ({ ...current, questions: current.questions.filter((_, i) => i !== index) }));
    };

    const importQuestions = async () => {
        if (!targetExamId && (!subjectId || !classId)) return toast.error("Select the subject and class for these questions.");
        const questions = (preview?.questions || []).filter((q) => q.question_text.trim());
        if (!questions.length) return toast.error("There are no questions ready to import.");
        const invalidIndex = questions.findIndex((q) => q.options.length !== 4 || q.options.some((o) => !o.option_text.trim()) || q.options.filter((o) => o.is_correct).length !== 1 || Number(q.marks) <= 0 || (targetExamId && !q.subject_id));
        if (invalidIndex >= 0) return toast.error(`Question ${invalidIndex + 1} still needs correction.`);

        setImporting(true);
        try {
            const response = targetExamId
                ? await api.post(`/cbt-question-bank/import-pdf/exam/${targetExamId}/import`, { questions })
                : await api.post("/cbt-question-bank/import-pdf/import", { subject_id: Number(subjectId), class_id: Number(classId), questions });
            toast.success(response.data?.message || "Questions imported successfully.");
            setFile(null);
            setPreview(null);
            setTargetExam(null);
            setTargetExamId("");
            setSubjectId("");
            setClassId("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to import questions.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <PageHeader title="Import CBT Questions from PDF" description="Upload one PDF, assign each question to its subject, review it, then import it into a combined examination or the question bank." />

            <Card>
                <CardContent className="space-y-5 p-5 sm:p-7">
                    <div className="rounded-xl border border-dashed p-6 text-center">
                        <FileText className="mx-auto h-10 w-10 text-slate-400" />
                        <h2 className="mt-3 font-semibold">Upload CBT Question PDF</h2>
                        <p className="mt-1 text-sm text-slate-500">Maximum 10 MB. Text-based PDFs only; scanned PDFs are not supported yet.</p>
                        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                            <Upload className="h-4 w-4" /> Choose PDF
                            <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={chooseFile} />
                        </label>
                        {file && <p className="mt-3 text-sm font-medium">{file.name}</p>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium md:col-span-2">Import destination
                            <select className="mt-1 w-full rounded-lg border p-3" value={targetExamId} onChange={(e) => chooseExam(e.target.value)}>
                                <option value="">Question bank (existing workflow)</option>
                                {draftExams.length === 0 ? <option value="" disabled>No draft examinations available — create one in CBT Management first</option> : draftExams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title} — {exam.class_name}</option>)}
                            </select>
                            <span className="mt-1 block text-xs text-slate-500">{draftExams.length === 0 ? "To import into a combined examination, first create and save it as a draft in CBT Management. It will appear here after it has been created." : "Choose a draft examination to import directly into its subject sections. Teachers only see examinations they created or have an assigned subject in."}</span>
                        </label>
                        {!targetExamId && <>
                            <label className="text-sm font-medium">Subject<select className="mt-1 w-full rounded-lg border p-3" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}><option value="">Select subject</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}</select></label>
                            <label className="text-sm font-medium">Class<select className="mt-1 w-full rounded-lg border p-3" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">Select class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}</select></label>
                        </>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button onClick={parsePdf} disabled={!file || loading}>{loading ? "Reading PDF..." : "Read PDF & Preview"}</Button>
                        {preview && <Button variant="outline" onClick={() => { setPreview(null); setFile(null); }}>Start Over</Button>}
                    </div>
                </CardContent>
            </Card>

            {preview && (
                <Card>
                    <CardContent className="p-5 sm:p-7">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Review Imported Questions</h2>
                                <p className="text-sm text-slate-500">{preview.questions.length} question(s) detected • {preview.questions.filter((q) => q.valid).length} initially valid • {preview.invalid_count} need review</p>
                            </div>
                            <Button onClick={importQuestions} disabled={importing}>{importing ? "Importing..." : `Import ${preview.questions.length} Question(s)`}</Button>
                        </div>

                        {preview.truncated && <div className="mb-4 flex gap-2 rounded-lg border p-3 text-sm"><AlertTriangle className="h-5 w-5 shrink-0" /> Only the first 500 questions were returned.</div>}

                        <div className="space-y-5">
                            {preview.questions.map((q, index) => (
                                <div key={`${q.number}-${index}`} className="rounded-xl border p-4">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold"><span>Question {q.number}</span>{q.valid ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</div>
                                        <Button variant="outline" onClick={() => removeQuestion(index)}><X className="h-4 w-4" /></Button>
                                    </div>
                                    {!q.valid && q.warning && <div className="mb-3 rounded-lg border p-3 text-sm">{q.warning}</div>}
                                    {targetExamId && <label className="mt-3 block text-sm font-medium">Subject section
                                        <select className="mt-1 w-full rounded-lg border p-2" value={q.subject_id} onChange={(e) => updateQuestion(index, "subject_id", e.target.value)}>
                                            <option value="">Select subject for this question</option>
                                            {(targetExam?.exam_subjects || []).filter((section) => !Array.isArray(targetExam?.manageable_subject_ids) || targetExam.manageable_subject_ids.map(Number).includes(Number(section.subject_id))).map((section) => <option key={section.subject_id} value={section.subject_id}>{section.section_title || section.subject_name}</option>)}
                                        </select>
                                    </label>}
                                    <textarea className="w-full rounded-lg border p-3" rows="3" value={q.question_text} onChange={(e) => updateQuestion(index, "question_text", e.target.value)} placeholder="Question text" />
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        {q.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="rounded-lg border p-3">
                                                <div className="flex items-center gap-2"><span className="font-bold">{String.fromCharCode(65 + optionIndex)}.</span><input className="w-full outline-none" value={option.option_text} onChange={(e) => updateOption(index, optionIndex, "option_text", e.target.value)} placeholder="Option text" /><input type="radio" name={`correct-${index}`} checked={option.is_correct} onChange={() => setCorrect(index, optionIndex)} /></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <label className="rounded-lg border p-3 text-sm">Marks<input className="mt-1 w-full outline-none" type="number" min="1" value={q.marks} onChange={(e) => updateQuestion(index, "marks", Number(e.target.value))} /></label>
                                        <label className="rounded-lg border p-3 text-sm">Explanation (optional)<input className="mt-1 w-full outline-none" value={q.explanation} onChange={(e) => updateQuestion(index, "explanation", e.target.value)} /></label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <Button className="w-full" onClick={importQuestions} disabled={importing}>
                                {importing ? "Importing Questions..." : `Import All ${preview.questions.length} Question(s) ${targetExamId ? "to Examination" : "to Question Bank"}`}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default CBTPdfImportPage;
