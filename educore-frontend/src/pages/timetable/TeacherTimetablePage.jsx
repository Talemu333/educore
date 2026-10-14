import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, Printer } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getMyTimetable } from "@/api/timetableApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const getErrorMessage = (error) => error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";

function TeacherTimetablePage() {
    const { user } = useAuth();
    const schoolId = user?.school_id;
    const timetableQuery = useQuery({
        queryKey: ["myTimetable", schoolId],
        queryFn: getMyTimetable,
        enabled: !!schoolId
    });

    const entries = timetableQuery.data || [];
    const sessionTerms = useMemo(
        () => [...new Set(entries.map((entry) => `${entry.session_name} · ${entry.term_name}`))],
        [entries]
    );

    return (
        <div className="space-y-6">
            <PageHeader title="My Timetable" description="Your weekly lessons, based on the teaching assignments allocated to your account." />
            <section className="app-surface overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Weekly Schedule</h2>
                        <p className="mt-1 text-sm text-slate-500">{entries.length} lesson{entries.length === 1 ? "" : "s"} scheduled</p>
                    </div>
                    <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Printer className="h-4 w-4" /> Print my timetable
                    </button>
                </div>
                <div className="space-y-4 p-4 sm:p-6">
                    {timetableQuery.isLoading ? (
                        <div className="py-12 text-center text-sm text-slate-500">Loading your timetable...</div>
                    ) : timetableQuery.error ? (
                        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">{getErrorMessage(timetableQuery.error)}</div>
                    ) : entries.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                            <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
                            <h3 className="mt-3 font-semibold text-slate-900">No timetable lessons yet</h3>
                            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">When the school administrator schedules lessons for your teaching assignments, they will appear here.</p>
                        </div>
                    ) : (
                        <>
                            {sessionTerms.length > 1 && <p className="text-xs text-slate-500">Your schedule includes: {sessionTerms.join(", ")}</p>}
                            {DAYS.map((day) => {
                                const dayEntries = entries.filter((entry) => entry.day_of_week === day);
                                return (
                                    <section key={day} className="overflow-hidden rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                                            <h3 className="font-semibold text-slate-800">{day}</h3>
                                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">{dayEntries.length} lesson{dayEntries.length === 1 ? "" : "s"}</span>
                                        </div>
                                        {dayEntries.length ? (
                                            <div className="divide-y divide-slate-100">
                                                {dayEntries.map((entry) => (
                                                    <article key={entry.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex min-w-0 gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--school-primary)]/10 text-[var(--school-primary)]"><Clock3 className="h-5 w-5" /></div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-slate-900">{entry.subject_name}</p>
                                                                <p className="mt-0.5 text-sm text-slate-600">{entry.class_name}{entry.arm_name ? ` · ${entry.arm_name}` : ""}</p>
                                                                <p className="mt-1 text-xs text-slate-500">{entry.session_name} · {entry.term_name}{entry.room ? ` · ${entry.room}` : ""}</p>
                                                            </div>
                                                        </div>
                                                        <span className="whitespace-nowrap text-sm font-semibold text-slate-700">{entry.start_time}–{entry.end_time}</span>
                                                    </article>
                                                ))}
                                            </div>
                                        ) : <p className="px-4 py-4 text-sm text-slate-400">No lessons scheduled.</p>}
                                    </section>
                                );
                            })}
                        </>
                    )}
                </div>
            </section>
            <style>{`@media print { body * { visibility: hidden !important; } .app-surface, .app-surface * { visibility: visible !important; } .app-surface { box-shadow: none !important; border: 0 !important; } button { display: none !important; } }`}</style>
        </div>
    );
}

export default TeacherTimetablePage;
