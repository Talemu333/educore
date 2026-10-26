import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRoundCheck, UserPlus, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTeachers } from "@/api/teacherApi";
import { getClasses } from "@/api/classApi";
import { getArms } from "@/api/armApi";
import { getSessions } from "@/api/sessionApi";
import {
    createClassTeacherAssignment,
    deactivateClassTeacherAssignment,
    getClassTeacherAssignments
} from "@/api/classTeacherAssignmentApi";

const fieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function ClassTeacherAssignments() {
    const queryClient = useQueryClient();
    const [teacherId, setTeacherId] = useState("");
    const [classId, setClassId] = useState("");
    const [armId, setArmId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const assignmentsQuery = useQuery({
        queryKey: ["class-teacher-assignments"],
        queryFn: getClassTeacherAssignments
    });
    const teachersQuery = useQuery({
        queryKey: ["class-teacher-candidates"],
        queryFn: () => getTeachers({ page: 1, limit: 100, status: "true" })
    });
    const classesQuery = useQuery({ queryKey: ["classes"], queryFn: getClasses });
    const armsQuery = useQuery({ queryKey: ["arms"], queryFn: getArms });
    const sessionsQuery = useQuery({ queryKey: ["sessions"], queryFn: getSessions });

    const teachers = teachersQuery.data?.data || teachersQuery.data?.teachers || teachersQuery.data || [];
    const classes = classesQuery.data || [];
    const arms = armsQuery.data || [];
    const sessions = sessionsQuery.data || [];
    const filteredArms = useMemo(
        () => arms.filter(arm => String(arm.class_id) === String(classId)),
        [arms, classId]
    );
    const activeAssignments = assignmentsQuery.data || [];

    const createMutation = useMutation({
        mutationFn: createClassTeacherAssignment,
        onSuccess: async () => {
            setTeacherId("");
            setClassId("");
            setArmId("");
            setSessionId("");
            setError("");
            setMessage("Class teacher assigned successfully.");
            await queryClient.invalidateQueries({ queryKey: ["class-teacher-assignments"] });
        },
        onError: (err) => {
            setMessage("");
            setError(err.response?.data?.message || "Unable to assign this class teacher.");
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateClassTeacherAssignment,
        onSuccess: async () => {
            setMessage("Class teacher assignment deactivated.");
            setError("");
            await queryClient.invalidateQueries({ queryKey: ["class-teacher-assignments"] });
        },
        onError: (err) => {
            setMessage("");
            setError(err.response?.data?.message || "Unable to deactivate this assignment.");
        }
    });

    const submit = (event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        createMutation.mutate({
            teacher_id: Number(teacherId),
            class_id: Number(classId),
            arm_id: armId ? Number(armId) : null,
            session_id: Number(sessionId)
        });
    };

    const loading = assignmentsQuery.isLoading || teachersQuery.isLoading || classesQuery.isLoading || armsQuery.isLoading || sessionsQuery.isLoading;

    return (
        <section className="app-surface space-y-5 p-4 sm:p-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <UserRoundCheck className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Class Teacher Assignments</h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                        Assign a teacher to oversee a class, coordinate student progress, and add general class observations. This is separate from subject-teacher assignments above.
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="space-y-1.5 text-sm font-medium text-slate-700">
                    Teacher
                    <select required value={teacherId} onChange={e => setTeacherId(e.target.value)} className={fieldClass}>
                        <option value="">Select teacher</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.teacher_name || [teacher.surname, teacher.first_name].filter(Boolean).join(" ") || teacher.full_name || teacher.staff_number}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">
                    Class
                    <select required value={classId} onChange={e => { setClassId(e.target.value); setArmId(""); }} className={fieldClass}>
                        <option value="">Select class</option>
                        {classes.map(item => <option key={item.id} value={item.id}>{item.class_name}</option>)}
                    </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">
                    Arm (if applicable)
                    <select value={armId} onChange={e => setArmId(e.target.value)} className={fieldClass} disabled={!classId}>
                        <option value="">No arm / whole class</option>
                        {filteredArms.map(item => <option key={item.id} value={item.id}>{item.arm_name}</option>)}
                    </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">
                    Academic session
                    <select required value={sessionId} onChange={e => setSessionId(e.target.value)} className={fieldClass}>
                        <option value="">Select session</option>
                        {sessions.map(item => <option key={item.id} value={item.id}>{item.session_name}{item.is_current ? " (Current)" : ""}</option>)}
                    </select>
                </label>
                <div className="md:col-span-2 xl:col-span-4">
                    <Button type="submit" disabled={loading || createMutation.isPending || !teacherId || !classId || !sessionId}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {createMutation.isPending ? "Assigning..." : "Assign Class Teacher"}
                    </Button>
                </div>
            </form>

            {message && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Teacher</th>
                            <th className="px-4 py-3 font-semibold">Class</th>
                            <th className="px-4 py-3 font-semibold">Arm</th>
                            <th className="px-4 py-3 font-semibold">Session</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">Loading class teacher assignments…</td></tr>
                        ) : activeAssignments.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No class teacher assignments yet.</td></tr>
                        ) : activeAssignments.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/70">
                                <td className="px-4 py-3 font-medium text-slate-800">{item.teacher_name}</td>
                                <td className="px-4 py-3">{item.class_name}</td>
                                <td className="px-4 py-3">{item.arm_name || "Whole class"}</td>
                                <td className="px-4 py-3">{item.session_name}</td>
                                <td className="px-4 py-3">
                                    <span className={item.is_active ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"}>
                                        {item.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {item.is_active && (
                                        <button type="button" onClick={() => {
                                            if (window.confirm("Deactivate this class teacher assignment?")) deactivateMutation.mutate(item.id);
                                        }} disabled={deactivateMutation.isPending} className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700">
                                            <XCircle className="h-4 w-4" /> Deactivate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <p>Only one active class teacher is allowed per class/arm in each academic session.</p>
                <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["class-teacher-assignments"] })} className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-slate-800">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>
        </section>
    );
}

export default ClassTeacherAssignments;
