import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, Plus, Pencil, Trash2, X, Printer } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getAllTeacherAssignments } from "@/api/teacherAssignmentApi";
import { createTimetable, deleteTimetable, getTimetables, updateTimetable } from "@/api/timetableApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EMPTY_FORM = { teacher_assignment_id: "", day_of_week: "Monday", start_time: "08:00", end_time: "09:00", room: "" };
const getErrorMessage = (error) => error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";

function TimetablePage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const schoolId = user?.school_id;
    const [formOpen, setFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedClass, setSelectedClass] = useState("all");
    const [notice, setNotice] = useState({ type: "", text: "" });

    const assignmentsQuery = useQuery({
        queryKey: ["allTeacherAssignments", schoolId],
        queryFn: getAllTeacherAssignments,
        enabled: !!schoolId
    });
    const timetableQuery = useQuery({
        queryKey: ["timetables", schoolId],
        queryFn: getTimetables,
        enabled: !!schoolId
    });

    const assignments = assignmentsQuery.data?.assignments || [];
    const timetableEntries = timetableQuery.data || [];
    const classes = useMemo(() => {
        const seen = new Set();
        return assignments.filter((assignment) => {
            const key = String(assignment.class_id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).sort((a, b) => a.class_name.localeCompare(b.class_name));
    }, [assignments]);

    const filteredEntries = useMemo(
        () => timetableEntries.filter((entry) => selectedClass === "all" || String(entry.class_id) === selectedClass),
        [timetableEntries, selectedClass]
    );

    const saveMutation = useMutation({
        mutationFn: (payload) => editingEntry
            ? updateTimetable(editingEntry.id, payload)
            : createTimetable(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["timetables", schoolId] });
            setNotice({ type: "success", text: editingEntry ? "Timetable entry updated." : "Timetable entry added." });
            setFormOpen(false);
            setEditingEntry(null);
            setForm(EMPTY_FORM);
        },
        onError: (error) => setNotice({ type: "error", text: getErrorMessage(error) })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTimetable,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["timetables", schoolId] });
            setNotice({ type: "success", text: "Timetable entry deleted." });
        },
        onError: (error) => setNotice({ type: "error", text: getErrorMessage(error) })
    });

    function openCreateForm() {
        setEditingEntry(null);
        setForm({ ...EMPTY_FORM, teacher_assignment_id: assignments[0] ? String(assignments[0].id) : "" });
        setNotice({ type: "", text: "" });
        setFormOpen(true);
    }

    function openEditForm(entry) {
        setEditingEntry(entry);
        setForm({
            teacher_assignment_id: String(entry.teacher_assignment_id),
            day_of_week: entry.day_of_week,
            start_time: entry.start_time,
            end_time: entry.end_time,
            room: entry.room || ""
        });
        setNotice({ type: "", text: "" });
        setFormOpen(true);
    }

    function handleSave(event) {
        event.preventDefault();
        setNotice({ type: "", text: "" });
        if (!form.teacher_assignment_id) {
            setNotice({ type: "error", text: "Create a teacher assignment before adding a timetable entry." });
            return;
        }
        if (form.end_time <= form.start_time) {
            setNotice({ type: "error", text: "The lesson end time must be later than the start time." });
            return;
        }
        saveMutation.mutate({
            ...form,
            teacher_assignment_id: Number(form.teacher_assignment_id),
            room: form.room.trim() || null
        });
    }

    const loading = timetableQuery.isLoading || assignmentsQuery.isLoading;
    const loadError = timetableQuery.error || assignmentsQuery.error;

    return (
        <div className="timetable-printable space-y-6">
            <div className="timetable-screen-content">
            <PageHeader title="Timetable" description="Create and manage the school's weekly lesson schedule." />

            <section className="app-surface overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Weekly Timetable</h2>
                        <p className="mt-1 text-sm text-slate-500">Lessons are checked for teacher and class time conflicts.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Printer className="h-4 w-4" /> Print
                        </button>
                        <button type="button" onClick={openCreateForm} disabled={!assignments.length} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--school-primary)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                            <Plus className="h-4 w-4" /> Add lesson
                        </button>
                    </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                    {notice.text && (
                        <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${notice.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                            {notice.text}
                        </div>
                    )}

                    {formOpen && (
                        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="font-semibold text-slate-900">{editingEntry ? "Edit timetable lesson" : "Add timetable lesson"}</h3>
                                <button type="button" onClick={() => { setFormOpen(false); setEditingEntry(null); }} aria-label="Close form" className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                            </div>
                            {!assignments.length ? (
                                <p className="text-sm text-amber-700">There are no teacher assignments yet. Assign teachers to subjects and classes first.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
                                        Teacher assignment
                                        <select required value={form.teacher_assignment_id} onChange={(event) => setForm({ ...form, teacher_assignment_id: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-[var(--school-primary)]">
                                            <option value="">Select class, subject and teacher</option>
                                            {assignments.map((assignment) => (
                                                <option key={assignment.id} value={assignment.id}>
                                                    {assignment.class_name}{assignment.arm_name ? ` - ${assignment.arm_name}` : ""} · {assignment.subject_name} · {assignment.teacher_name} · {assignment.session_name} / {assignment.term_name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="text-sm font-medium text-slate-700">Day
                                        <select value={form.day_of_week} onChange={(event) => setForm({ ...form, day_of_week: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal">
                                            {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                                        </select>
                                    </label>
                                    <label className="text-sm font-medium text-slate-700">Start time
                                        <input required type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
                                    </label>
                                    <label className="text-sm font-medium text-slate-700">End time
                                        <input required type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
                                    </label>
                                    <label className="text-sm font-medium text-slate-700">Room (optional)
                                        <input maxLength={30} value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="e.g. Room 4 or Lab" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
                                    </label>
                                    <div className="flex items-end gap-2">
                                        <button type="submit" disabled={saveMutation.isPending || !assignments.length} className="rounded-lg bg-[var(--school-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                                            {saveMutation.isPending ? "Saving..." : editingEntry ? "Save changes" : "Add lesson"}
                                        </button>
                                        <button type="button" onClick={() => { setFormOpen(false); setEditingEntry(null); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="max-w-sm text-sm font-medium text-slate-700">Filter by class
                            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal">
                                <option value="all">All classes</option>
                                {classes.map((schoolClass) => <option key={schoolClass.class_id} value={String(schoolClass.class_id)}>{schoolClass.class_name}</option>)}
                            </select>
                        </label>
                        <p className="text-sm text-slate-500">{filteredEntries.length} lesson{filteredEntries.length === 1 ? "" : "s"} scheduled</p>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-sm text-slate-500">Loading timetable...</div>
                    ) : loadError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">{getErrorMessage(loadError)}</div>
                    ) : !assignments.length ? (
                        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                            <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
                            <h3 className="mt-3 font-semibold text-slate-900">Teacher assignments needed</h3>
                            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">Assign teachers to their subjects, classes, academic sessions and terms before building the timetable.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {DAYS.map((day) => {
                                const entries = filteredEntries.filter((entry) => entry.day_of_week === day);
                                return (
                                    <section key={day} className="overflow-hidden rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                                            <h3 className="font-semibold text-slate-800">{day}</h3>
                                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">{entries.length} lesson{entries.length === 1 ? "" : "s"}</span>
                                        </div>
                                        {entries.length ? (
                                            <div className="divide-y divide-slate-100">
                                                {entries.map((entry) => (
                                                    <div key={entry.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex min-w-0 gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--school-primary)]/10 text-[var(--school-primary)]"><Clock3 className="h-5 w-5" /></div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-slate-900">{entry.subject_name}</p>
                                                                <p className="mt-0.5 text-sm text-slate-600">{entry.class_name}{entry.arm_name ? ` · ${entry.arm_name}` : ""} · {entry.teacher_name}</p>
                                                                <p className="mt-1 text-xs text-slate-500">{entry.session_name} · {entry.term_name}{entry.room ? ` · ${entry.room}` : ""}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                                                            <span className="whitespace-nowrap text-sm font-semibold text-slate-700">{entry.start_time}–{entry.end_time}</span>
                                                            <div className="flex gap-1">
                                                                <button type="button" onClick={() => openEditForm(entry)} aria-label={`Edit ${entry.subject_name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Pencil className="h-4 w-4" /></button>
                                                                <button type="button" onClick={() => {
                                                                    if (window.confirm(`Delete the ${entry.subject_name} lesson for ${entry.class_name} on ${entry.day_of_week}?`)) {
                                                                        setNotice({ type: "", text: "" });
                                                                        deleteMutation.mutate(entry.id);
                                                                    }
                                                                }} disabled={deleteMutation.isPending} aria-label={`Delete ${entry.subject_name}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="px-4 py-4 text-sm text-slate-400">No lessons scheduled.</p>}
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
            </div>

            <div className="timetable-print-only">
                <h1 className="text-2xl font-bold">Weekly Timetable</h1>
                <p className="mt-1 mb-4 text-sm">
                    {selectedClass === "all"
                        ? "All classes"
                        : classes.find((schoolClass) => String(schoolClass.class_id) === selectedClass)?.class_name || "Selected class"}
                </p>
                {filteredEntries.length === 0 ? (
                    <p>No lessons are scheduled for this selection.</p>
                ) : (
                    <table className="timetable-print-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Time</th>
                                <th>Class / Arm</th>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Session / Term</th>
                                <th>Room</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...filteredEntries]
                                .sort((a, b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week)
                                    || String(a.start_time).localeCompare(String(b.start_time)))
                                .map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{entry.day_of_week}</td>
                                        <td>{entry.start_time}–{entry.end_time}</td>
                                        <td>{entry.class_name}{entry.arm_name ? ` / ${entry.arm_name}` : ""}</td>
                                        <td>{entry.subject_name}</td>
                                        <td>{entry.teacher_name}</td>
                                        <td>{entry.session_name} / {entry.term_name}</td>
                                        <td>{entry.room || "—"}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default TimetablePage;
