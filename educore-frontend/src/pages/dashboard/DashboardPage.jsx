import { useDashboard } from "@/hooks/useDashboard";
import {
    AlertCircle,
    BookOpen,
    GraduationCap,
    UserRound,
    UserRoundCheck,
    Users,
} from "lucide-react";

function DashboardPage() {
    const { data, isLoading, isError, error } = useDashboard();

    if (isLoading) {
        return (
            <div className="w-full min-w-0 space-y-6">
                <div>
                    <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
                    <div className="mt-2 h-5 w-72 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-red-800">
                        Unable to load dashboard
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-red-600">
                        {error?.response?.data?.message ||
                            error?.message ||
                            "Something went wrong."}
                    </p>
                </div>
            </div>
        );
    }

    const {
        students = 0,
        active_students = 0,
        teachers = 0,
        parents = 0,
        classes = 0,
        current_session,
        current_term,
    } = data || {};

    const statistics = [
        {
            title: "Total Students",
            value: students,
            description: "All registered students",
            icon: GraduationCap,
            iconClass: "bg-blue-50 text-blue-600",
        },
        {
            title: "Active Students",
            value: active_students,
            description: "Currently enrolled",
            icon: UserRoundCheck,
            iconClass: "bg-emerald-50 text-emerald-600",
        },
        {
            title: "Teachers",
            value: teachers,
            description: "Teaching staff",
            icon: Users,
            iconClass: "bg-violet-50 text-violet-600",
        },
        {
            title: "Parents",
            value: parents,
            description: "Registered parents",
            icon: UserRound,
            iconClass: "bg-amber-50 text-amber-600",
        },
        {
            title: "Classes",
            value: classes,
            description: "Active school classes",
            icon: BookOpen,
            iconClass: "bg-slate-100 text-slate-600",
        },
    ];

    return (
        <div className="w-full min-w-0 space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Dashboard
                    </h1>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                        Welcome to EDUCORE. Here is your school overview.
                    </p>
                </div>

                <div className="shrink-0 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                        Academic Period
                    </p>
                    <p className="mt-1 font-bold text-blue-900">
                        {current_session || "No session"}
                        <span className="mx-1 text-blue-300">•</span>
                        {current_term || "No term"}
                    </p>
                </div>
            </div>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        School at a Glance
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Key figures across your school.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {statistics.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.title}
                                className="app-surface app-surface-hover min-w-0 p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-500">
                                            {stat.title}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            {stat.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default DashboardPage;
