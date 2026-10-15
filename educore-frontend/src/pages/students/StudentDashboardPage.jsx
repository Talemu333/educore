import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, FileText, GraduationCap, RefreshCw, School, UserRound } from "lucide-react";
import api from "@/api/axios";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import AnnouncementSummary from "@/components/announcements/AnnouncementSummary";

const formatCbtDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
};

function StudentDashboardPage() {
    const { user } = useAuth();

    const [studentProfile, setStudentProfile] = useState(null);
    const [studentProfileLoading, setStudentProfileLoading] = useState(true);
    const [cbtAttempts, setCbtAttempts] = useState([]);
    const [cbtResultsLoading, setCbtResultsLoading] = useState(true);
    const [cbtResultsError, setCbtResultsError] = useState("");

    const loadCbtResults = async () => {
        setCbtResultsLoading(true);
        setCbtResultsError("");
        try {
            // Keep the dashboard aligned with the same attempt-history endpoint used by the CBT page.
            // Include completed attempts even while results are hidden so students can see their status.
            const response = await api.get("/cbt/my-attempts?page=1&limit=50");
            const attempts = response.data?.data || [];
            setCbtAttempts(attempts.filter(item => ["submitted", "expired"].includes(item.status)));
        } catch (error) {
            setCbtResultsError(error.response?.data?.message || "Unable to load CBT attempts.");
        } finally {
            setCbtResultsLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        const loadStudentProfile = async () => {
            setStudentProfileLoading(true);
            try {
                const response = await api.get("/students/me");
                if (active) setStudentProfile(response.data?.data || null);
            } catch (error) {
                // Keep the dashboard usable if profile details cannot be loaded.
                console.error("Unable to load student profile:", error);
                if (active) setStudentProfile(null);
            } finally {
                if (active) setStudentProfileLoading(false);
            }
        };

        loadStudentProfile();
        loadCbtResults();

        return () => { active = false; };
    }, []);

    const profileName = [
        studentProfile?.first_name,
        studentProfile?.middle_name,
        studentProfile?.surname,
    ].filter(value => String(value || "").trim()).join(" ");
    const displayName = profileName || user?.full_name || user?.username || "Student";
    const className = [studentProfile?.class_name, studentProfile?.arm_name]
        .filter(value => String(value || "").trim())
        .join(" · ");

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

<AnnouncementSummary />

                        <section className="app-surface p-5 sm:p-6" aria-label="Student profile">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <UserRound className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student name</p>
                            <h2 className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {studentProfileLoading ? "Loading profile…" : displayName}
                            </h2>
                            {studentProfile?.admission_number && (
                                <p className="mt-1 text-sm text-slate-500">Admission No.: {studentProfile.admission_number}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 sm:max-w-[50%]">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                            <School className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class</p>
                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {studentProfileLoading ? "Loading class…" : className || "Class not available"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

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
                        <h2 className="font-semibold text-slate-900">My CBT Results</h2>
                        <p className="mt-1 text-sm text-slate-500">Your completed attempts appear here. Scores become visible when the school publishes the CBT results.</p>
                    </div>
                    <button type="button" onClick={loadCbtResults} disabled={cbtResultsLoading} className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                        <RefreshCw className={`mr-2 h-4 w-4 ${cbtResultsLoading ? "animate-spin" : ""}`} /> Refresh results
                    </button>
                </div>
                {cbtResultsError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{cbtResultsError}</p>}
                {cbtResultsLoading ? <p className="py-4 text-sm text-slate-500">Loading your CBT results…</p> :
                    cbtAttempts.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">You have no completed CBT attempts yet. After you submit an examination, its status and released score will appear here.</p> :
                    <div className="space-y-3">
                        {cbtAttempts.map(item => (
                            <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{item.title || "CBT Examination"}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{item.subject_name || "Subject"} · Attempt #{item.attempt_number}</p>
                                    <p className="mt-1 text-xs text-slate-500">Submitted: {formatCbtDate(item.submitted_at || item.started_at || item.created_at)}</p>
                                    {item.result_available === true && item.score !== null && item.score !== undefined ? <p className="mt-1 text-xs text-emerald-700">Result released</p> : <p className="mt-1 text-xs text-amber-700">Submitted · Result not released yet</p>}
                                </div>
                                <div className="sm:text-right">
                                    {item.result_available === true && item.score !== null && item.score !== undefined ? <>
                                        <p className="text-lg font-bold text-slate-900">{Number(item.score).toFixed(2)} / {Number(item.total_marks || 0).toFixed(2)}</p>
                                        <p className="text-sm text-slate-600">{Number(item.percentage || 0).toFixed(2)}%</p>
                                        <p className="mt-1 text-xs text-slate-500">Correct: {item.correct_answers ?? 0} · Wrong: {item.wrong_answers ?? 0} · Unanswered: {item.unanswered ?? 0}</p>
                                    </> : <p className="max-w-xs text-sm text-slate-500">Your score will appear here after the school publishes this CBT result. Use Refresh results to check again.</p>}
                                </div>
                            </div>
                        ))}
                        <Link to="/student-cbt" className="inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">View all CBT attempts →</Link>
                    </div>
                }
            </div>
        </div>
    );
}

export default StudentDashboardPage;
