import { useEffect, useMemo, useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import { getSessions } from "@/services/sessionService";
import { getTerms } from "@/services/termService";
import { getMyResultReport } from "@/services/studentPortalService";

function StudentResultsPage() {
    const [sessions, setSessions] = useState([]);
    const [terms, setTerms] = useState([]);
    const [sessionId, setSessionId] = useState("");
    const [termId, setTermId] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                const [sessionData, termData] = await Promise.all([getSessions(), getTerms()]);
                if (!mounted) return;

                setSessions(sessionData || []);
                setTerms(termData || []);

                const currentSession = (sessionData || []).find((item) => item.is_current);
                const fallbackSession = currentSession || (sessionData || [])[0];
                const initialSessionId = fallbackSession ? String(fallbackSession.id) : "";
                setSessionId(initialSessionId);

                const sessionTerms = (termData || []).filter(
                    (item) => String(item.session_id) === initialSessionId
                );
                const currentTerm = sessionTerms.find((item) => item.is_current) || sessionTerms[0];
                setTermId(currentTerm ? String(currentTerm.id) : "");
            } catch (err) {
                if (mounted) setError(err?.response?.data?.message || "Unable to load academic sessions and terms.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, []);

    const availableTerms = useMemo(
        () => terms.filter((item) => String(item.session_id) === String(sessionId)),
        [terms, sessionId]
    );

    useEffect(() => {
        if (!sessionId) return;
        if (!availableTerms.some((item) => String(item.id) === String(termId))) {
            const current = availableTerms.find((item) => item.is_current) || availableTerms[0];
            setTermId(current ? String(current.id) : "");
        }
    }, [sessionId, availableTerms, termId]);

    const loadReport = async () => {
        if (!sessionId || !termId) {
            setReport(null);
            setMessage("Select an academic session and term to view your result.");
            return;
        }

        try {
            setLoadingReport(true);
            setError("");
            setMessage("");
            const data = await getMyResultReport(sessionId, termId);
            setReport(data);
        } catch (err) {
            setReport(null);
            if (err?.response?.status === 404) {
                setMessage("No result has been published for you for the selected term yet.");
            } else {
                setError(err?.response?.data?.message || "Unable to load your result.");
            }
        } finally {
            setLoadingReport(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title="My Results"
                description="View your academic results by session and term."
            />

            {error && <div className="app-surface p-5 text-sm text-red-600">{error}</div>}

            <div className="app-surface p-5">
                <div className="grid gap-4 md:grid-cols-3 md:items-end">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Academic Session</label>
                        <select
                            value={sessionId}
                            onChange={(event) => setSessionId(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Select session</option>
                            {sessions.map((session) => (
                                <option key={session.id} value={session.id}>{session.session_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Term</label>
                        <select
                            value={termId}
                            onChange={(event) => setTermId(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Select term</option>
                            {availableTerms.map((term) => (
                                <option key={term.id} value={term.id}>{term.term_name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={loadReport}
                        disabled={loadingReport || !sessionId || !termId}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loadingReport && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loadingReport ? "Loading..." : "View Result"}
                    </button>
                </div>
            </div>

            {message && !report && (
                <div className="app-surface p-8 text-center">
                    <FileText className="mx-auto h-10 w-10 text-slate-400" />
                    <h2 className="mt-3 font-semibold text-slate-900">No result available</h2>
                    <p className="mt-1 text-sm text-slate-500">{message}</p>
                </div>
            )}

            {report && (
                <>
                    <div className="app-surface p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Student</p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-900">{report.student?.name}</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {report.student?.admission_number} • {report.student?.class_name}
                                    {report.student?.arm_name ? ` • ${report.student.arm_name}` : ""}
                                </p>
                            </div>
                            <div className="text-right text-sm text-slate-600">
                                <div className="font-medium">{report.academic?.session_name}</div>
                                <div>{report.academic?.term_name}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="app-surface p-5">
                            <p className="text-sm text-slate-500">Subjects</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{report.summary?.number_of_subjects ?? 0}</p>
                        </div>
                        <div className="app-surface p-5">
                            <p className="text-sm text-slate-500">Average</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{report.summary?.average_score ?? 0}%</p>
                        </div>
                        <div className="app-surface p-5">
                            <p className="text-sm text-slate-500">Overall Position</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{report.summary?.overall_position ?? "—"}</p>
                        </div>
                    </div>

                    <div className="app-surface overflow-hidden">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="font-semibold text-slate-900">Subject Results</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Subject</th>
                                        <th className="px-5 py-3 text-right">CA</th>
                                        <th className="px-5 py-3 text-right">Exam</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3">Grade</th>
                                        <th className="px-5 py-3">Remark</th>
                                        <th className="px-5 py-3 text-right">Position</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(report.results || []).map((result) => (
                                        <tr key={`${result.subject_name}-${result.position ?? "x"}`} className="text-slate-700">
                                            <td className="px-5 py-4 font-medium text-slate-900">{result.subject_name}</td>
                                            <td className="px-5 py-4 text-right">{result.ca_score}</td>
                                            <td className="px-5 py-4 text-right">{result.exam_score}</td>
                                            <td className="px-5 py-4 text-right font-semibold">{result.total_score}</td>
                                            <td className="px-5 py-4 font-semibold">{result.grade}</td>
                                            <td className="px-5 py-4">{result.remark || "—"}</td>
                                            <td className="px-5 py-4 text-right">{result.position ?? "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default StudentResultsPage;
