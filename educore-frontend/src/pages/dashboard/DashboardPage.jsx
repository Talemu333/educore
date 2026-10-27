import { LogOut, UserPlus, Wallet, Users, School, GraduationCap, CheckCircle2, Circle, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useExpenseSummary } from "@/hooks/useExpenses";
import { useAuth } from "@/context/AuthContext";
import AnnouncementSummary from "@/components/announcements/AnnouncementSummary";
import "./DashboardPage.css";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


const CHART_COLORS = ["#2563eb", "#0d9488", "#f59e0b", "#8b5cf6", "#f43f5e", "#64748b"];

function DonutChart({ items, total }) {
    const validItems = items.map((item, index) => ({
        label: String(item.gender || "Unspecified"),
        value: Math.max(0, Number(item.total || 0)),
        color: CHART_COLORS[index % CHART_COLORS.length],
    })).filter(item => item.value > 0);
    const chartTotal = validItems.reduce((sum, item) => sum + item.value, 0);
    let offset = 0;
    return (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="relative h-44 w-44 shrink-0" role="img" aria-label={`Student gender distribution for ${total} students`}>
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="60" cy="60" r="43" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                    {validItems.map(item => {
                        const fraction = chartTotal ? item.value / chartTotal : 0;
                        const dash = fraction * 270.18;
                        const currentOffset = offset;
                        offset += dash;
                        return <circle key={item.label} cx="60" cy="60" r="43" fill="none" stroke={item.color} strokeWidth="16" strokeDasharray={`${dash} ${270.18 - dash}`} strokeDashoffset={-currentOffset} />;
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{Number(total || 0).toLocaleString()}</span>
                    <span className="text-xs text-slate-500">Students</span>
                </div>
            </div>
            <div className="w-full min-w-0 space-y-3">
                {validItems.length ? validItems.map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2 text-slate-600"><span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span>
                        <span className="shrink-0 font-semibold text-slate-800">{item.value.toLocaleString()} <span className="font-normal text-slate-500">({Math.round(item.value / chartTotal * 100)}%)</span></span>
                    </div>
                )) : <p className="text-sm text-slate-500">No gender distribution data available yet.</p>}
            </div>
        </div>
    );
}

function BarChart({ items, labelKey, valueKey, valueFormatter = value => Number(value || 0).toLocaleString(), emptyMessage = "No data available yet." }) {
    const rows = items.map(item => ({
        label: String(item[labelKey] || "Unspecified"),
        value: Math.max(0, Number(item[valueKey] || 0)),
    }));
    const maxValue = Math.max(1, ...rows.map(row => row.value));
    if (!rows.length) return <p className="py-6 text-sm text-slate-500">{emptyMessage}</p>;
    return (
        <div className="space-y-4">
            {rows.map((row, index) => (
                <div key={row.label} className="min-w-0">
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-medium text-slate-700" title={row.label}>{row.label}</span>
                        <span className="shrink-0 font-semibold tabular-nums text-slate-800">{valueFormatter(row.value)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${row.label}: ${valueFormatter(row.value)}`}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(row.value > 0 ? 2 : 0, row.value / maxValue * 100)}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function DashboardPage() {

    const { data, isLoading, isError, error } = useDashboard();
    const { data: expenseSummary, isLoading: isExpenseSummaryLoading } = useExpenseSummary();
    const { logoutUser, user } = useAuth();
    const navigate = useNavigate();
    const [showSetupGuide, setShowSetupGuide] = useState(() => {
        try { return localStorage.getItem("eduprowSetupGuideDismissed") !== "true"; }
        catch { return true; }
    });
    const isSuperAdmin = user?.role_name === "Super Admin";

    const handleLogout = async () => {
        await logoutUser();
        navigate("/", { replace: true });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
                        <p className="mt-1.5 text-sm text-slate-500 sm:text-base">Loading school overview...</p>
                    </div>
                    {isSuperAdmin && (
                        <button type="button" onClick={handleLogout} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700" aria-label="Logout">
                            <LogOut size={17} />
                            Logout
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(item => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200 sm:h-28" />)}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="space-y-4">
                {isSuperAdmin && (
                    <div className="flex justify-end">
                        <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700" aria-label="Logout">
                            <LogOut size={17} />
                            Logout
                        </button>
                    </div>
                )}
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6">
                    <h2 className="font-bold text-red-700">Unable to load dashboard</h2>
                    <p className="mt-2 break-words text-sm text-red-600">{error?.response?.data?.message || error?.message || "Something went wrong."}</p>
                </div>
            </div>
        );
    }

    const {
        school_name,
        students = 0,
        active_students = 0,
        teachers = 0,
        parents = 0,
        classes = 0,
        current_session,
        current_term,
        attendance_today = 0,
        attendance_total = 0,
        attendance_present = 0,
        attendance_absent = 0,
        attendance_late = 0,
        expected_fees = 0,
        total_payments = 0,
        outstanding_fees = 0,
        students_with_payments = 0,
        gender_distribution = [],
        class_population = [],
        recent_students = [],
        recent_payments = [],
        recent_announcements = [],
        top_students = []
    } = data || {};

    const setupSteps = [
        { title: "Set up the academic period", description: "Check that the current session and term are correct.", done: Boolean(current_session && current_term), path: "/settings" },
        { title: "Add your classes", description: "Create the classes your school uses.", done: Number(classes) > 0, path: "/settings" },
        { title: "Add your teachers", description: "Register teaching staff who will use EduProw.", done: Number(teachers) > 0, path: "/teachers" },
        { title: "Register your students", description: "Add students or import your existing student list.", done: Number(students) > 0, path: "/students" },
        { title: "Review school fees", description: "Check the fee setup before recording payments.", done: Number(expected_fees) > 0, path: "/admin/fees" },
    ];
    const setupCompleted = setupSteps.filter(step => step.done).length;

    const overviewCards = [
        { title: "Total Students", value: students, Icon: Users, tone: "blue", description: "Registered students" },
        { title: "Active Students", value: active_students, Icon: GraduationCap, tone: "teal", description: "Currently enrolled" },
        { title: "Teachers", value: teachers, Icon: UserPlus, tone: "violet", description: "Teaching staff" },
        { title: "Parents", value: parents, Icon: Users, tone: "amber", description: "Registered parents" },
        { title: "Classes", value: classes, Icon: School, tone: "rose", description: "School classes" },
    ];

    return (
        <div className="premium-admin-dashboard w-full min-w-0 space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
                        {isSuperAdmin && (
                            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700" aria-label="Logout">
                                <LogOut size={17} strokeWidth={2} />
                                Logout
                            </button>
                        )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
                        Welcome to {school_name || "your school"}. Here is your school overview.
                    </p>
                </div>
                <div className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 sm:w-auto sm:px-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Academic Period</p>
                    <p className="mt-1 break-words font-bold text-blue-900">{current_session || "No session"} • {current_term || "No term"}</p>
                </div>
            </div>

            {showSetupGuide && (
                <section aria-labelledby="setup-guide-heading" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Getting started</p>
                            <h2 id="setup-guide-heading" className="mt-1 text-lg font-bold text-slate-900">Set up your school</h2>
                            <p className="mt-1 text-sm text-slate-600">Use this guide to check the main areas of your school account. You can return to each step whenever you need to.</p>
                        </div>
                        <button type="button" onClick={() => {
                            setShowSetupGuide(false);
                            try { localStorage.setItem("eduprowSetupGuideDismissed", "true"); } catch {}
                        }} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Dismiss setup guide">
                            <X size={16} /><span className="hidden sm:inline">Dismiss</span>
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Setup checklist progress" aria-valuemin={0} aria-valuemax={setupSteps.length} aria-valuenow={setupCompleted}>
                            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(setupCompleted / setupSteps.length) * 100}%` }} />
                        </div>
                        <span className="whitespace-nowrap text-xs font-semibold text-slate-600">{setupCompleted} of {setupSteps.length} checked</span>
                    </div>
                    <div className="mt-3 divide-y divide-slate-100">
                        {setupSteps.map(step => (
                            <button key={step.title} type="button" onClick={() => navigate(step.path)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500">
                                {step.done ? <CheckCircle2 size={20} className="shrink-0 text-emerald-600" aria-label="Detected as set up" /> : <Circle size={20} className="shrink-0 text-slate-300" aria-label="Needs checking" />}
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-slate-800">{step.title}</span>
                                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{step.description}</span>
                                </span>
                                <ChevronRight size={17} className="shrink-0 text-slate-400" />
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Checklist indicators are based on available school overview data. Open each area to confirm its settings are complete.</p>
                </section>
            )}

            <section aria-labelledby="quick-actions-heading" className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
                <div className="mb-3">
                    <h2 id="quick-actions-heading" className="text-lg font-bold text-slate-900">What would you like to do today?</h2>
                    <p className="mt-1 text-sm text-slate-600">Start with a common school task. You can still access every feature from the menu.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Register a student", description: "Add a new student to the school", path: "/students", Icon: UserPlus },
                        { label: "Manage teachers", description: "Register staff and update teacher information", path: "/teachers", Icon: Users },
                        { label: "Manage classes", description: "View and organise your school classes", path: "/settings", Icon: School },
                        { label: "Record a payment", description: "Record school fee payments", path: "/payments", Icon: Wallet },
                    ].map(({ label, description, path, Icon }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => navigate(path)}
                            className="flex min-h-[88px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <Icon size={20} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                                <span className="block font-semibold text-slate-900">{label}</span>
                                <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="premium-kpi-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {overviewCards.map(card => {
                    const Icon = card.Icon;
                    return (
                        <div key={card.title} className={"premium-kpi-card premium-kpi-" + card.tone + " min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0"><p className="text-sm font-medium text-slate-500">{card.title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{Number(card.value || 0).toLocaleString()}</p></div>
                                <div className="premium-kpi-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"><Icon size={21} strokeWidth={1.8} aria-hidden="true" /></div>
                            </div>
                            <p className="mt-3 text-xs text-slate-400">{card.description}</p>
                        </div>
                    );
                })}
            </div>

<AnnouncementSummary />

                        <section>
                <div className="mb-2"><h2 className="text-xl font-bold text-slate-900">Finance Overview</h2><p className="mt-0.5 text-sm text-slate-500">Current session and term fee collection.</p></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-medium text-slate-500">Expected Fees</p><p className="mt-1.5 break-words text-xl font-bold text-slate-900 sm:text-2xl">{formatCurrency(expected_fees)}</p></div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-700">Total Payments</p><p className="mt-1.5 break-words text-xl font-bold text-emerald-800 sm:text-2xl">{formatCurrency(total_payments)}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="text-sm font-medium text-red-700">Outstanding Fees</p><p className="mt-1.5 break-words text-xl font-bold text-red-800 sm:text-2xl">{formatCurrency(outstanding_fees)}</p></div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-medium text-blue-700">Students With Payments</p><p className="mt-1.5 text-xl font-bold text-blue-800 sm:text-2xl">{students_with_payments}</p></div>
                </div>
            </section>

            <section>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Expenses Overview</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Summary of expenses recorded for this school.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/expenses")}
                        className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        View Expenses
                    </button>
                </div>
                {isExpenseSummaryLoading ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(item => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-700">Total Expenses</p>
                            <p className="mt-1.5 break-words text-xl font-bold text-red-800 sm:text-2xl">{formatCurrency(expenseSummary?.total_amount)}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                            <p className="text-sm font-medium text-amber-700">Transactions</p>
                            <p className="mt-1.5 text-xl font-bold text-amber-800 sm:text-2xl">{Number(expenseSummary?.transaction_count || 0).toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Average Expense</p>
                            <p className="mt-1.5 break-words text-xl font-bold text-slate-900 sm:text-2xl">{formatCurrency(expenseSummary?.average_amount)}</p>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <div className="mb-2"><h2 className="text-xl font-bold text-slate-900">Today's Attendance</h2><p className="mt-0.5 text-sm text-slate-500">Attendance recorded for today.</p></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-medium text-blue-700">Attendance Rate</p><p className="mt-1.5 text-2xl font-bold text-blue-900 sm:text-3xl">{attendance_today}%</p></div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-700">Present</p><p className="mt-1.5 text-2xl font-bold text-emerald-900 sm:text-3xl">{attendance_present}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="text-sm font-medium text-red-700">Absent</p><p className="mt-1.5 text-2xl font-bold text-red-900 sm:text-3xl">{attendance_absent}</p></div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><p className="text-sm font-medium text-amber-700">Late</p><p className="mt-1.5 text-2xl font-bold text-amber-900 sm:text-3xl">{attendance_late}</p></div>
                </div>
                {attendance_total === 0 && <p className="mt-2 text-sm text-slate-400">No attendance has been recorded today.</p>}
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="text-lg font-bold text-slate-900">Student Gender Distribution</h2>
                    <p className="mt-1 text-sm text-slate-500">Breakdown of registered students by gender.</p>
                    <div className="mt-4"><DonutChart items={gender_distribution} total={students} /></div>
                </section>
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="text-lg font-bold text-slate-900">Students Per Class</h2>
                    <p className="mt-1 text-sm text-slate-500">Compare the number of students in each class.</p>
                    <div className="mt-5"><BarChart items={class_population} labelKey="class_name" valueKey="total_students" emptyMessage="No class population data available yet." /></div>
                </section>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="text-lg font-bold text-slate-900">Fee Collection Overview</h2>
                    <p className="mt-1 text-sm text-slate-500">Compare expected fees, payments received and outstanding balances.</p>
                    <div className="mt-5"><BarChart items={[{ label: "Expected fees", amount: expected_fees }, { label: "Payments received", amount: total_payments }, { label: "Outstanding fees", amount: outstanding_fees }]} labelKey="label" valueKey="amount" valueFormatter={formatCurrency} /></div>
                </section>
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="text-lg font-bold text-slate-900">Today's Attendance Breakdown</h2>
                    <p className="mt-1 text-sm text-slate-500">Compare attendance records by status for today.</p>
                    <div className="mt-5"><BarChart items={[{ label: "Present", amount: attendance_present }, { label: "Absent", amount: attendance_absent }, { label: "Late", amount: attendance_late }]} labelKey="label" valueKey="amount" /></div>
                    {attendance_total === 0 && <p className="mt-3 text-xs text-slate-400">No attendance has been recorded today.</p>}
                </section>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-4 py-4 sm:px-5"><h2 className="text-lg font-bold text-slate-900">Recent Students</h2><p className="mt-0.5 text-sm text-slate-500">Recently registered students.</p></div><div className="divide-y divide-slate-100">{recent_students.map(student => <div key={student.id} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{student.surname} {student.first_name} {student.middle_name || ""}</p><p className="mt-0.5 text-xs text-slate-400">{student.admission_number}</p></div><p className="shrink-0 text-xs text-slate-400">{formatDate(student.created_at)}</p></div>)}</div></section>
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-4 py-4 sm:px-5"><h2 className="text-lg font-bold text-slate-900">Top Students</h2><p className="mt-0.5 text-sm text-slate-500">Highest average scores.</p></div><div className="divide-y divide-slate-100">{top_students.map((student, index) => <div key={student.id} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{index + 1}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-800">{student.surname} {student.first_name}</p></div><span className="shrink-0 font-bold text-blue-600">{Number(student.average_score || 0).toFixed(1)}</span></div>)}</div></section>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-4 py-4 sm:px-5"><h2 className="text-lg font-bold text-slate-900">Recent Payments</h2><p className="mt-0.5 text-sm text-slate-500">Latest fee transactions.</p></div><div className="divide-y divide-slate-100">{recent_payments.map(payment => <div key={payment.id} className="px-4 py-3 sm:px-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{payment.student_name}</p><p className="mt-0.5 break-words text-xs text-slate-400">{payment.reference_number} • {payment.payment_method}</p></div><p className="shrink-0 text-right font-bold text-emerald-600">{formatCurrency(payment.amount_paid)}</p></div><p className="mt-1.5 text-xs text-slate-400">{formatDate(payment.payment_date)}</p></div>)}</div></section>
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-4 py-4 sm:px-5"><h2 className="text-lg font-bold text-slate-900">Recent Announcements</h2><p className="mt-0.5 text-sm text-slate-500">Latest school announcements.</p></div><div className="divide-y divide-slate-100">{recent_announcements.map(announcement => <div key={announcement.id} className="px-4 py-3 sm:px-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-slate-800">{announcement.title}</p><p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{announcement.message}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${announcement.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{announcement.is_active ? "Active" : "Inactive"}</span></div><p className="mt-1.5 text-xs text-slate-400">Published {formatDate(announcement.publish_date)}</p></div>)}</div></section>
            </div>
        </div>
    );
}

export default DashboardPage;
