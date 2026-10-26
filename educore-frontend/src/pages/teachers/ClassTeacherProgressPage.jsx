import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ClipboardList, RefreshCw, Save } from "lucide-react";
import api from "@/api/axios";
import { getMyClassTeacherClasses, getClassTeacherStudents, saveProgressReportDraft } from "@/api/classTeacherProgressApi";

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function ClassTeacherProgressPage() {
    const [classes, setClasses] = useState([]);
    const [terms, setTerms] = useState([]);
    const [students, setStudents] = useState([]);
    const [assignmentId, setAssignmentId] = useState("");
    const [studentId, setStudentId] = useState("");
    const [termId, setTermId] = useState("");
    const [reportType, setReportType] = useState("weekly");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [comment, setComment] = useState("");
    const [strengths, setStrengths] = useState("");
    const [improvements, setImprovements] = useState("");
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const selectedClass = classes.find(item => String(item.assignment_id) === String(assignmentId));
    const availableTerms = useMemo(
        () => terms.filter(term => String(term.session_id) === String(selectedClass?.session_id)),
        [terms, selectedClass]
    );

    const loadBaseData = async () => {
        setLoading(true);
        setError("");
        try {
            const [myClasses, termsResponse] = await Promise.all([
                getMyClassTeacherClasses(),
                api.get("/terms")
            ]);
            setClasses(myClasses || []);
            setTerms(termsResponse.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load class-teacher information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBaseData(); }, []);

    useEffect(() => {
        setStudentId("");
        setTermId("");
        setStudents([]);
        if (!assignmentId) return;
        let cancelled = false;
        setStudentsLoading(true);
        getClassTeacherStudents(assignmentId)
            .then(data => { if (!cancelled) setStudents(data || []); })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || "Unable to load students for this class."); })
            .finally(() => { if (!cancelled) setStudentsLoading(false); });
        return () => { cancelled = true; };
    }, [assignmentId]);

    useEffect(() => {
        if (availableTerms.length === 1) setTermId(String(availableTerms[0].id));
        else if (!availableTerms.some(term => String(term.id) === String(termId))) setTermId("");
    }, [availableTerms, termId]);

    const handleSubmit = async event => {
        event.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);
        try {
            await saveProgressReportDraft({
                assignment_id: Number(assignmentId),
                student_id: Number(studentId),
                term_id: Number(termId),
                report_type: reportType,
                period_start: periodStart,
                period_end: periodEnd,
                class_teacher_comment: comment.trim(),
                strengths: strengths.trim(),
                areas_for_improvement: improvements.trim()
            });
            setMessage("Progress report draft saved. It has not been published to parents.");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to save this progress report draft.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading class-teacher workspace…</div>;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Student Progress Reports</h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Prepare a student's overall progress update for your assigned class. Reports remain drafts until a school administrator reviews and publishes them.</p>
                </div>
                <button type="button" onClick={loadBaseData} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><BookOpenCheck className="h-5 w-5" /></div>
                        <div><p className="text-sm text-slate-500">Your assigned classes</p><p className="text-2xl font-semibold text-slate-900">{classes.length}</p></div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><ClipboardList className="h-5 w-5" /></div>
                        <div><p className="text-sm text-slate-500">Students in selected class</p><p className="text-2xl font-semibold text-slate-900">{students.length}</p></div>
                    </div>
                </div>
            </div>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {message && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

            {classes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <h2 className="font-semibold text-slate-900">No class-teacher assignment found</h2>
                    <p className="mt-2 text-sm text-slate-500">Ask your school administrator to assign you as a class teacher for a class and academic session.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Prepare a progress report</h2>
                        <p className="mt-1 text-sm text-slate-500">Select a student and reporting period, then save the report as a draft.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="space-y-1.5 text-sm font-medium text-slate-700">Assigned class
                            <select required value={assignmentId} onChange={e => setAssignmentId(e.target.value)} className={inputClass}>
                                <option value="">Select your class</option>
                                {classes.map(item => <option key={item.assignment_id} value={item.assignment_id}>{item.class_name}{item.arm_name ? " " + item.arm_name : ""} — {item.session_name}</option>)}
                            </select>
                        </label>
                        <label className="space-y-1.5 text-sm font-medium text-slate-700">Student
                            <select required value={studentId} onChange={e => setStudentId(e.target.value)} disabled={!assignmentId || studentsLoading} className={inputClass}>
                                <option value="">{studentsLoading ? "Loading students…" : "Select student"}</option>
                                {students.map(student => <option key={student.student_id} value={student.student_id}>{student.student_name}{student.admission_number ? " (" + student.admission_number + ")" : ""}</option>)}
                            </select>
                        </label>
                        <label className="space-y-1.5 text-sm font-medium text-slate-700">Reporting type
                            <select required value={reportType} onChange={e => setReportType(e.target.value)} className={inputClass}>
                                <option value="weekly">Weekly</option>
                                <option value="midterm">Midterm</option>
                                <option value="quarter_term">Quarter-term</option>
                                <option value="end_of_term">End of term</option>
                            </select>
                        </label>
                        <label className="space-y-1.5 text-sm font-medium text-slate-700">Term
                            <select required value={termId} onChange={e => setTermId(e.target.value)} disabled={!assignmentId} className={inputClass}>
                                <option value="">Select term</option>
                                {availableTerms.map(term => <option key={term.id} value={term.id}>{term.term_name}</option>)}
                            </select>
                        </label>
                        <label className="space-y-1.5 text-sm font-medium text-slate-700">Period start
                            <input required type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className={inputClass} />
                        </label>
                        <label className="space-y-1.5 text-sm font-medium text-slate-700">Period end
                            <input required type="date" min={periodStart || undefined} value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className={inputClass} />
                        </label>
                    </div>
                    <div className="space-y-4">
                        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Overall class-teacher comment
                            <textarea rows={3} maxLength={4000} value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe the student's general progress, participation, conduct, and punctuality…" className={inputClass + " resize-y"} />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Strengths and achievements
                            <textarea rows={2} maxLength={4000} value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="What is the student doing well?" className={inputClass + " resize-y"} />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Areas for improvement
                            <textarea rows={2} maxLength={4000} value={improvements} onChange={e => setImprovements(e.target.value)} placeholder="What should the student focus on next?" className={inputClass + " resize-y"} />
                        </label>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500">This draft contains class-teacher observations only. Subject marks remain managed through existing result entry.</p>
                        <button type="submit" disabled={saving || !assignmentId || !studentId || !termId || !periodStart || !periodEnd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                            <Save className="h-4 w-4" /> {saving ? "Saving draft…" : "Save report draft"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ClassTeacherProgressPage;
