import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, FileText, GraduationCap } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";

function StudentDashboardPage() {
    const { user } = useAuth();

    const displayName = user?.full_name || user?.username || "Student";

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
