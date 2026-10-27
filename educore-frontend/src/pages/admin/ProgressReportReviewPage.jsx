import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Send, RotateCcw } from "lucide-react";
import api from "@/api/axios";

const dateLabel = value => value ? new Date(value).toLocaleDateString() : "—";

export default function ProgressReportReviewPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadReports = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/class-teacher-progress/admin/review");
            setReports(response.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load reports for review.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadReports(); }, [loadReports]);

    const runAction = async (report, action) => {
        setBusyId(report.id);
        setError("");
        setMessage("");
        try {
            if (action === "publish") {
                await api.post(`/class-teacher-progress/admin/reports/${report.id}/publish`);
                setMessage("Report published for parents.");
            } else {
                const note = action === "return" ? window.prompt("Optional note for the class teacher:") : "";
                if (action === "return" && note === null) return;
                await api.post(`/class-teacher-progress/admin/reports/${report.id}/review`, { action, note: note || "" });
                setMessage(action === "approve" ? "Report approved. Publish it when ready." : "Report returned to the class teacher.");
            }
            await loadReports();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update this report.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <main className="mx-auto w-full max-w-7xl space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Student Progress Report Review</h1>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Review class-teacher reports before approving and publishing them to parents.</p>
                </div>
                <button onClick={loadReports} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </header>

            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

            {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading reports…</p> :
                reports.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                    <h2 className="mt-3 font-semibold text-slate-900">No reports awaiting action</h2>
                    <p className="mt-1 text-sm text-slate-500">Submitted reports will appear here for review.</p>
                </div> :
                <div className="space-y-4">
                    {reports.map(report => (
                        <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold text-slate-900">{report.student_name}</h2>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${report.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{report.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">{report.class_name}{report.arm_name ? ` · ${report.arm_name}` : ""} · {report.report_type.replaceAll("_", " ")} · {report.term_name} ({report.session_name})</p>
                                    <p className="text-xs text-slate-500">Class teacher: {report.class_teacher_name} · Period: {dateLabel(report.period_start)} – {dateLabel(report.period_end)}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {report.status === "submitted" && <>
                                        <button disabled={busyId === report.id} onClick={() => runAction(report, "return")} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Return</button>
                                        <button disabled={busyId === report.id} onClick={() => runAction(report, "approve")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> Approve</button>
                                    </>}
                                    {report.status === "approved" && <button disabled={busyId === report.id} onClick={() => runAction(report, "publish")} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Send className="h-4 w-4" /> Publish to parents</button>}
                                </div>
                            </div>
                            <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-3">
                                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class-teacher comment</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{report.class_teacher_comment || "Not provided"}</p></div>
                                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Strengths</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{report.strengths || "Not provided"}</p></div>
                                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Areas for improvement</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{report.areas_for_improvement || "Not provided"}</p></div>
                            </div>
                        </article>
                    ))}
                </div>
            }
        </main>
    );
}
