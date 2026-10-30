import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowDownRight, ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, Clock3, GraduationCap, Users, ClipboardCheck, FileText, UserRound, AlertCircle } from "lucide-react";
import { getMyAssignments } from "@/api/teacherAssignmentApi";
import { getAttendanceByAssignment } from "@/api/attendanceApi";
import { getMyTimetable } from "@/api/timetableApi";
import { useSchoolTheme } from "@/context/SchoolThemeContext";

function TeacherDashboardPage() {

    const navigate = useNavigate();
    const { theme } = useSchoolTheme();
    const [dashboard, setDashboard] = useState(null);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [attendanceTrend, setAttendanceTrend] = useState([]);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAssignments, setShowAssignments] = useState(false);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getMyAssignments();

                

                setDashboard(data);

            } catch (err) {

                

                setError(
                    err.response?.data?.message ||
                    "Unable to load teacher dashboard."
                );

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, []);


    const assignments = dashboard?.assignments || [];

    useEffect(() => {
        if (!dashboard) return;
        let cancelled = false;

        const loadTeachingInsights = async () => {
            setInsightsLoading(true);
            setInsightsError("");
            try {
                const timetablePromise = getMyTimetable();
                const dateKeys = Array.from({ length: 7 }, (_, index) => {
                    const date = new Date();
                    date.setHours(12, 0, 0, 0);
                    date.setDate(date.getDate() - (6 - index));
                    return date.toLocaleDateString("en-CA");
                });
                const uniqueGroups = new Map();
                assignments.forEach(assignment => {
                    const key = [assignment.class_id, assignment.arm_id || "", assignment.session_id, assignment.term_id].join(":");
                    if (!uniqueGroups.has(key)) uniqueGroups.set(key, assignment);
                });
                const attendanceRequests = [...uniqueGroups.values()].flatMap(assignment =>
                    dateKeys.map(date => getAttendanceByAssignment(assignment.id, date)
                        .then(rows => ({ date, rows: Array.isArray(rows) ? rows : [] })))
                );
                const [timetable, attendanceResults] = await Promise.all([
                    timetablePromise,
                    Promise.all(attendanceRequests)
                ]);
                if (cancelled) return;

                const today = new Date().toLocaleDateString("en-CA");
                const weekday = new Date().toLocaleDateString("en-NG", { weekday: "long" });
                const todaysLessons = (Array.isArray(timetable) ? timetable : [])
                    .filter(entry => entry.day_of_week === weekday)
                    .sort((a, b) => String(a.start_time || "").localeCompare(String(b.start_time || "")));
                setTodaySchedule(todaysLessons);

                const daily = new Map(dateKeys.map(date => [date, { date, present: 0, absent: 0, late: 0, excused: 0, marked: 0 }]));
                attendanceResults.forEach(({ date, rows }) => {
                    const item = daily.get(date);
                    if (!item) return;
                    rows.forEach(row => {
                        const status = String(row.status || "").toUpperCase();
                        item.marked += 1;
                        if (status === "PRESENT") item.present += 1;
                        else if (status === "ABSENT") item.absent += 1;
                        else if (status === "LATE") item.late += 1;
                        else if (status === "EXCUSED") item.excused += 1;
                    });
                });
                setAttendanceTrend([...daily.values()]);
            } catch (err) {
                if (!cancelled) setInsightsError(err.response?.data?.message || "Some teaching insights could not be loaded.");
            } finally {
                if (!cancelled) setInsightsLoading(false);
            }
        };

        loadTeachingInsights();
        return () => { cancelled = true; };
    }, [dashboard, assignments]);


    const subjects = useMemo(() => {

        return new Set(
            assignments.map(
                assignment =>
                    assignment.subject_id
            )
        ).size;

    }, [assignments]);


    const classes = useMemo(() => {

        return new Set(
            assignments.map(
                assignment =>
                    assignment.class_id
            )
        ).size;

    }, [assignments]);


    if (loading) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-gray-500">
                    Loading teacher dashboard...
                </div>

            </div>
        );

    }


    if (error) {

        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                <h2 className="font-semibold text-red-700">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>

            </div>
        );

    }


    return (

        <div className="space-y-6">

            {/* HEADER */}

            <div>

                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Teacher Dashboard
                </h1>

                <p className="mt-1 text-gray-500">

                    Welcome back,{" "}

                    <span className="font-semibold text-gray-700">
                        {dashboard?.teacher?.full_name || "Teacher"}
                    </span>

                </p>

            </div>


            {/* TEACHER PROFILE */}

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-[var(--school-primary-soft)] via-white to-slate-50 p-5 shadow-sm sm:p-6">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <p className="text-sm text-slate-600">
                            Welcome back
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">

                            {dashboard?.teacher?.full_name ||
                                "Teacher"}

                        </h2>

                        <p className="mt-2 text-sm text-slate-600">

                            Staff Number:{" "}

                            <span className="font-semibold">

                                {dashboard?.teacher?.staff_number ||
                                    "Not available"}

                            </span>

                        </p>

                    </div>


                    <div className="rounded-xl border border-blue-100 bg-white px-5 py-4 shadow-sm">

                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Teaching Assignments
                        </p>

                        <p className="mt-1 text-3xl font-bold">

                            {dashboard?.totalAssignments || 0}

                        </p>

                    </div>

                </div>

            </div>


                        {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">


                {/* ASSIGNMENTS */}

                <button
                    type="button"
                    onClick={() => setShowAssignments(value => !value)}
                    aria-expanded={showAssignments}
                    aria-controls="teacher-assignments-table"
                    className={`w-full rounded-xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${showAssignments ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Assignments</p>
                            <p className="mt-2 text-3xl font-bold text-gray-800">{dashboard?.totalAssignments || 0}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">📚</div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-blue-600">{showAssignments ? "Click to hide assignments" : "Click to view your assigned classes and subjects"}</p>
                </button>


                {/* SUBJECTS */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Subjects
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">
                                {subjects}
                            </p>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
                            📝
                        </div>

                    </div>

                </div>


                {/* CLASSES */}

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Classes
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">
                                {classes}
                            </p>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl">
                            🏫
                        </div>

                    </div>

                </div>

            </div>


            {/* TODAY'S SCHEDULE */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dashboard-primary-soft)] text-[var(--dashboard-primary-dark)]"><CalendarDays size={20}/></span>
                        <div><h2 className="text-base font-bold text-slate-900">Today's Schedule</h2><p className="text-xs text-slate-500">{todayLabel}</p></div>
                    </div>
                    <button type="button" onClick={() => navigate("/teacher-timetable")} className="text-xs font-semibold text-[var(--dashboard-primary-dark)] hover:underline">View full timetable</button>
                </div>
                {insightsLoading ? <p className="py-5 text-center text-sm text-slate-400">Loading today's lessons...</p> : todaySchedule.length ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {todaySchedule.map((lesson, index) => {
                            const now = new Date();
                            const toMinutes = value => { const [hour, minute] = String(value || "").split(":").map(Number); return hour * 60 + minute; };
                            const current = now.getHours() * 60 + now.getMinutes();
                            const start = toMinutes(lesson.start_time), end = toMinutes(lesson.end_time);
                            const status = current >= start && current < end ? "In progress" : current >= end ? "Completed" : "Upcoming";
                            return <article key={lesson.id || index} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--dashboard-primary-dark)]"><Clock3 size={18}/></span>
                                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-900">{lesson.subject_name || "Lesson"}</p><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status === "In progress" ? "bg-emerald-100 text-emerald-700" : status === "Completed" ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-700"}`}>{status}</span></div><p className="mt-1 text-xs text-slate-600">{lesson.class_name}{lesson.arm_name ? ` · ${lesson.arm_name}` : ""}</p><p className="mt-1 text-xs text-slate-500">{lesson.start_time}–{lesson.end_time}{lesson.room ? ` · ${lesson.room}` : ""}</p></div>
                            </article>;
                        })}
                    </div>
                ) : <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center"><CalendarDays className="mx-auto h-7 w-7 text-slate-300"/><p className="mt-2 text-sm font-medium text-slate-600">No lessons scheduled for today</p><p className="mt-1 text-xs text-slate-400">Your scheduled lessons will appear here.</p></div>}
            </section>

            {/* ATTENDANCE AND STUDENT PERFORMANCE */}
            <section className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ClipboardCheck size={20}/></span><div><h2 className="text-base font-bold text-slate-900">Attendance Monitor</h2><p className="text-xs text-slate-500">Daily records across your assigned classes · Last 7 days</p></div></div><button type="button" onClick={() => navigate("/attendance")} className="text-xs font-semibold text-[var(--dashboard-primary-dark)] hover:underline">Open attendance</button></div>
                    {attendanceTrend.some(day => day.marked > 0) ? <>
                        <div className="mb-3 flex flex-wrap gap-4"><div><p className="text-2xl font-extrabold text-slate-900">{attendanceRate === null ? "—" : `${attendanceRate}%`}</p><p className="text-[11px] text-slate-500">Today's present rate</p></div><div><p className="text-2xl font-extrabold text-slate-900">{todayAttendance?.marked || 0}</p><p className="text-[11px] text-slate-500">Records today</p></div></div>
                        <div className="flex h-36 items-end gap-2 border-b border-slate-100 pb-1">{attendanceTrend.map(day => { const rate = day.marked ? Math.round(day.present / day.marked * 100) : 0; const height = day.marked ? Math.max(5, day.marked / maxAttendance * 100) : 3; return <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"><span className="text-[9px] font-semibold text-slate-500">{day.marked ? `${rate}%` : "—"}</span><div title={`${day.date}: ${day.present} present, ${day.absent} absent, ${day.late} late`} className="w-full max-w-10 rounded-t-md bg-emerald-500/85" style={{height: `${height}%`}}/><span className="text-[9px] text-slate-500">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-NG",{weekday:"short"})}</span></div>; })}</div>
                        <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500"/>Present rate</span><span>Counts reflect recorded attendance only</span></div>
                    </> : <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center"><Activity className="mx-auto h-7 w-7 text-slate-300"/><p className="mt-2 text-sm font-medium text-slate-600">No attendance records for this period</p><p className="mt-1 text-xs text-slate-400">Once attendance is recorded for your assigned classes, the daily trend will appear here.</p></div>}
                    {insightsError && <p role="status" className="mt-3 text-xs text-amber-700">{insightsError}</p>}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><GraduationCap size={20}/></span><div><h2 className="text-base font-bold text-slate-900">Student Performance Watch</h2><p className="text-xs text-slate-500">Identify students who may need support</p></div></div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4"><div className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"/><div><p className="text-sm font-semibold text-slate-800">Performance trends need a dedicated data feed</p><p className="mt-1 text-xs leading-5 text-slate-600">EduProw's current teacher endpoints do not yet provide a complete history of comparable assessment scores. We are not showing unverified improving or declining labels.</p></div></div></div>
                    <button type="button" onClick={() => navigate("/class-teacher-progress")} className="mt-4 flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left transition hover:border-[var(--dashboard-primary)] hover:bg-slate-50"><span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><FileText size={17}/>Open Student Progress Reports</span><span className="text-xs font-semibold text-[var(--dashboard-primary-dark)]">View <span aria-hidden="true">→</span></span></button>
                </div>
            </section>

            {/* QUICK ACTIONS */}

            {/* QUICK ACTIONS */}

            <div>

                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                    {/* TAKE ATTENDANCE */}

                    <button
                        type="button"
                        onClick={() => navigate("/attendance")}
                        className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >

                        <div className="text-2xl">
                            📋
                        </div>

                        <h3 className="mt-3 font-semibold text-gray-800">
                            Take Attendance
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Record attendance for your assigned classes.
                        </p>

                    </button>


                    {/* ENTER RESULTS */}

                    <button
                        type="button"
                        onClick={() => navigate("/results")}
                        className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="text-2xl">
                            📊
                        </div>

                        <h3 className="mt-3 font-semibold text-gray-800">
                            Enter Results
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter and manage students' academic results.
                        </p>

                    </button>


                    {/* MY TIMETABLE */}
                    <button
                        type="button"
                        onClick={() => navigate("/teacher-timetable")}
                        className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="text-2xl">🗓️</div>
                        <h3 className="mt-3 font-semibold text-gray-800">My Timetable</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            View your weekly lessons, classes, and teaching times.
                        </p>
                    </button>


                    {/* STUDENT PROGRESS REPORTS */}
                    <button
                        type="button"
                        onClick={() => navigate("/class-teacher-progress")}
                        className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="text-2xl">📝</div>
                        <h3 className="mt-3 font-semibold text-gray-800">Student Progress Reports</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Prepare weekly and termly progress updates for students in your class-teacher assignment.
                        </p>
                    </button>


                    {/* MY STUDENTS */}

                    <button
                        type="button"
                        onClick={() => navigate("/teacher-students")}
                        className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="text-2xl">
                            👨‍🎓
                        </div>

                        <h3 className="mt-3 font-semibold text-gray-800">
                            My Students
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            View students in your assigned classes.
                        </p>

                    </button>

                </div>

            </div>



            {/* ASSIGNMENTS */}

            {showAssignments && <div id="teacher-assignments-table" className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">

                <div className="border-b border-gray-100 px-6 py-5">

                    <h2 className="text-lg font-semibold text-gray-800">
                        My Teaching Assignments
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Classes and subjects assigned to you.
                    </p>

                </div>


                {assignments.length === 0 ? (

                    <div className="px-6 py-10 text-center">

                        <div className="text-4xl">
                            📚
                        </div>

                        <p className="mt-3 text-gray-500">
                            You currently have no teaching assignments.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">

                                <tr>

                                    <th className="px-6 py-4">
                                        Subject
                                    </th>

                                    <th className="px-6 py-4">
                                        Class
                                    </th>

                                    <th className="px-6 py-4">
                                        Arm
                                    </th>

                                    <th className="px-6 py-4">
                                        Term
                                    </th>

                                    <th className="px-6 py-4">
                                        Session
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-100">

                                {assignments.map(
                                    assignment => (

                                        <tr
                                            key={assignment.id}
                                            className="hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4">

                                                <span className="font-medium text-gray-800">

                                                    {
                                                        assignment.subject_name
                                                    }

                                                </span>

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.class_name
                                                }

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.arm_name ||
                                                    "All Arms"
                                                }

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.term_name
                                                }

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.session_name
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>}

        </div>

    );

}

export default TeacherDashboardPage;