import { useDashboard } from "@/hooks/useDashboard";
import {
    AlertCircle,
    ArrowRight,
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

function StatCard({ label, value, description, icon: Icon, tone = "blue" }) {
    const tones = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        violet: "bg-violet-50 text-violet-600 ring-violet-100",
        amber: "bg-amber-50 text-amber-600 ring-amber-100",
        slate: "bg-slate-100 text-slate-600 ring-slate-200"
    };

    return (
        <div className="app-surface app-surface-hover min-w-0 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
                    <p className="mt-1.5 text-xs text-slate-400">{description}</p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
        </div>
    );
}

function DashboardPage() {
    const { data, isLoading, isError, error } = useDashboard();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="app-surface h-36 animate-pulse bg-slate-100" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(item => <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}
                </div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {[1, 2].map(item => <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[360px] items-center justify-center">
                <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600"><AlertCircle className="h-6 w-6" /></div>
                    <h2 className="mt-4 text-lg font-bold text-red-800">Unable to load dashboard</h2>
                    <p className="mt-2 text-sm leading-6 text-red-600">{error?.response?.data?.message || error?.message || "Something went wrong."}</p>
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
    const paymentRate = expected_fees > 0 ? Math.min(100, Math.round((Number(total_payments || 0) / Number(expected_fees)) * 100)) : 0;

    const quickActions = [
        { label: "Students", description: "Manage student records", href: "/students", icon: GraduationCap },
        { label: "Teachers", description: "Manage teaching staff", href: "/teachers", icon: UserRound },
        { label: "Attendance", description: "Record daily attendance", href: "/attendance", icon: UserRoundCheck },
        { label: "Payments", description: "Record and review fees", href: "/payments", icon: CreditCard }
    ];

    return (
        <div className="w-full min-w-0 space-y-6 sm:space-y-8">
            <section className="overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">School Administration</div>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Dashboard Overview</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Monitor your school operations, student population, attendance and fee collection from one place.</p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-white/10 px-5 py-4 ring-1 ring-white/10 backdrop-blur-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Academic Period</p>
                        <p className="mt-1 text-base font-bold text-white">{current_session || "No session"} <span className="mx-1 text-slate-500">•</span> {current_term || "No term"}</p>
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">School at a Glance</h2>
                    <p className="mt-1 text-sm text-slate-500">Key figures across your school.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Total Students" value={students} description="All registered students" icon={GraduationCap} tone="blue" />
                    <StatCard label="Active Students" value={active_students} description="Currently enrolled" icon={UserRoundCheck} tone="emerald" />
                    <StatCard label="Teachers" value={teachers} description="Teaching staff" icon={Users} tone="violet" />
                    <StatCard label="Parents" value={parents} description="Registered parents" icon={UserRound} tone="amber" />
                    <StatCard label="Classes" value={classes} description="Active school classes" icon={BookOpen} tone="slate" />
                </div>
            </section>

            <section>
                <SectionHeading icon={ArrowRight} title="Quick Actions" description="Jump directly to frequently used school operations." />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map(action => {
                        const Icon = action.icon;
                        return (
                            <a key={action.href} href={action.href} className="app-surface app-surface-hover group flex items-center gap-4 p-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white"><Icon className="h-5 w-5" /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-800 group-hover:text-blue-700">{action.label}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">{action.description}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                            </a>
                        );
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <section className="app-surface min-w-0 p-5 sm:p-6">
                    <SectionHeading icon={WalletCards} title="Finance Overview" description="Fee collection for the current academic period." />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expected Fees</p><p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(expected_fees)}</p></div>
                        <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Collected</p><p className="mt-2 text-xl font-bold text-emerald-800">{formatCurrency(total_payments)}</p></div>
                        <div className="rounded-xl bg-red-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-red-600">Outstanding</p><p className="mt-2 text-xl font-bold text-red-800">{formatCurrency(outstanding_fees)}</p></div>
                        <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Students Paid</p><p className="mt-2 text-xl font-bold text-blue-800">{students_with_payments}</p></div>
                    </div>
                    <div className="mt-5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500"><span>Collection progress</span><span>{paymentRate}%</span></div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${paymentRate}%` }} /></div>
                    </div>
                </section>

                <section className="app-surface min-w-0 p-5 sm:p-6">
                    <SectionHeading icon={CalendarDays} title="Today's Attendance" description="Attendance activity recorded today." />
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/70"><div className="text-center"><p className="text-3xl font-bold text-slate-900">{attendanceRate}%</p><p className="text-xs text-slate-400">attendance rate</p></div></div>
                        <div className="grid flex-1 grid-cols-3 gap-3">
                            <div className="rounded-xl bg-emerald-50 p-3 text-center"><CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" /><p className="mt-2 text-xl font-bold text-emerald-800">{attendance_present}</p><p className="text-xs text-emerald-600">Present</p></div>
                            <div className="rounded-xl bg-red-50 p-3 text-center"><AlertCircle className="mx-auto h-4 w-4 text-red-600" /><p className="mt-2 text-xl font-bold text-red-800">{attendance_absent}</p><p className="text-xs text-red-600">Absent</p></div>
                            <div className="rounded-xl bg-amber-50 p-3 text-center"><CalendarDays className="mx-auto h-4 w-4 text-amber-600" /><p className="mt-2 text-xl font-bold text-amber-800">{attendance_late}</p><p className="text-xs text-amber-600">Late</p></div>
                        </div>
                    </div>
                    {attendance_total === 0 && <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">No attendance has been recorded today.</p>}
                </section>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <section className="app-surface min-w-0 p-5 sm:p-6">
                    <SectionHeading icon={BarChart3} title="Student Gender Distribution" description="Current student population by gender." />
                    <div className="space-y-5">
                        {gender_distribution.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No gender distribution data available.</p> : gender_distribution.map(item => {
                            const total = Number(item.total || 0);
                            const percentage = students === 0 ? 0 : Math.round((total / students) * 100);
                            return <div key={item.gender}><div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium capitalize text-slate-700">{String(item.gender || "Unknown").toLowerCase()}</span><span className="font-semibold text-slate-500">{total} <span className="font-normal text-slate-400">({percentage}%)</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percentage}%` }} /></div></div>;
                        })}
                    </div>
                </section>

                <section className="app-surface min-w-0 p-5 sm:p-6">
                    <SectionHeading icon={BookOpen} title="Students Per Class" description="Student population across classes." />
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {class_population.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No class population data available.</p> : class_population.map(item => <div key={item.class_name} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"><span className="min-w-0 truncate text-sm font-medium text-slate-700">{item.class_name}</span><span className="shrink-0 rounded-lg bg-white px-3 py-1 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-100">{item.total_students}</span></div>)}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <section className="app-surface min-w-0 overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="font-bold text-slate-900">Recent Students</h2><p className="mt-1 text-xs text-slate-400">Latest student registrations.</p></div>
                    <div className="divide-y divide-slate-100">
                        {recent_students.length === 0 ? <p className="p-6 text-sm text-slate-500">No recent students.</p> : recent_students.slice(0, 5).map(student => <div key={student.id} className="flex items-center gap-3 px-5 py-4 sm:px-6"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{`${student.first_name || ""} ${student.surname || ""}`.trim().split(/\s+/).map(part => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "S"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{student.surname} {student.first_name} {student.middle_name || ""}</p><p className="mt-0.5 text-xs text-slate-400">{student.admission_number}</p></div><span className="shrink-0 text-xs text-slate-400">{formatDate(student.created_at)}</span></div>)}
                    </div>
                </section>

                <section className="app-surface min-w-0 overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="font-bold text-slate-900">Recent Payments</h2><p className="mt-1 text-xs text-slate-400">Latest fee transactions.</p></div>
                    <div className="divide-y divide-slate-100">
                        {recent_payments.length === 0 ? <p className="p-6 text-sm text-slate-500">No recent payments.</p> : recent_payments.slice(0, 5).map(payment => <div key={payment.id} className="flex items-center gap-3 px-5 py-4 sm:px-6"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CreditCard className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{payment.student_name || payment.admission_number || "Student payment"}</p><p className="mt-0.5 text-xs text-slate-400">{formatDate(payment.payment_date)}</p></div><span className="shrink-0 text-sm font-bold text-emerald-700">{formatCurrency(payment.amount_paid)}</span></div>)}
                    </div>
                </section>

                <section className="app-surface min-w-0 overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="font-bold text-slate-900">Announcements</h2><p className="mt-1 text-xs text-slate-400">Latest school communications.</p></div>
                    <div className="divide-y divide-slate-100">
                        {recent_announcements.length === 0 ? <p className="p-6 text-sm text-slate-500">No recent announcements.</p> : recent_announcements.slice(0, 4).map((announcement, index) => <div key={announcement.id || index} className="flex gap-3 px-5 py-4 sm:px-6"><div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Megaphone className="h-4 w-4" /></div><div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold text-slate-800">{announcement.title || announcement.message}</p>{announcement.created_at && <p className="mt-1 text-xs text-slate-400">{formatDate(announcement.created_at)}</p>}</div></div>)}
                    </div>
                </section>
            </div>

            {top_students.length > 0 && (
                <section className="app-surface overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="font-bold text-slate-900">Top Students</h2><p className="mt-1 text-xs text-slate-400">Students with leading academic performance.</p></div>
                    <div className="overflow-x-auto">
                        <table>
                            <thead><tr><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Class</th><th className="px-4 py-3 text-center">Average</th><th className="px-4 py-3 text-center">Position</th></tr></thead>
                            <tbody>{top_students.slice(0, 5).map((student, index) => <tr key={student.id || index} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold">{student.student_name || `${student.surname || ""} ${student.first_name || ""}`.trim() || "Student"}</td><td className="px-4 py-3">{student.class_name || "-"}</td><td className="px-4 py-3 text-center font-bold">{student.average ?? student.average_score ?? student.score ?? "-"}</td><td className="px-4 py-3 text-center">{student.position ?? index + 1}</td></tr>)}</tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

export default DashboardPage;
