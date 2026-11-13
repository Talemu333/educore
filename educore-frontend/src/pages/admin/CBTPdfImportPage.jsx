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

const normalizeSubject = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const mapQuestionSubjects = (questions, exam) => (questions || []).map((question) => {
    const taggedSubject = normalizeSubject(question.subject_name);
    const sections = (exam?.exam_subjects || []).filter((section) =>
        !Array.isArray(exam?.manageable_subject_ids) || exam.manageable_subject_ids.map(Number).includes(Number(section.subject_id))
    );
    const match = taggedSubject ? sections.find((section) =>
        [section.subject_name, section.section_title].some((name) => normalizeSubject(name) === taggedSubject)
    ) : sections.length === 1 ? sections[0] : null;
    return { ...question, subject_id: match ? String(match.subject_id) : "", mapped_subject_name: match?.section_title || match?.subject_name || "", subject_mapping_error: !match };
});

const normalizeQuestion = (q) => ({
    ...q,
    subject_id: q.subject_id || "",
    subject_name: q.subject_name || "",
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
            const exam = response.data?.data || null;
            setTargetExam(exam);
            setPreview((current) => current ? { ...current, questions: mapQuestionSubjects(current.questions, exam) } : current);
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
                questions: mapQuestionSubjects((response.data.data.questions || []).map(normalizeQuestion), targetExamId ? targetExam : null),
            });
            toast.success(`${response.data.data.valid_count} question(s) ready for review.`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to read this PDF.");
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = (index, field, value) => {
        const section = field === "subject_id" ? (targetExam?.exam_subjects || []).find((item) => String(item.subject_id) === String(value)) : null;
        setPreview((current) => ({
            ...current,
            questions: current.questions.map((q, i) => i === index ? {
                ...q,
                [field]: value,
                ...(field === "subject_id" ? { mapped_subject_name: section?.section_title || section?.subject_name || "", subject_mapping_error: !section } : {}),
                valid: field === "question_text" ? Boolean(String(value).trim()) : q.valid,
            } : q),
        }));
    };

    const updateGroupMaterial = (groupKey, field, value) => {
        setPreview((current) => ({
            ...current,
            questions: current.questions.map((question) => question.group_key === groupKey ? { ...question, [field]: value } : question),
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
            <PageHeader title="Import CBT Questions from PDF" description="Upload a text-based PDF. EduProw detects shared passages, instructions, diagrams, tables and graphs, then lets you review questions and attach visual materials before importing." />
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                <strong>Shared material detection:</strong> put a passage, instruction, diagram, image, table or graph before the questions that use it. You can use natural wording such as “Study the following table and answer questions 1 to 5” or a labelled block such as “Table: Class test scores”. For example:
                <pre className="my-2 overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-800">Passage: The Importance of Water{"\n"}Water is essential to life...{"\n"}End Shared Material{"\n"}1. Why is water important?{"\n"}A. ...</pre>
                EduProw attaches the detected text to the imported questions as a shared-material group, whether you import into the question bank or directly into a draft examination. You can review the detected passage in the preview. Text-based tables are retained as text. Embedded PDF pictures are not extracted automatically yet; paste a publicly accessible image URL into the shared-material or individual-question image field in the preview.
            </div>

            <Card>
                <CardContent className="space-y-5 p-5 sm:p-7">
                    <div className="rounded-xl border border-dashed p-6 text-center">
                        <FileText className="mx-auto h-10 w-10 text-slate-400" />
                        <h2 className="mt-3 font-semibold">Upload CBT Question PDF</h2>
                        <p className="mt-1 text-sm text-slate-500">Maximum 10 MB. Text-based PDFs only; scanned PDFs are not supported yet.</p>
                        {targetExamId && <p className="mx-auto mt-2 max-w-2xl rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-600">For combined examinations, include a subject line under every question, for example <strong>Subject: Physics</strong>, followed by the options and <strong>Answer: B</strong>. The subject name must match a subject in the selected examination. EduProw will assign it automatically.</p>}
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
                                <p className="text-sm text-slate-500">{preview.questions.length} question(s) detected • {preview.questions.filter((q) => q.valid && (!targetExamId || q.subject_id)).length} ready to import • {preview.questions.filter((q) => !q.valid || (targetExamId && !q.subject_id)).length} need review</p>
                            </div>
                            <Button onClick={importQuestions} disabled={importing}>{importing ? "Importing..." : `Import ${preview.questions.length} Question(s)`}</Button>
                        </div>

                        {preview.truncated && <div className="mb-4 flex gap-2 rounded-lg border p-3 text-sm"><AlertTriangle className="h-5 w-5 shrink-0" /> Only the first 500 questions were returned.</div>}

                        <div className="space-y-5">
                            {preview.questions.map((q, index) => (
                                <div key={`${q.number}-${index}`} className="rounded-xl border p-4">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold"><span>Question {q.number}</span>{q.valid && (!targetExamId || q.subject_id) ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</div>
                                        <Button variant="outline" onClick={() => removeQuestion(index)}><X className="h-4 w-4" /></Button>
                                    </div>
                                    {!q.valid && q.warning && <div className="mb-3 rounded-lg border p-3 text-sm">{q.warning}</div>}
                                    {targetExamId && <div className="mt-3 rounded-lg border p-3 text-sm">
                                        {q.subject_id ? <div className="flex flex-wrap items-center gap-2"><span className="text-slate-500">Detected subject:</span><span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">{q.mapped_subject_name}</span><span className="text-xs text-slate-500">(from Subject: {q.subject_name})</span></div> : <>
                                            <div className="mb-2 flex items-center gap-2 font-medium text-amber-700"><AlertTriangle className="h-4 w-4" /> {q.subject_name ? `Subject “${q.subject_name}” was not found in this examination.` : "Subject tag is missing from this question."}</div>
                                            <label className="block text-xs font-medium">Choose the correct section to resolve this question
                                                <select className="mt-1 w-full rounded-lg border p-2 text-sm" value={q.subject_id} onChange={(e) => updateQuestion(index, "subject_id", e.target.value)}>
                                                    <option value="">Select subject section</option>
                                                    {(targetExam?.exam_subjects || []).filter((section) => !Array.isArray(targetExam?.manageable_subject_ids) || targetExam.manageable_subject_ids.map(Number).includes(Number(section.subject_id))).map((section) => <option key={section.subject_id} value={section.subject_id}>{section.section_title || section.subject_name}</option>)}
                                                </select>
                                            </label>
                                        </>}
                                    </div>}
                                    {q.group_key && (q.group_material_text || q.group_image_url) && (
                                        <details className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                                            <summary className="cursor-pointer font-medium text-blue-900">Detected shared {q.group_material_type || "material"}: {q.group_title}</summary>
                                            {q.group_instructions && <p className="mt-2 font-medium text-slate-700">{q.group_instructions}</p>}
                                            {q.group_material_text && <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">{q.group_material_text}</pre>}
                                            <label className="mt-3 block text-xs font-medium text-slate-700">Shared image URL (optional)
                                                <input className="mt-1 w-full rounded-lg border bg-white p-2 text-sm" value={q.group_image_url || ""} onChange={(e) => updateGroupMaterial(q.group_key, "group_image_url", e.target.value)} placeholder="Paste a publicly accessible image URL" />
                                            </label>
                                            {q.group_image_url && <img src={q.group_image_url} alt="Shared question material preview" className="mt-3 max-h-64 w-full rounded-lg border bg-white object-contain p-2" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                                            <p className="mt-2 text-xs text-slate-500">The text and any supplied image URL will be shared by every question in this group. Text-based tables are retained as extracted text. Embedded PDF pictures are not yet extracted automatically; add their image URL here.</p>
                                        </details>
                                    )}
                                    <textarea className="w-full rounded-lg border p-3" rows="3" value={q.question_text} onChange={(e) => updateQuestion(index, "question_text", e.target.value)} placeholder="Question text" />
                                    <label className="mt-3 block text-xs font-medium text-slate-700">Question image URL (optional)
                                        <input className="mt-1 w-full rounded-lg border p-2 text-sm" value={q.image_url || ""} onChange={(e) => updateQuestion(index, "image_url", e.target.value)} placeholder="Paste a publicly accessible image URL" />
                                    </label>
                                    {q.image_url && <img src={q.image_url} alt="Question image preview" className="mt-2 max-h-48 w-full rounded-lg border bg-white object-contain p-2" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        {q.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="rounded-lg border p-3">
                                                <div className="flex items-center gap-2"><span className="font-bold">{String.fromCharCode(65 + optionIndex)}.</span><input className="w-full outline-none" value={option.option_text} onChange={(e) => updateOption(index, optionIndex, "option_text", e.target.value)} placeholder="Option text" /><input type="radio" name={`correct-${index}`} checked={option.is_correct} onChange={() => setCorrect(index, optionIndex)} /></div>
                                                <input className="mt-2 w-full rounded border p-2 text-xs" value={option.option_image_url || ""} onChange={(e) => updateOption(index, optionIndex, "option_image_url", e.target.value)} placeholder="Option image URL (optional)" />
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
