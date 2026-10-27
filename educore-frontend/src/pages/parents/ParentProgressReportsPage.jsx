import { useEffect, useState } from "react";
import { FileText, RefreshCw, CalendarDays, GraduationCap } from "lucide-react";
import api from "@/api/axios";

const pretty = value => String(value || "").replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
const dateLabel = value => value ? new Date(value).toLocaleDateString() : "—";

export default function ParentProgressReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReports = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/class-teacher-progress/parent/reports");
            setReports(response.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load published progress reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReports(); }, []);

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Children's Progress</h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Read progress updates published by your child's school, including the class teacher's observations and areas for improvement.</p>
                </div>
                <button onClick={loadReports} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
            </header>

            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading published reports…</p> :
                reports.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <FileText className="mx-auto h-9 w-9 text-slate-400" />
                    <h2 className="mt-3 font-semibold text-slate-900">No published progress reports yet</h2>
                    <p className="mt-1 text-sm text-slate-500">When the school publishes a report for your child, it will appear here.</p>
                </div> :
                <div className="space-y-5">
                    {reports.map(report => <article key={report.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-700"><GraduationCap className="h-5 w-5" /></div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">{report.student_name}</h2>
                                    <p className="mt-1 text-sm text-slate-600">{report.class_name}{report.arm_name ? ` · ${report.arm_name}` : ""} · {report.admission_number || "No admission number"}</p>
                                    <p className="mt-1 text-xs text-slate-500">{pretty(report.report_type)} · {report.term_name} ({report.session_name})</p>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500"><CalendarDays className="mr-1 inline h-4 w-4" /> {dateLabel(report.period_start)} – {dateLabel(report.period_end)}</div>
                        </div>
                        <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-3">
                            <section><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class teacher's comment</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.class_teacher_comment || "No comment provided."}</p></section>
                            <section><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Strengths</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.strengths || "No strengths recorded."}</p></section>
                            <section><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Areas for improvement</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.areas_for_improvement || "No areas recorded."}</p></section>
                        </div>
                        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5">Published {dateLabel(report.published_at)} · Class teacher: {report.class_teacher_name}</div>
                    </article>)}
                </div>
            }
        </main>
    );
}
