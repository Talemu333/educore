import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/api/axios";
import { getClasses } from "@/services/classService";
import { getSessions } from "@/services/sessionService";
import { getSubjects } from "@/api/subjectApi";
import PageHeader from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function AcademicProgrammesPage() {
    const queryClient = useQueryClient();
    const [classId, setClassId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [programmeId, setProgrammeId] = useState("");
    const [programmeName, setProgrammeName] = useState("");
    const [programmeCode, setProgrammeCode] = useState("");
    const [programmeDescription, setProgrammeDescription] = useState("");
    const [subjectChoices, setSubjectChoices] = useState([]);
    const [studentIds, setStudentIds] = useState([]);

    const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: getClasses });
    const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: getSessions });
    const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: getSubjects });
    const seniorClasses = useMemo(() => classes.filter(item => String(item.class_level).toLowerCase() === "senior"), [classes]);

    const { data: programmes = [], isLoading: programmesLoading } = useQuery({
        queryKey: ["academic-programmes", classId],
        queryFn: async () => (await api.get("/academic-programmes", { params: { class_id: classId } })).data.data,
        enabled: !!classId
    });
    const { data: programmeSubjects = [] } = useQuery({
        queryKey: ["academic-programme-subjects", programmeId],
        queryFn: async () => (await api.get(`/academic-programmes/${programmeId}/subjects`)).data.data,
        enabled: !!programmeId
    });
    const { data: students = [], isLoading: studentsLoading } = useQuery({
        queryKey: ["programme-students", classId, sessionId],
        queryFn: async () => (await api.get("/academic-programmes/students", { params: { class_id: classId, session_id: sessionId } })).data.data,
        enabled: !!classId && !!sessionId
    });

    useEffect(() => {
        setProgrammeId("");
        setSubjectChoices([]);
        setStudentIds([]);
    }, [classId]);

    useEffect(() => {
        setSubjectChoices(programmeSubjects.map(item => ({ subject_id: item.subject_id, is_compulsory: item.is_compulsory })));
    }, [programmeSubjects]);

    const createMutation = useMutation({
        mutationFn: async () => (await api.post("/academic-programmes", {
            class_id: Number(classId),
            programme_name: programmeName,
            programme_code: programmeCode,
            description: programmeDescription
        })).data.data,
        onSuccess: () => {
            toast.success("Programme created.");
            setProgrammeName(""); setProgrammeCode(""); setProgrammeDescription("");
            queryClient.invalidateQueries({ queryKey: ["academic-programmes", classId] });
        },
        onError: error => toast.error(error.response?.data?.message || "Could not create programme.")
    });

    const saveSubjectsMutation = useMutation({
        mutationFn: async () => (await api.put(`/academic-programmes/${programmeId}/subjects`, { subjects: subjectChoices })).data.data,
        onSuccess: () => {
            toast.success("Programme subjects saved.");
            queryClient.invalidateQueries({ queryKey: ["academic-programme-subjects", programmeId] });
        },
        onError: error => toast.error(error.response?.data?.message || "Could not save programme subjects.")
    });

    const assignMutation = useMutation({
        mutationFn: async () => (await api.post("/academic-programmes/assign-students", {
            class_id: Number(classId),
            session_id: Number(sessionId),
            programme_id: Number(programmeId),
            student_ids: studentIds,
            subject_ids: subjectChoices.map(item => Number(item.subject_id))
        })).data,
        onSuccess: response => {
            toast.success(response.data?.message || "Student programme and subjects assigned.");
            setStudentIds([]);
            queryClient.invalidateQueries({ queryKey: ["programme-students", classId, sessionId] });
        },
        onError: error => toast.error(error.response?.data?.message || "Could not assign students.")
    });

    const toggleSubject = (subjectId, checked) => {
        setSubjectChoices(current => checked
            ? [...current.filter(item => Number(item.subject_id) !== Number(subjectId)), { subject_id: Number(subjectId), is_compulsory: true }]
            : current.filter(item => Number(item.subject_id) !== Number(subjectId)));
    };

    const toggleStudent = (id, checked) => setStudentIds(current =>
        checked ? [...new Set([...current, Number(id)])] : current.filter(value => value !== Number(id))
    );

    const selectedProgramme = programmes.find(item => String(item.id) === String(programmeId));

    return (
        <div className="space-y-6">
            <PageHeader title="Senior Academic Programmes" description="Set up Science, Commercial, Arts or any other programme your school offers, then assign each senior student their programme and subjects." />

            <Card className="app-surface p-5 sm:p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-slate-900">1. Select class and session</h2>
                    <p className="text-sm text-slate-500 mt-1">Programmes are configured separately for each senior class and academic session.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-sm font-medium">Senior class
                        <select value={classId} onChange={e => setClassId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2">
                            <option value="">Select senior class</option>
                            {seniorClasses.map(item => <option key={item.id} value={item.id}>{item.class_name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-medium">Academic session
                        <select value={sessionId} onChange={e => setSessionId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2">
                            <option value="">Select session</option>
                            {sessions.map(item => <option key={item.id} value={item.id}>{item.session_name}</option>)}
                        </select>
                    </label>
                </div>
            </Card>

            {classId && <Card className="app-surface p-5 sm:p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-slate-900">2. Create programmes for {seniorClasses.find(item => String(item.id) === classId)?.class_name}</h2>
                    <p className="text-sm text-slate-500 mt-1">Use your school's preferred programme names. Class arms remain separate from programmes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={programmeName} onChange={e => setProgrammeName(e.target.value)} placeholder="Programme name (e.g. Science)" className="rounded-md border border-slate-300 px-3 py-2" />
                    <input value={programmeCode} onChange={e => setProgrammeCode(e.target.value)} placeholder="Code (optional)" className="rounded-md border border-slate-300 px-3 py-2" />
                    <Button disabled={!programmeName.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>{createMutation.isPending ? "Creating..." : "Add programme"}</Button>
                </div>
                <input value={programmeDescription} onChange={e => setProgrammeDescription(e.target.value)} placeholder="Description (optional)" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                {programmesLoading ? <p className="text-sm text-slate-500">Loading programmes...</p> : programmes.length === 0 ? <p className="text-sm text-slate-500">No programmes created for this class yet.</p> : (
                    <div className="flex flex-wrap gap-2">
                        {programmes.map(item => <button type="button" key={item.id} onClick={() => setProgrammeId(String(item.id))} className={`rounded-full border px-4 py-2 text-sm ${String(item.id) === programmeId ? "border-blue-700 bg-blue-50 text-blue-800" : "border-slate-300 bg-white text-slate-700"}`}>{item.programme_name} ({item.subject_count} subjects)</button>)}
                    </div>
                )}
            </Card>}

            {selectedProgramme && <Card className="app-surface p-5 sm:p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-slate-900">3. Choose subjects for {selectedProgramme.programme_name}</h2>
                    <p className="text-sm text-slate-500 mt-1">Select the subjects students in this programme may take. Mark each as compulsory or elective.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subjects.map(subject => {
                        const selected = subjectChoices.find(item => Number(item.subject_id) === Number(subject.id));
                        return <div key={subject.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!selected} onChange={e => toggleSubject(subject.id, e.target.checked)} />{subject.subject_name}</label>
                            <label className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={selected?.is_compulsory ?? false} disabled={!selected} onChange={e => setSubjectChoices(current => current.map(item => Number(item.subject_id) === Number(subject.id) ? { ...item, is_compulsory: e.target.checked } : item))} />Compulsory</label>
                        </div>;
                    })}
                </div>
                <Button disabled={!subjectChoices.length || saveSubjectsMutation.isPending} onClick={() => saveSubjectsMutation.mutate()}>{saveSubjectsMutation.isPending ? "Saving..." : "Save programme subjects"}</Button>
            </Card>}

            {classId && sessionId && <Card className="app-surface p-5 sm:p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-slate-900">4. Assign students to a programme</h2>
                    <p className="text-sm text-slate-500 mt-1">Select students, choose a programme above, and assign the subjects they are registered to offer for this session.</p>
                </div>
                {!programmeId ? <p className="text-sm text-amber-700">Select a programme above first.</p> : !subjectChoices.length ? <p className="text-sm text-amber-700">Save at least one subject for this programme before assigning students.</p> : studentsLoading ? <p className="text-sm text-slate-500">Loading students...</p> : students.length === 0 ? <p className="text-sm text-slate-500">No active students found for this class and session.</p> : <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-600">{studentIds.length} student(s) selected</p>
                        <button type="button" className="text-sm text-blue-700 underline" onClick={() => setStudentIds(students.map(item => Number(item.id)))}>Select all students</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y rounded-md border border-slate-200">
                        {students.map(student => <label key={student.id} className="flex items-center gap-3 p-3 text-sm hover:bg-slate-50">
                            <input type="checkbox" checked={studentIds.includes(Number(student.id))} onChange={e => toggleStudent(student.id, e.target.checked)} />
                            <span className="min-w-0 flex-1">{student.surname} {student.first_name} {student.middle_name || ""}<span className="block text-xs text-slate-500">{student.admission_number} · {student.arm_name || "No arm"}{student.programme_name ? ` · Currently: ${student.programme_name}` : " · Programme not assigned"}</span></span>
                        </label>)}
                    </div>
                    <Button disabled={!studentIds.length || assignMutation.isPending} onClick={() => assignMutation.mutate()}>{assignMutation.isPending ? "Assigning..." : `Assign programme and subjects to ${studentIds.length} student(s)`}</Button>
                    <p className="text-xs text-slate-500">To protect existing academic records, the system will not replace programme/subject assignments for students who already have results in this session.</p>
                </>}
            </Card>}
        </div>
    );
}

export default AcademicProgrammesPage;
