import {
    Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, CalendarDays,
    CheckCircle2, ChevronRight, Circle, GraduationCap, Megaphone, Plus,
    Receipt, School, UserPlus, Users, Wallet, X, LogOut, ClipboardCheck,
    CreditCard, TrendingUp, UsersRound
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useExpenseSummary } from "@/hooks/useExpenses";
import { useAuth } from "@/context/AuthContext";

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

function formatCurrency(value) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-NG");
}

function formatDate(date) {
    if (!date) return "Date unavailable";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return parsed.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function Panel({ title, description, action, children, className = "" }) {
    return (
        <section className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900">{title}</h2>
                    {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function MetricCard({ title, value, note, Icon, tone = "blue" }) {
    const tones = {
        blue: "bg-blue-600 text-white ring-blue-100",
        violet: "bg-violet-600 text-white ring-violet-100",
        green: "bg-emerald-500 text-white ring-emerald-100",
        amber: "bg-amber-500 text-white ring-amber-100",
        cyan: "bg-cyan-600 text-white ring-cyan-100",
    };
    return (
        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500 sm:text-sm">{title}</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{formatNumber(value)}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{note}</p>
                </div>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-4 ${tones[tone] || tones.blue}`}>
                    <Icon size={21} strokeWidth={2.1} />
                </span>
            </div>
        </article>
    );
}

function DonutChart({ items = [], total = 0 }) {
    const rows = items.map((item, index) => ({
        label: String(item.gender || "Unspecified"),
        value: Math.max(0, Number(item.total || 0)),
        color: CHART_COLORS[index % CHART_COLORS.length],
    })).filter(item => item.value > 0);
    const sum = rows.reduce((value, item) => value + item.value, 0);
    let offset = 0;

    return (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative h-40 w-40 shrink-0" role="img" aria-label={`Gender distribution for ${formatNumber(total)} students`}>
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="60" cy="60" r="43" fill="none" stroke="#e2e8f0" strokeWidth="15" />
                    {rows.map(row => {
                        const length = sum ? (row.value / sum) * 270.18 : 0;
                        const currentOffset = offset;
                        offset += length;
                        return <circle key={row.label} cx="60" cy="60" r="43" fill="none" stroke={row.color} strokeWidth="15" strokeDasharray={`${length} 270.18`} strokeDashoffset={-currentOffset} />;
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-slate-900">{formatNumber(total)}</span>
                    <span className="text-[11px] text-slate-500">Students</span>
                </div>
            </div>
            <div className="w-full min-w-0 space-y-3">
                {rows.length ? rows.map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex min-w-0 items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />{row.label}</span>
                        <span className="shrink-0 font-semibold tabular-nums text-slate-800">{formatNumber(row.value)} <span className="font-normal text-slate-400">({Math.round(row.value / sum * 100)}%)</span></span>
                    </div>
                )) : <p className="text-sm text-slate-400">Student distribution will appear when records are available.</p>}
            </div>
        </div>
    );
}

function ProgressBars({ items, labelKey, valueKey, formatter = formatNumber, emptyMessage = "No records available yet." }) {
    const rows = items.map(item => ({
        label: String(item[labelKey] || "Unspecified"),
        value: Math.max(0, Number(item[valueKey] || 0)),
    }));
    const max = Math.max(1, ...rows.map(row => row.value));
    if (!rows.length) return <p className="py-5 text-sm text-slate-400">{emptyMessage}</p>;

    return (
        <div className="space-y-4">
            {rows.map((row, index) => (
                <div key={row.label} className="min-w-0">
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate font-medium text-slate-600">{row.label}</span>
                        <span className="shrink-0 font-semibold tabular-nums text-slate-800">{formatter(row.value)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${row.value > 0 ? Math.max(2, row.value / max * 100) : 0}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
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
    const setupStorageKey = `eduprowSetupGuideDismissed:${user?.school_id || "school"}`;
    const [showSetupGuide, setShowSetupGuide] = useState(() => {
        try { return localStorage.getItem(setupStorageKey) !== "true"; }
        catch { return true; }
    });
    const isSuperAdmin = user?.role_name === "Super Admin";

    const handleLogout = async () => {
        await logoutUser();
        navigate("/", { replace: true });
    };

    if (isLoading) {
        return (
            <div className="space-y-5">
                <div className="h-36 animate-pulse rounded-3xl bg-blue-100" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">{[1, 2, 3, 4, 5].map(item => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}</div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3"><div className="h-72 animate-pulse rounded-2xl bg-slate-200 xl:col-span-2" /><div className="h-72 animate-pulse rounded-2xl bg-slate-200" /></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-7">
                <div className="flex items-start gap-3">
                    <Activity className="mt-0.5 shrink-0 text-red-600" />
                    <div className="min-w-0">
                        <h2 className="font-bold text-red-800">Unable to load the school dashboard</h2>
                        <p className="mt-1 break-words text-sm text-red-700">{error?.response?.data?.message || error?.message || "Something went wrong. Please refresh and try again."}</p>
                    </div>
                    {isSuperAdmin && <button type="button" onClick={handleLogout} className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"><LogOut size={16} />Logout</button>}
                </div>
            </div>
        );
    }

    const {
        school_name, students = 0, active_students = 0, teachers = 0, parents = 0, classes = 0,
        current_session, current_term, attendance_today = 0, attendance_total = 0,
        attendance_present = 0, attendance_absent = 0, attendance_late = 0,
        expected_fees = 0, total_payments = 0, outstanding_fees = 0,
        students_with_payments = 0, gender_distribution = [], class_population = [],
        recent_students = [], recent_payments = [], recent_announcements = [], top_students = []
    } = data || {};

    const setupSteps = [
        { title: "Set up the academic period", description: "Confirm the current session and term.", done: Boolean(current_session && current_term), path: "/settings" },
        { title: "Add your classes", description: "Create the classes used by your school.", done: Number(classes) > 0, path: "/settings" },
        { title: "Add your teachers", description: "Register the teachers who use EduProw.", done: Number(teachers) > 0, path: "/teachers" },
        { title: "Register your students", description: "Add students or import an existing list.", done: Number(students) > 0, path: "/students" },
        { title: "Review school fees", description: "Check fee setup before recording payments.", done: Number(expected_fees) > 0, path: "/admin/fees" },
    ];
    const setupCompleted = setupSteps.filter(step => step.done).length;

    const quickActions = [
        { label: "Add Student", description: "Register a new learner", path: "/students", Icon: UserPlus, tone: "blue" },
        { label: "Add Teacher", description: "Register a staff member", path: "/teachers", Icon: Users, tone: "violet" },
        { label: "Record Payment", description: "Capture a fee payment", path: "/payments", Icon: CreditCard, tone: "green" },
        { label: "Take Attendance", description: "Open attendance records", path: "/attendance", Icon: ClipboardCheck, tone: "amber" },
        { label: "View Results", description: "Manage academic results", path: "/results", Icon: BookOpen, tone: "blue" },
        { label: "Manage Classes", description: "Review classes and levels", path: "/settings", Icon: School, tone: "violet" },
    ];
    const actionTones = {
        blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white",
        violet: "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white",
        green: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
        amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white",
    };

    const activities = [
        ...recent_students.slice(0, 3).map(item => ({
            id: `student-${item.id}`, type: "student", title: "New student registered",
            detail: [item.surname, item.first_name, item.middle_name].filter(Boolean).join(" "),
            date: item.created_at, Icon: GraduationCap, tone: "blue"
        })),
        ...recent_payments.slice(0, 3).map(item => ({
            id: `payment-${item.id}`, type: "payment", title: "Fee payment received",
            detail: `${item.student_name || "Student"} · ${formatCurrency(item.amount_paid)}`,
            date: item.payment_date, Icon: Wallet, tone: "green"
        })),
        ...recent_announcements.slice(0, 2).map(item => ({
            id: `announcement-${item.id}`, type: "announcement", title: item.title || "School announcement",
            detail: item.message || "An announcement was added.", date: item.publish_date || item.created_at,
            Icon: Megaphone, tone: "amber"
        })),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 6);

    const todayLabel = new Date().toLocaleDateString("en-NG", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const paymentRate = Number(expected_fees) > 0
        ? Math.min(100, Math.round(Number(total_payments) / Number(expected_fees) * 100))
        : 0;

    return (
        <div className="mx-auto w-full min-w-0 max-w-[1700px] space-y-5 pb-6">
            <section className="relative isolate overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-100 px-5 py-6 sm:px-7 sm:py-7">
                <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/50 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-28 right-1/4 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-blue-700">Welcome back{user?.full_name || user?.name ? `, ${(user.full_name || user.name).split(" ")[0]}` : ""}</p>
                        <h1 className="mt-1 max-w-3xl text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{school_name || "Your School"} <span aria-hidden="true">👋</span></h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">Here is a quick overview of your school's activities and performance.</p>
                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
                            <span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-blue-700" />{todayLabel}</span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-blue-800"><BookOpen size={14} />{current_session || "No academic session"} · {current_term || "No term selected"}</span>
                        </div>
                    </div>
                    {isSuperAdmin && <button type="button" onClick={handleLogout} className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white/80 px-3.5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"><LogOut size={16} />Logout</button>}
                    <div className="hidden shrink-0 items-center justify-center pr-5 lg:flex">
                        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/80 bg-white/60 shadow-lg shadow-blue-900/5">
                            <School size={58} strokeWidth={1.35} className="text-blue-700" />
                        </div>
                    </div>
                </div>
            </section>

            {showSetupGuide && (
                <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div><p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Getting started</p><h2 className="mt-1 text-base font-bold text-slate-900">Complete your school setup</h2><p className="mt-1 text-xs text-slate-500">A quick checklist to help you get the most out of EduProw.</p></div>
                        <button type="button" onClick={() => { setShowSetupGuide(false); try { localStorage.setItem(setupStorageKey, "true"); } catch {} }} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss setup guide"><X size={17} /></button>
                    </div>
                    <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${setupCompleted / setupSteps.length * 100}%` }} /></div><span className="whitespace-nowrap text-xs font-semibold text-slate-600">{setupCompleted}/{setupSteps.length} completed</span></div>
                    <div className="mt-2 grid gap-x-5 sm:grid-cols-2 xl:grid-cols-5">{setupSteps.map(step => <button key={step.title} type="button" onClick={() => navigate(step.path)} className="flex min-w-0 items-center gap-2 rounded-lg py-2 text-left transition hover:bg-slate-50"><span className={step.done ? "text-emerald-600" : "text-slate-300"}>{step.done ? <CheckCircle2 size={17} /> : <Circle size={17} />}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-700">{step.title}</span><span className="block truncate text-[10px] text-slate-400">{step.description}</span></span></button>)}</div>
                </section>
            )}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard title="Total Students" value={students} note="All registered students" Icon={UsersRound} tone="blue" />
                <MetricCard title="Active Students" value={active_students} note="Currently enrolled" Icon={GraduationCap} tone="violet" />
                <MetricCard title="Total Teachers" value={teachers} note="Teaching staff" Icon={Users} tone="green" />
                <MetricCard title="Total Parents" value={parents} note="Registered parents" Icon={UsersRound} tone="amber" />
                <MetricCard title="Active Classes" value={classes} note="Classes in this school" Icon={School} tone="cyan" />
            </section>

            <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[1.35fr_1fr_0.95fr]">
                <Panel title="Student Distribution" description="Registered students grouped by gender." className="2xl:col-span-1">
                    <DonutChart items={gender_distribution} total={students} />
                </Panel>
                <Panel title="Students Per Class" description="Student population across the school's classes.">
                    <ProgressBars items={class_population} labelKey="class_name" valueKey="total_students" emptyMessage="Class population will appear when active enrolments are available." />
                </Panel>
                <Panel title="Recent Activities" description="A snapshot of recent school updates." action={<button type="button" onClick={() => navigate("/announcements")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">View updates</button>}>
                    <div className="space-y-4">
                        {activities.length ? activities.map(item => (
                            <div key={item.id} className="flex min-w-0 items-start gap-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.tone === "green" ? "bg-emerald-50 text-emerald-600" : item.tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}><item.Icon size={17} /></span>
                                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{item.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.detail}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(item.date)}</p></div>
                            </div>
                        )) : <p className="py-6 text-sm text-slate-400">New registrations, payments and announcements will appear here.</p>}
                    </div>
                </Panel>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr]">
                <Panel title="Fee & Financial Overview" description={`Fee collection for ${current_session || "the selected academic session"} · ${current_term || "current term"}`} action={<button type="button" onClick={() => navigate("/payments")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">View finance</button>}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Expected Fees</p><p className="mt-1 break-words text-lg font-extrabold text-slate-900">{formatCurrency(expected_fees)}</p></div>
                        <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs font-medium text-emerald-700">Payments Received</p><p className="mt-1 break-words text-lg font-extrabold text-emerald-800">{formatCurrency(total_payments)}</p></div>
                        <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs font-medium text-amber-700">Outstanding Fees</p><p className="mt-1 break-words text-lg font-extrabold text-amber-800">{formatCurrency(outstanding_fees)}</p></div>
                    </div>
                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-600">Fee collection progress</span><span className="font-bold tabular-nums text-slate-800">{paymentRate}%</span></div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all" style={{ width: `${paymentRate}%` }} /></div>
                        <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400"><span>{formatNumber(students_with_payments)} students with payments</span><span>{formatCurrency(total_payments)} collected</span></div>
                    </div>
                </Panel>
                <Panel title="Expenses Overview" description="Expenses recorded for this school." action={<button type="button" onClick={() => navigate("/expenses")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">View expenses</button>}>
                    {isExpenseSummaryLoading ? <div className="space-y-3"><div className="h-12 animate-pulse rounded-xl bg-slate-100" /><div className="h-12 animate-pulse rounded-xl bg-slate-100" /></div> : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-rose-50 p-3"><p className="text-xs font-medium text-rose-700">Total Expenses</p><p className="mt-1 break-words text-lg font-extrabold text-rose-800">{formatCurrency(expenseSummary?.total_amount)}</p></div>
                            <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs font-medium text-amber-700">Transactions</p><p className="mt-1 text-lg font-extrabold text-amber-800">{formatNumber(expenseSummary?.transaction_count)}</p></div>
                            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Average Expense</p><p className="mt-1 break-words text-lg font-extrabold text-slate-900">{formatCurrency(expenseSummary?.average_amount)}</p></div>
                        </div>
                    )}
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3"><p className="flex items-center gap-2 text-xs text-slate-500"><Receipt size={15} />Keep track of school spending alongside fee collection.</p></div>
                </Panel>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel title="Quick Actions" description="Shortcuts to common school administration tasks.">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {quickActions.map(({ label, description, path, Icon, tone }) => (
                            <button key={label} type="button" onClick={() => navigate(path)} className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${actionTones[tone]}`}><Icon size={19} /></span>
                                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{description}</span></span>
                                <ChevronRight size={16} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                            </button>
                        ))}
                    </div>
                </Panel>
                <Panel title="Today's Attendance" description="Attendance recorded for today." action={<button type="button" onClick={() => navigate("/attendance")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">Open attendance</button>}>
                    <div className="mb-4 rounded-xl bg-blue-50 p-4"><p className="text-xs font-semibold text-blue-700">Attendance Rate</p><p className="mt-1 text-3xl font-extrabold text-blue-950">{Number(attendance_today || 0).toLocaleString("en-NG")}%</p><p className="mt-1 text-[11px] text-blue-700">{formatNumber(attendance_total)} attendance records today</p></div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-emerald-50 p-3"><p className="text-[11px] font-medium text-emerald-700">Present</p><p className="mt-1 text-xl font-bold text-emerald-800">{formatNumber(attendance_present)}</p></div>
                        <div className="rounded-xl bg-rose-50 p-3"><p className="text-[11px] font-medium text-rose-700">Absent</p><p className="mt-1 text-xl font-bold text-rose-800">{formatNumber(attendance_absent)}</p></div>
                        <div className="rounded-xl bg-amber-50 p-3"><p className="text-[11px] font-medium text-amber-700">Late</p><p className="mt-1 text-xl font-bold text-amber-800">{formatNumber(attendance_late)}</p></div>
                    </div>
                    {attendance_total === 0 && <p className="mt-3 text-xs text-slate-400">No attendance has been recorded today.</p>}
                </Panel>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
                <Panel title="Recently Registered Students" description="The latest students added to your school." action={<button type="button" onClick={() => navigate("/students")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">View students</button>} className="overflow-hidden">
                    {recent_students.length ? <div className="divide-y divide-slate-100">{recent_students.map(student => <div key={student.id} className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{student.surname} {student.first_name} {student.middle_name || ""}</p><p className="mt-0.5 truncate text-xs text-slate-400">{student.admission_number || "Admission number unavailable"}</p></div><span className="shrink-0 text-[11px] text-slate-400">{formatDate(student.created_at)}</span></div>)}</div> : <p className="py-5 text-sm text-slate-400">No student registrations to show yet.</p>}
                </Panel>
                <Panel title="Recent Fee Payments" description="Latest payments recorded by the school." action={<button type="button" onClick={() => navigate("/payments")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">View payments</button>} className="overflow-hidden">
                    {recent_payments.length ? <div className="divide-y divide-slate-100">{recent_payments.map(payment => <div key={payment.id} className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{payment.student_name || "Student"}</p><p className="mt-0.5 truncate text-xs text-slate-400">{payment.reference_number || payment.payment_method || "Payment recorded"} · {formatDate(payment.payment_date)}</p></div><span className="shrink-0 text-sm font-bold text-emerald-700">{formatCurrency(payment.amount_paid)}</span></div>)}</div> : <p className="py-5 text-sm text-slate-400">No fee payments to show yet.</p>}
                </Panel>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
                <Panel title="Top Performing Students" description="Students with the highest recorded average scores." action={<button type="button" onClick={() => navigate("/results")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">View results</button>}>
                    {top_students.length ? <div className="space-y-3">{top_students.slice(0, 5).map((student, index) => <div key={student.id} className="flex items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{index + 1}</span><p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{student.surname} {student.first_name}</p><span className="text-sm font-bold tabular-nums text-blue-700">{Number(student.average_score || 0).toFixed(1)}</span></div>)}</div> : <p className="py-5 text-sm text-slate-400">Performance rankings will appear when results are available.</p>}
                </Panel>
                <Panel title="School Announcements" description="Recent notices shared with your school community." action={<button type="button" onClick={() => navigate("/announcements")} className="text-xs font-semibold text-blue-700 hover:text-blue-900">Manage notices</button>}>
                    {recent_announcements.length ? <div className="space-y-3">{recent_announcements.slice(0, 4).map(item => <div key={item.id} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Megaphone size={16} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{item.title}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.is_active ? "Active" : "Inactive"}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.message}</p><p className="mt-1 text-[10px] text-slate-400">Published {formatDate(item.publish_date)}</p></div></div>)}</div> : <p className="py-5 text-sm text-slate-400">No announcements have been published yet.</p>}
                </Panel>
            </div>
        </div>
    );
}

export default DashboardPage;
