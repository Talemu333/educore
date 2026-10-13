import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, FileText, GraduationCap, RefreshCw } from "lucide-react";
import api from "@/api/axios";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";

function StudentDashboardPage() {
    const { user } = useAuth();

    const displayName = user?.full_name || user?.username || "Student";
    const [cbtResults, setCbtResults] = useState([]);
    const [cbtResultsLoading, setCbtResultsLoading] = useState(true);
    const [cbtResultsError, setCbtResultsError] = useState("");

    const loadCbtResults = async () => {
        setCbtResultsLoading(true);
        setCbtResultsError("");
        try {
            const response = await api.get("/cbt/my-attempts?page=1&limit=10");
            const attempts = response.data?.data || [];
            setCbtResults(attempts.filter(item => item.result_available === true && ["submitted", "expired"].includes(item.status)));
        } catch (error) {
            setCbtResultsError(error.response?.data?.message || "Unable to load CBT results.");
        } finally {
            setCbtResultsLoading(false);
        }
    };

    useEffect(() => { loadCbtResults(); }, []);

    const cards = [
        {
            title: "CBT Practice",
            description: "Take available computer-based tests and view your attempts.",
            icon: ClipboardList,
            path: "/student-cbt",
        },
        {
            title: "My Results",
            description: "View your academic results as they become available.",
            icon: FileText,
            path: "/student-results",
        },
        {
            title: "My Subjects",
            description: "View the subjects assigned to your class.",
            icon: BookOpen,
            path: "/student-subjects",
        },
    ];

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title={`Welcome, ${displayName}`}
                description="Your EduCore student portal."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map(({ title, description, icon: Icon, path }) => (
                    <Link
                        key={title}
                        to={path}
                        className="group app-surface block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 group-hover:text-blue-700">
                                    {title}
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="app-surface p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-slate-900">My Published CBT Results</h2>
                        <p className="mt-1 text-sm text-slate-500">Scores appear here after the school releases them.</p>
                    </div>
                    <button type="button" onClick={loadCbtResults} disabled={cbtResultsLoading} className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                        <RefreshCw className={`mr-2 h-4 w-4 ${cbtResultsLoading ? "animate-spin" : ""}`} /> Refresh results
                    </button>
                </div>
                {cbtResultsError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{cbtResultsError}</p>}
                {cbtResultsLoading ? <p className="py-4 text-sm text-slate-500">Loading your CBT results…</p> :
                    cbtResults.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No CBT results have been released for your completed attempts yet. If your school has just published a result, select “Refresh results”.</p> :
                    <div className="space-y-3">
                        {cbtResults.map(item => (
                            <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{item.title || "CBT Examination"}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{item.subject_name || "Subject"} · Attempt #{item.attempt_number}</p>
                                    <p className="mt-1 text-xs text-emerald-700">Result released</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-lg font-bold text-slate-900">{Number(item.score || 0).toFixed(2)} / {Number(item.total_marks || 0).toFixed(2)}</p>
                                    <p className="text-sm text-slate-600">{Number(item.percentage || 0).toFixed(2)}%</p>
                                    <p className="mt-1 text-xs text-slate-500">Correct: {item.correct_answers ?? 0} · Wrong: {item.wrong_answers ?? 0} · Unanswered: {item.unanswered ?? 0}</p>
                                </div>
                            </div>
                        ))}
                        <Link to="/student-cbt" className="inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">View all CBT attempts →</Link>
                    </div>
                }
            </div>

            <div className="app-surface p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900">Student Portal</h2>
                        <p className="text-sm text-slate-500">
                            More student services will be added here as EduCore grows.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboardPage;
