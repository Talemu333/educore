import { useDashboard } from "@/hooks/useDashboard";
import {
    AlertCircle,
    BarChart3,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    GraduationCap,
    Megaphone,
    Users,
    UserRound,
    UserRoundCheck,
    WalletCards
} from "lucide-react";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
}

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function Kpi({ label, value, icon: Icon }) {
    return (
        <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-0.5 text-xl font-bold leading-none tracking-tight text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function Panel({ title, icon: Icon, action, children, className = "" }) {
    return (
        <section className={`app-surface min-w-0 overflow-hidden ${className}`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" />}
                    <h2 className="truncate text-sm font-semibold text-slate-900">{title}</h2>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function DashboardPage() {
    const { data, isLoading, isError, error } = useDashboard();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
                <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-white sm:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(item => <div key={item} className="h-16 animate-pulse bg-slate-100" />)}
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                    {[1, 2].map(item => <div key={item} className="h-52 animate-pulse rounded-xl bg-slate-200" />)}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                    <h2 className="mt-3 font-semibold text-red-800">Unable to load dashboard</h2>
                    <p className="mt-1 text-sm text-red-600">{error?.response?.data?.message || error?.message || "Something went wrong."}</p>
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

    const attendanceRate = Math.max(0, Math.min(100, Number(attendance_today || 0)));
    const paymentRate = expected_fees > 0
        ? Math.min(100, Math.round((Number(total_payments || 0) / Number(expected_fees)) * 100))
        : 0;

    const quickActions = [
        { label: "Students", href: "/students", icon: GraduationCap },
        { label: "Teachers", href: "/teachers", icon: UserRound },
        { label: "Attendance", href: "/attendance", icon: UserRoundCheck },
        { label: "Payments", href: "/payments", icon: CreditCard }
    ];

    return (
        <div className="w-full min-w-0 space-y-4">
            <header className="flex flex-col gap-2 rounded-xl bg-slate-900 px-5 py-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">School Administration</p>
                    <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Dashboard Overview</h1>
                </div>
                <div className="shrink-0 border-t border-white/10 pt-2 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Academic Period</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                        {current_session || "No session"} <span className="mx-1 text-slate-500">•</span> {current_term || "No term"}
                    </p>
                </div>
            </header>

            <section className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid-cols-5">
                <Kpi label="Total Students" value={students} icon={GraduationCap} />
                <Kpi label="Active Students" value={active_students} icon={UserRoundCheck} />
                <Kpi label="Teachers" value={teachers} icon={Users} />
                <Kpi label="Parents" value={parents} icon={UserRound} />
                <Kpi label="Classes" value={classes} icon={BookOpen} />
            </section>

            <section className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="mr-1 px-2 text-xs font-semibold text-slate-500">Quick access</span>
                {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                        <a key={action.href} href={action.href} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                            <Icon className="h-3.5 w-3.5" />
                            {action.label}
                        </a>
                    );
                })}
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Finance Overview" icon={WalletCards}>
                    <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
                        <div className="p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Expected</p><p className="mt-1 text-base font-bold text-slate-900">{formatCurrency(expected_fees)}</p></div>
                        <div className="p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Collected</p><p className="mt-1 text-base font-bold text-emerald-700">{formatCurrency(total_payments)}</p></div>
                        <div className="p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">Outstanding</p><p className="mt-1 text-base font-bold text-red-700">{formatCurrency(outstanding_fees)}</p></div>
                        <div className="p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Students Paid</p><p className="mt-1 text-base font-bold text-blue-700">{students_with_payments}</p></div>
                    </div>
                    <div className="border-t border-slate-100 px-3 py-2.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500"><span>Fee collection</span><span>{paymentRate}%</span></div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${paymentRate}%` }} /></div>
                    </div>
                </Panel>

                <Panel title="Today's Attendance" icon={CalendarDays}>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-4 p-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-slate-100">
                            <div className="text-center"><p className="text-2xl font-bold leading-none text-slate-900">{attendanceRate}%</p><p className="mt-1 text-[9px] uppercase tracking-wide text-slate-400">Rate</p></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg bg-emerald-50 px-2 py-2 text-center"><CheckCircle2 className="mx-auto h-3.5 w-3.5 text-emerald-600" /><p className="mt-1 text-lg font-bold leading-none text-emerald-800">{attendance_present}</p><p className="mt-1 text-[10px] text-emerald-600">Present</p></div>
                            <div className="rounded-lg bg-red-50 px-2 py-2 text-center"><AlertCircle className="mx-auto h-3.5 w-3.5 text-red-600" /><p className="mt-1 text-lg font-bold leading-none text-red-800">{attendance_absent}</p><p className="mt-1 text-[10px] text-red-600">Absent</p></div>
                            <div className="rounded-lg bg-amber-50 px-2 py-2 text-center"><CalendarDays className="mx-auto h-3.5 w-3.5 text-amber-600" /><p className="mt-1 text-lg font-bold leading-none text-amber-800">{attendance_late}</p><p className="mt-1 text-[10px] text-amber-600">Late</p></div>
                        </div>
                    </div>
                    {attendance_total === 0 && <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">No attendance has been recorded today.</p>}
                </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Student Gender" icon={BarChart3}>
                    <div className="space-y-3 p-4">
                        {gender_distribution.length === 0 ? <p className="text-xs text-slate-500">No gender distribution data available.</p> : gender_distribution.map(item => {
                            const total = Number(item.total || 0);
                            const percentage = students === 0 ? 0 : Math.round((total / students) * 100);
                            return <div key={item.gender}><div className="flex items-center justify-between text-xs"><span className="font-medium capitalize text-slate-700">{String(item.gender || "Unknown").toLowerCase()}</span><span className="font-semibold text-slate-500">{total} ({percentage}%)</span></div><div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percentage}%` }} /></div></div>;
                        })}
                    </div>
                </Panel>

                <Panel title="Students Per Class" icon={BookOpen}>
                    <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto">
                        {class_population.length === 0 ? <p className="p-4 text-xs text-slate-500">No class population data available.</p> : class_population.map(item => <div key={item.class_name} className="flex items-center justify-between px-4 py-2.5 text-xs"><span className="truncate font-medium text-slate-700">{item.class_name}</span><span className="ml-3 shrink-0 font-bold text-slate-900">{item.total_students}</span></div>)}
                    </div>
                </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Panel title="Recent Students" icon={GraduationCap}>
                    <div className="divide-y divide-slate-100">
                        {recent_students.length === 0 ? <p className="p-4 text-xs text-slate-500">No recent students.</p> : recent_students.slice(0, 5).map(student => <div key={student.id} className="flex items-center gap-2.5 px-4 py-2.5"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-700">{`${student.first_name || ""} ${student.surname || ""}`.trim().split(/\s+/).map(part => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "S"}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{student.surname} {student.first_name} {student.middle_name || ""}</p><p className="truncate text-[10px] text-slate-400">{student.admission_number}</p></div><span className="shrink-0 text-[10px] text-slate-400">{formatDate(student.created_at)}</span></div>)}
                    </div>
                </Panel>

                <Panel title="Recent Payments" icon={CreditCard}>
                    <div className="divide-y divide-slate-100">
                        {recent_payments.length === 0 ? <p className="p-4 text-xs text-slate-500">No recent payments.</p> : recent_payments.slice(0, 5).map(payment => <div key={payment.id} className="flex items-center gap-2.5 px-4 py-2.5"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CreditCard className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{payment.student_name || payment.admission_number || "Student payment"}</p><p className="text-[10px] text-slate-400">{formatDate(payment.payment_date)}</p></div><span className="shrink-0 text-xs font-bold text-emerald-700">{formatCurrency(payment.amount_paid)}</span></div>)}
                    </div>
                </Panel>

                <Panel title="Announcements" icon={Megaphone}>
                    <div className="divide-y divide-slate-100">
                        {recent_announcements.length === 0 ? <p className="p-4 text-xs text-slate-500">No recent announcements.</p> : recent_announcements.slice(0, 4).map((announcement, index) => <div key={announcement.id || index} className="flex gap-2.5 px-4 py-2.5"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Megaphone className="h-3.5 w-3.5" /></div><div className="min-w-0"><p className="line-clamp-2 text-xs font-semibold text-slate-800">{announcement.title || announcement.message}</p>{announcement.created_at && <p className="mt-0.5 text-[10px] text-slate-400">{formatDate(announcement.created_at)}</p>}</div></div>)}
                    </div>
                </Panel>
            </div>

            {top_students.length > 0 && <Panel title="Top Students" icon={GraduationCap}>
                <div className="overflow-x-auto">
                    <table>
                        <thead><tr><th className="px-4 py-2.5 text-left">Student</th><th className="px-4 py-2.5 text-left">Class</th><th className="px-4 py-2.5 text-center">Average</th><th className="px-4 py-2.5 text-center">Position</th></tr></thead>
                        <tbody>{top_students.slice(0, 5).map((student, index) => <tr key={student.id || index}><td className="px-4 py-2.5 font-semibold">{student.student_name || `${student.surname || ""} ${student.first_name || ""}`.trim() || "Student"}</td><td className="px-4 py-2.5">{student.class_name || "-"}</td><td className="px-4 py-2.5 text-center font-bold">{student.average ?? student.average_score ?? student.score ?? "-"}</td><td className="px-4 py-2.5 text-center">{student.position ?? index + 1}</td></tr>)}</tbody>
                    </table>
                </div>
            </Panel>}
        </div>
    );
}

export default DashboardPage;
