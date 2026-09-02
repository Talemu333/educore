import { useDashboard } from "@/hooks/useDashboard";

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

function DashboardPage() {
    const { data, isLoading, isError, error } = useDashboard();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
                    <p className="mt-1.5 text-sm text-slate-500 sm:text-base">Loading school overview...</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(item => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200 sm:h-28" />)}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6">
                <h2 className="font-bold text-red-700">Unable to load dashboard</h2>
                <p className="mt-2 break-words text-sm text-red-600">{error?.response?.data?.message || error?.message || "Something went wrong."}</p>
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

    const overviewCards = [
        { title: "Total Students", value: students, icon: "👨‍🎓", description: "Registered students" },
        { title: "Active Students", value: active_students, icon: "🎓", description: "Currently enrolled" },
        { title: "Teachers", value: teachers, icon: "👨‍🏫", description: "Teaching staff" },
        { title: "Parents", value: parents, icon: "👨‍👩‍👧", description: "Registered parents" },
        { title: "Classes", value: classes, icon: "🏫", description: "School classes" },
    ];

    return (
        <div className="w-full min-w-0 space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
                    <p className="mt-1.5 text-sm text-slate-500 sm:text-base">Welcome to EDUCORE. Here is your school overview.</p>
                </div>
                <div className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 sm:w-auto sm:px-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Academic Period</p>
                    <p className="mt-1 break-words font-bold text-blue-900">{current_session || "No session"} • {current_term || "No term"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {overviewCards.map(card => (
                    <div key={card.title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0"><p className="text-sm font-medium text-slate-500">{card.title}</p><p className="mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">{card.value}</p></div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">{card.icon}</div>
                        </div>
                        <p className="mt-2.5 text-xs text-slate-400">{card.description}</p>
                    </div>
                ))}
            </div>

            <section>
                <div className="mb-2">
                    <h2 className="text-xl font-bold text-slate-900">Finance Overview</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Current session and term fee collection.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-medium text-slate-500">Expected Fees</p><p className="mt-1.5 break-words text-xl font-bold text-slate-900 sm:text-2xl">{formatCurrency(expected_fees)}</p></div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-700">Total Payments</p><p className="mt-1.5 break-words text-xl font-bold text-emerald-800 sm:text-2xl">{formatCurrency(total_payments)}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="text-sm font-medium text-red-700">Outstanding Fees</p><p className="mt-1.5 break-words text-xl font-bold text-red-800 sm:text-2xl">{formatCurrency(outstanding_fees)}</p></div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-medium text-blue-700">Students With Payments</p><p className="mt-1.5 text-xl font-bold text-blue-800 sm:text-2xl">{students_with_payments}</p></div>
                </div>
            </section>

            <section>
                <div className="mb-2">
                    <h2 className="text-xl font-bold text-slate-900">Today's Attendance</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Attendance recorded for today.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-medium text-blue-700">Attendance Rate</p><p className="mt-1.5 text-2xl font-bold text-blue-900 sm:text-3xl">{attendance_today}%</p></div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-700">Present</p><p className="mt-1.5 text-2xl font-bold text-emerald-900 sm:text-3xl">{attendance_present}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="text-sm font-medium text-red-700">Absent</p><p className="mt-1.5 text-2xl font-bold text-red-900 sm:text-3xl">{attendance_absent}</p></div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><p className="text-sm font-medium text-amber-700">Late</p><p className="mt-1.5 text-2xl font-bold text-amber-900 sm:text-3xl">{attendance_late}</p></div>
                </div>
                {attendance_total === 0 && <p className="mt-2 text-sm text-slate-400">No attendance has been recorded today.</p>}
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-lg font-bold text-slate-900">Student Gender Distribution</h2><div className="mt-4 space-y-4">{gender_distribution.map(item => { const total = Number(item.total || 0); const percentage = students === 0 ? 0 : Math.round((total / students) * 100); return <div key={item.gender}><div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{item.gender}</span><span className="shrink-0 text-slate-500">{total} ({percentage}%)</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percentage}%` }} /></div></div>; })}</div></section>
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-lg font-bold text-slate-900">Students Per Class</h2><div className="mt-4 space-y-2.5">{class_population.map(item => <div key={item.class_name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 sm:px-4"><span className="min-w-0 truncate font-medium text-slate-700">{item.class_name}</span><span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-sm font-bold text-slate-700 shadow-sm">{item.total_students}</span></div>)}</div></section>
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
