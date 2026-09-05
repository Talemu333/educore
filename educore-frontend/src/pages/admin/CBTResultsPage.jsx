import { useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, FileText, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString();
};

const studentName = (item) =>
    [item.surname, item.first_name, item.middle_name].filter(Boolean).join(" ") || "Unknown student";

const statusLabel = (status) => status?.replace(/_/g, " ") || "—";

function CBTResultsPage() {
    const [attempts, setAttempts] = useState([]);
    const [exams, setExams] = useState([]);
    const [search, setSearch] = useState("");
    const [examFilter, setExamFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [performanceExam, setPerformanceExam] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [attemptResponse, examResponse] = await Promise.all([
                api.get("/cbt/reports/attempts"),
                api.get("/cbt/exams")
            ]);
            setAttempts(attemptResponse.data?.data || []);
            setExams(examResponse.data?.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load CBT reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const filteredAttempts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return attempts.filter((item) => {
            const matchesExam = !examFilter || String(item.exam_id) === String(examFilter);
            if (!matchesExam) return false;
            if (!term) return true;
            return [
                studentName(item),
                item.admission_number,
                item.title,
                item.subject_name,
                item.status
            ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
        });
    }, [attempts, examFilter, search]);

    const openAttempt = async (id) => {
        setDetailLoading(true);
        try {
            const response = await api.get(`/cbt/reports/attempts/${id}`);
            setSelectedAttempt(response.data?.data || null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load attempt details.");
        } finally {
            setDetailLoading(false);
        }
    };

    const openPerformance = async (exam) => {
        try {
            const response = await api.get(`/cbt/reports/exams/${exam.id}/performance`);
            setPerformance(response.data?.data || null);
            setPerformanceExam(exam);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load examination performance.");
        }
    };

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title="CBT Results & Reports"
                description="Review student attempts, scores and examination performance."
            />

            <Card>
                <CardContent className="p-5 sm:p-7">
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-900">Student Attempts</h2>
                            <p className="text-sm text-slate-500">{filteredAttempts.length} attempt(s) shown.</p>
                        </div>
                        <Button variant="outline" onClick={loadReports} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>

                    <div className="mb-5 grid gap-3 md:grid-cols-2">
                        <input
                            className="rounded-lg border p-3"
                            placeholder="Search student, admission number, exam or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select className="rounded-lg border p-3" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
                            <option value="">All examinations</option>
                            {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
                        </select>
                    </div>

                    {loading ? (
                        <p className="py-10 text-center text-sm text-slate-500">Loading CBT reports...</p>
                    ) : filteredAttempts.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-10 text-center">
                            <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                            <p className="font-medium text-slate-700">No CBT attempts found.</p>
                            <p className="mt-1 text-sm text-slate-500">Results will appear here after students take an examination.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="min-w-[980px] w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3">Examination</th>
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3">Attempt</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3">Percentage</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Submitted</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredAttempts.map((item) => {
                                        const passed = Number(item.percentage) >= Number(item.pass_mark);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900">{studentName(item)}</div>
                                                    <div className="text-xs text-slate-500">{item.admission_number}</div>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{item.title}</td>
                                                <td className="px-4 py-3">{item.subject_name}</td>
                                                <td className="px-4 py-3">#{item.attempt_number}</td>
                                                <td className="px-4 py-3">{item.score ?? 0} / {item.total_marks ?? 0}</td>
                                                <td className="px-4 py-3 font-semibold">{Number(item.percentage ?? 0).toFixed(2)}%</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "in_progress" ? "bg-amber-100 text-amber-700" : passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                        {item.status === "in_progress" ? "In progress" : passed ? "Passed" : "Failed"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.submitted_at)}</td>
                                                <td className="px-4 py-3">
                                                    <Button variant="outline" onClick={() => openAttempt(item.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />View
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-700" />
                        <div>
                            <h2 className="font-semibold">Examination Performance</h2>
                            <p className="text-sm text-slate-500">View overall performance for each CBT examination.</p>
                        </div>
                    </div>
                    {exams.length === 0 ? (
                        <p className="py-6 text-sm text-slate-500">No examinations available.</p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {exams.map((exam) => (
                                <button key={exam.id} type="button" onClick={() => openPerformance(exam)} className="rounded-xl border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/30">
                                    <div className="font-semibold text-slate-900">{exam.title}</div>
                                    <div className="mt-1 text-sm text-slate-500">{exam.subject_name} • {exam.class_name}</div>
                                    <div className="mt-3 text-xs font-medium text-blue-700">View performance →</div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {performance && performanceExam && (
                <Card>
                    <CardContent className="p-5 sm:p-7">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Performance: {performanceExam.title}</h2>
                                <p className="text-sm text-slate-500">Overall examination statistics.</p>
                            </div>
                            <Button variant="outline" onClick={() => { setPerformance(null); setPerformanceExam(null); }}><X className="mr-2 h-4 w-4" />Close</Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                ["Attempts", performance.attempts],
                                ["Completed", performance.completed],
                                ["Passed", performance.passed],
                                ["Failed", performance.failed],
                                ["In progress", performance.in_progress],
                                ["Average", `${Number(performance.average_percentage ?? 0).toFixed(2)}%`],
                                ["Highest", `${Number(performance.highest_percentage ?? 0).toFixed(2)}%`],
                                ["Lowest", `${Number(performance.lowest_percentage ?? 0).toFixed(2)}%`]
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">{value ?? 0}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedAttempt && (
                <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/50 p-4 sm:p-8" onClick={() => setSelectedAttempt(null)}>
                    <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4 border-b p-5 sm:p-7">
                            <div>
                                <h2 className="text-lg font-bold">Attempt Details</h2>
                                <p className="text-sm text-slate-500">{studentName(selectedAttempt)} • {selectedAttempt.title}</p>
                                <p className="text-sm text-slate-500">{selectedAttempt.subject_name} • Attempt #{selectedAttempt.attempt_number}</p>
                            </div>
                            <Button variant="outline" onClick={() => setSelectedAttempt(null)}><X className="mr-2 h-4 w-4" />Close</Button>
                        </div>
                        <div className="space-y-5 p-5 sm:p-7">
                            {detailLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading details...</p> : (
                                <>
                                    <div className="grid gap-3 sm:grid-cols-4">
                                        <div className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">Score</span><div className="text-xl font-bold">{selectedAttempt.score ?? 0} / {selectedAttempt.total_marks ?? 0}</div></div>
                                        <div className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">Percentage</span><div className="text-xl font-bold">{Number(selectedAttempt.percentage ?? 0).toFixed(2)}%</div></div>
                                        <div className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">Correct</span><div className="text-xl font-bold">{selectedAttempt.correct_answers ?? 0}</div></div>
                                        <div className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">Wrong / Unanswered</span><div className="text-xl font-bold">{selectedAttempt.wrong_answers ?? 0} / {selectedAttempt.unanswered ?? 0}</div></div>
                                    </div>
                                    <div className="space-y-3">
                                        {(selectedAttempt.answers || []).map((answer, index) => (
                                            <div key={answer.id || index} className="rounded-xl border p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="font-medium text-slate-900">{index + 1}. {answer.question_text}</p>
                                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${answer.is_correct ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                        {answer.is_correct ? "Correct" : "Wrong"}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600">Selected: {answer.selected_option_text || "No answer"}</p>
                                                <p className="mt-1 text-sm text-emerald-700">Correct answer: {answer.correct_option_text || "—"}</p>
                                                <p className="mt-1 text-xs text-slate-500">Marks awarded: {answer.marks_awarded ?? 0} / {answer.marks ?? 0}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CBTResultsPage;
