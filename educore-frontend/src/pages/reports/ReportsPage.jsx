import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, LockKeyhole, Users, BookOpen, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import api from "@/api/axios";
import { getClassResultSheet } from "@/services/resultService";
import { useSessions } from "@/hooks/useSessions";
import { useTerms } from "@/hooks/useTerms";
import { useClasses } from "@/hooks/useClasses";
import { useArmsByClass } from "@/hooks/useArmsByClass";

function ReportsPage() {
    const [sessionId, setSessionId] = useState("");
    const [termId, setTermId] = useState("");
    const [classId, setClassId] = useState("");
    const [armId, setArmId] = useState("");
    const [publication, setPublication] = useState(null);
    const [resultSheet, setResultSheet] = useState(null);
    const [resultLoading, setResultLoading] = useState(false);
    const [resultError, setResultError] = useState("");
    const [publishing, setPublishing] = useState(false);

    const { data: sessions = [] } = useSessions();
    const { data: terms = [] } = useTerms();
    const { data: classes = [] } = useClasses();
    const { data: arms = [], isLoading: armsLoading, isFetching: armsFetching } = useArmsByClass(classId);

    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const safeTerms = Array.isArray(terms) ? terms : [];
    const safeClasses = Array.isArray(classes) ? classes : [];
    const safeArms = Array.isArray(arms) ? arms : [];
    const resultRows = Array.isArray(resultSheet?.results) ? resultSheet.results : [];

    const filteredTerms = useMemo(
        () => safeTerms.filter(term => Number(term.session_id) === Number(sessionId)),
        [safeTerms, sessionId]
    );

    useEffect(() => setTermId(""), [sessionId]);
    useEffect(() => setArmId(""), [classId]);

    const selectionReady = Boolean(
        sessionId && termId && classId && !armsLoading && !armsFetching && (safeArms.length === 0 || armId)
    );

    const loadSelectionData = async () => {
        if (!selectionReady) {
            setPublication(null);
            setResultSheet(null);
            setResultError("");
            return;
        }

        setResultLoading(true);
        setResultError("");

        try {
            const [publicationResponse, resultResponse] = await Promise.allSettled([
                api.get("/results/publication", {
                    params: { sessionId, termId, classId, armId: armId || undefined },
                }),
                getClassResultSheet(classId, armId || null, sessionId, termId),
            ]);

            if (publicationResponse.status === "fulfilled") {
                setPublication(publicationResponse.value.data?.data || null);
            } else {
                setPublication(null);
            }

            if (resultResponse.status === "fulfilled") {
                const data = resultResponse.value;
                setResultSheet(data && Array.isArray(data.results) ? data : null);
                if (!data || !Array.isArray(data.results)) {
                    setResultError("The result service returned no result records for this selection.");
                }
            } else {
                setResultSheet(null);
                setResultError(
                    resultResponse.reason?.response?.data?.message ||
                    "No result records were found for the selected class, arm, session and term."
                );
            }
        } catch (error) {
            setResultSheet(null);
            setResultError(error.response?.data?.message || "Unable to load the selected result records.");
        } finally {
            setResultLoading(false);
        }
    };

    useEffect(() => {
        loadSelectionData();
    }, [sessionId, termId, classId, armId, armsLoading, armsFetching, safeArms.length]);

    const publishResults = async () => {
        if (!selectionReady) {
            toast.error("Select the session, term, class and arm first.");
            return;
        }

        if (!resultRows.length) {
            toast.error("There are no result records to publish for this selection.");
            return;
        }

        if (!window.confirm("Publish this result for students? Students in this class and arm will be able to view their report for the selected term.")) return;

        setPublishing(true);
        try {
            const response = await api.post("/results/publish", {
                session_id: Number(sessionId),
                term_id: Number(termId),
                class_id: Number(classId),
                arm_id: armId ? Number(armId) : null,
            });
            setPublication(response.data?.data || null);
            toast.success(response.data?.message || "Result published successfully.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to publish result.");
        } finally {
            setPublishing(false);
        }
    };

    const selectedClass = safeClasses.find(item => Number(item.id) === Number(classId));
    const selectedArm = safeArms.find(item => Number(item.id) === Number(armId));
    const studentCount = resultRows.length;
    const subjectCount = resultRows.reduce(
        (highest, student) => Math.max(highest, Number(student.number_of_subjects || 0)),
        0
    );
    const scoredStudents = resultRows
        .map(student => ({
            name: String(student.student_name || "Student"),
            average: Number(student.average_score),
        }))
        .filter(student => Number.isFinite(student.average) && student.average >= 0);
    const classAverage = scoredStudents.length
        ? scoredStudents.reduce((sum, student) => sum + student.average, 0) / scoredStudents.length
        : null;
    const chartStudents = [...scoredStudents]
        .sort((a, b) => b.average - a.average)
        .slice(0, 8);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Publish Results"
                description="Check the class result records before making the selected term result visible to students and parents."
            />

            <section className="app-surface overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Result Publication</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Select a session, term, class and arm to review the available result records before publishing.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <label className="text-sm font-medium text-slate-700">
                            Academic Session
                            <select value={sessionId} onChange={event => setSessionId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                                <option value="">Select session</option>
                                {safeSessions.map(session => <option key={session.id} value={session.id}>{session.session_name}</option>)}
                            </select>
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Term
                            <select value={termId} onChange={event => setTermId(event.target.value)} disabled={!sessionId} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-50">
                                <option value="">Select term</option>
                                {filteredTerms.map(term => <option key={term.id} value={term.id}>{term.term_name}</option>)}
                            </select>
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Class
                            <select value={classId} onChange={event => setClassId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                                <option value="">Select class</option>
                                {safeClasses.map(item => <option key={item.id} value={item.id}>{item.class_name}</option>)}
                            </select>
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Arm
                            <select value={armId} onChange={event => setArmId(event.target.value)} disabled={!classId || armsLoading || armsFetching || safeArms.length === 0} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-50">
                                {armsLoading || armsFetching ? (
                                    <option value="">Loading arms...</option>
                                ) : safeArms.length === 0 ? (
                                    <option value="">No arm</option>
                                ) : (
                                    <><option value="">Select arm</option>{safeArms.map(arm => <option key={arm.id} value={arm.id}>{arm.arm_name}</option>)}</>
                                )}
                            </select>
                        </label>
                    </div>

                    {selectionReady && (
                        <div className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-slate-500" /><div><p className="text-xs text-slate-500">Students with results</p><p className="text-xl font-semibold text-slate-900">{resultLoading ? "—" : studentCount}</p></div></div></div>
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-slate-500" /><div><p className="text-xs text-slate-500">Subjects</p><p className="text-xl font-semibold text-slate-900">{resultLoading ? "—" : subjectCount}</p></div></div></div>
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2"><p className="text-xs text-slate-500">Selected result</p><p className="mt-1 font-semibold text-slate-900">{selectedClass?.class_name || resultSheet?.class?.class_name || "-"}{selectedArm ? ` — ${selectedArm.arm_name}` : ""}</p><p className="mt-0.5 text-sm text-slate-500">{resultSheet?.session?.session_name || ""} · {resultSheet?.term?.term_name || ""}</p></div>
                            </div>

                            {!resultLoading && !resultError && resultRows.length > 0 && (
                                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Academic Performance Snapshot</h3>
                                            <p className="mt-1 text-sm text-slate-500">Based on the selected class, arm, session and term result records.</p>
                                        </div>
                                        <p className="text-sm text-slate-600">Class average: <span className="font-semibold text-slate-900">{classAverage === null ? "—" : classAverage.toFixed(2)}%</span></p>
                                    </div>
                                    {chartStudents.length > 0 ? (
                                        <div className="mt-5 space-y-3" role="img" aria-label="Horizontal bar chart showing the eight highest student average scores">
                                            {chartStudents.map((student, index) => {
                                                const width = Math.max(0, Math.min(100, student.average));
                                                return (
                                                    <div key={student.name + index} className="grid grid-cols-[minmax(0,1fr)_minmax(5rem,2fr)_3.5rem] items-center gap-3">
                                                        <span className="truncate text-xs font-medium text-slate-700" title={student.name}>{student.name}</span>
                                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                            <div className="h-full rounded-full bg-sky-600 transition-[width]" style={{ width: `${width}%` }} />
                                                        </div>
                                                        <span className="text-right text-xs font-semibold tabular-nums text-slate-700">{student.average.toFixed(1)}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm text-slate-500">No valid average scores are available to chart for this selection.</p>
                                    )}
                                    <p className="mt-3 text-xs text-slate-400">Showing up to eight students with the highest recorded averages. This chart does not replace the full result table.</p>
                                </section>
                            )}

                            {resultLoading ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">Loading result records...</div>
                            ) : resultError ? (
                                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center"><p className="font-semibold text-amber-900">No result records found</p><p className="mt-1 text-sm text-amber-800">{resultError}</p></div>
                            ) : !resultRows.length ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><p className="font-semibold text-slate-900">No result records found</p><p className="mt-1 text-sm text-slate-500">There are no result records for the selected class, arm, session and term.</p></div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3"><p className="font-semibold text-slate-900">Result Records</p><p className="text-sm text-slate-500">These are the records that will be made available after publication.</p></div>
                                    <table className="w-full text-sm">
                                        <thead className="bg-white"><tr className="border-b border-slate-200"><th className="px-4 py-3 text-center">S/N</th><th className="px-4 py-3 text-left">Admission No.</th><th className="px-4 py-3 text-left">Student Name</th><th className="px-4 py-3 text-center">Subjects</th><th className="px-4 py-3 text-center">Total</th><th className="px-4 py-3 text-center">Average</th><th className="px-4 py-3 text-center">Position</th></tr></thead>
                                        <tbody>{resultRows.map((student, index) => <tr key={student.student_id} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3 text-center">{index + 1}</td><td className="px-4 py-3">{student.admission_number}</td><td className="px-4 py-3 font-medium text-slate-900">{student.student_name}</td><td className="px-4 py-3 text-center">{Number(student.number_of_subjects || 0)}</td><td className="px-4 py-3 text-center font-semibold">{Number(student.total_score || 0)}</td><td className="px-4 py-3 text-center">{Number(student.average_score || 0).toFixed(2)}</td><td className="px-4 py-3 text-center">{student.overall_position ?? student.position ?? "-"}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">{publication ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />}<div><p className="font-semibold text-slate-900">{publication ? "Result published" : "Result not published"}</p><p className="mt-1 text-sm text-slate-500">{publication ? `Published ${new Date(publication.published_at).toLocaleString()}. Students and parents can now view the result.` : "Students and parents cannot view this report until it is published."}</p></div></div>
                        <div className="flex items-center gap-2"><Button type="button" variant="outline" onClick={loadSelectionData} disabled={resultLoading || !selectionReady}><RefreshCw className="mr-2 h-4 w-4" />Refresh Records</Button><Button type="button" onClick={publishResults} disabled={publishing || resultLoading || !resultRows.length || Boolean(publication)}>{publishing ? "Publishing..." : publication ? "Published" : "Publish Result"}</Button></div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ReportsPage;
