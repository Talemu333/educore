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
    const [assignmentSubjectIds, setAssignmentSubjectIds] = useState([]);
    const [correctionSubjectIds, setCorrectionSubjectIds] = useState([]);
    const [studentIds, setStudentIds] = useState([]);
    const [correctionStudentId, setCorrectionStudentId] = useState("");
    const [correctionProgrammeId, setCorrectionProgrammeId] = useState("");
    const [correctionPreview, setCorrectionPreview] = useState(false);

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
    const { data: correctionProgrammeSubjects = [] } = useQuery({
        queryKey: ["academic-programme-subjects", correctionProgrammeId],
        queryFn: async () => (await api.get(`/academic-programmes/${correctionProgrammeId}/subjects`)).data.data,
        enabled: !!correctionProgrammeId
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
        setAssignmentSubjectIds(programmeSubjects.filter(item => item.is_compulsory).map(item => Number(item.subject_id)));
    }, [programmeSubjects]);

    useEffect(() => {
        setCorrectionSubjectIds(correctionProgrammeSubjects.filter(item => item.is_compulsory).map(item => Number(item.subject_id)));
        setCorrectionPreview(false);
    }, [correctionProgrammeSubjects]);

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

    const correctionMutation = useMutation({
        mutationFn: async () => (await api.post("/academic-programmes/correct-student", {
            class_id: Number(classId),
            session_id: Number(sessionId),
            programme_id: Number(correctionProgrammeId),
            student_id: Number(correctionStudentId),
            subject_ids: correctionSubjectIds
        })).data,
        onSuccess: response => {
            toast.success(response.data?.message || "Student programme corrected.");
            setCorrectionStudentId("");
            setCorrectionProgrammeId("");
            setCorrectionPreview(false);
            queryClient.invalidateQueries({ queryKey: ["programme-students", classId, sessionId] });
        },
        onError: error => toast.error(error.response?.data?.message || "Could not correct this student's programme.")
    });

    const assignMutation = useMutation({
        mutationFn: async () => (await api.post("/academic-programmes/assign-students", {
            class_id: Number(classId),
            session_id: Number(sessionId),
            programme_id: Number(programmeId),
            student_ids: studentIds,
            subject_ids: assignmentSubjectIds
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
            ? [...current.filter(item => Number(item.subject_id) !== Number(subjectId)), { subject_id: Number(subjectId), is_compulsory: false }]
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
                    <p className="text-sm text-slate-500 mt-1">Select the subjects students in this programme may take. Newly added subjects are electives by default; tick “Compulsory” only for subjects every student in the programme must offer.</p>
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

            {correctionStudentId && <Card className="app-surface border-amber-200 p-5 sm:p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-slate-900">Correct this student's programme and subjects</h2>
                    <p className="text-sm text-slate-600 mt-1">Choose the student's correct programme here. This choice is independent of the programme selected for ordinary group assignment. Existing scores, grades, examination attempts and result records will remain unchanged.</p>
                </div>
                {(() => {
                    const student = students.find(item => String(item.id) === String(correctionStudentId));
                    return <p className="text-sm font-medium">{student ? `${student.surname} ${student.first_name} ${student.middle_name || ""} · ${student.admission_number}` : "Selected student"}</p>;
                })()}
                <label className="block text-sm font-medium">Correct programme
                    <select value={correctionProgrammeId} onChange={e => { setCorrectionProgrammeId(e.target.value); setCorrectionSubjectIds([]); setCorrectionPreview(false); }} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2">
                        <option value="">Select the student's correct programme</option>
                        {programmes.map(item => <option key={item.id} value={item.id}>{item.programme_name}</option>)}
                    </select>
                </label>
                {!correctionProgrammeId ? <p className="text-sm text-amber-700">Select the correct programme to load its subjects.</p> : correctionProgrammeSubjects.length === 0 ? <p className="text-sm text-amber-700">No active subjects are configured for this programme. Configure and save its subjects in section 3 first.</p> : <>
                    <div className="rounded-md border border-slate-200 p-3 space-y-2">
                        <p className="text-sm font-medium">Select this student's subjects</p>
                        <p className="text-xs text-slate-500">Compulsory subjects are selected automatically. Tick only the electives this student actually offers.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {correctionProgrammeSubjects.map(subject => <label key={subject.subject_id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={correctionSubjectIds.includes(Number(subject.subject_id))} disabled={subject.is_compulsory} onChange={e => setCorrectionSubjectIds(current => e.target.checked ? [...new Set([...current, Number(subject.subject_id)])] : current.filter(id => id !== Number(subject.subject_id)))} />
                                {subject.subject_name}{subject.is_compulsory ? " (Compulsory)" : " (Elective)"}
                            </label>)}
                        </div>
                    </div>
                    {!correctionPreview ? <div className="flex gap-2">
                        <Button disabled={!correctionSubjectIds.length} onClick={() => setCorrectionPreview(true)}>Preview correction</Button>
                        <Button variant="outline" onClick={() => { setCorrectionStudentId(""); setCorrectionProgrammeId(""); setCorrectionPreview(false); }}>Cancel</Button>
                    </div> : <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-3">
                        <p className="text-sm font-semibold text-amber-900">Confirm this correction</p>
                        <p className="text-sm text-amber-900">The student's current programme and subject registrations will be retained as ended records. The new programme and selected subjects will become active for this session. Historical results and examination attempts will not be changed or deleted.</p>
                        <p className="text-sm text-amber-900">New programme: {programmes.find(item => String(item.id) === String(correctionProgrammeId))?.programme_name}</p>
                        <p className="text-sm text-amber-900">New subjects: {correctionProgrammeSubjects.filter(item => correctionSubjectIds.includes(Number(item.subject_id))).map(item => item.subject_name).join(", ")}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button disabled={correctionMutation.isPending} onClick={() => correctionMutation.mutate()}>{correctionMutation.isPending ? "Applying correction..." : "Confirm and apply correction"}</Button>
                            <Button variant="outline" onClick={() => setCorrectionPreview(false)}>Back to edit</Button>
                            <Button variant="outline" onClick={() => { setCorrectionStudentId(""); setCorrectionProgrammeId(""); setCorrectionPreview(false); }}>Cancel</Button>
                        </div>
                    </div>}
                </>}
            </Card>}

            {classId && sessionId && <Card className="app-surface p-5 sm:p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-slate-900">4. Assign students to a programme</h2>
                    <p className="text-sm text-slate-500 mt-1">Select students, choose a programme above, and assign the subjects they are registered to offer for this session.</p>
                </div>
                {!programmeId ? <p className="text-sm text-amber-700">Select a programme above first.</p> : !subjectChoices.length ? <p className="text-sm text-amber-700">Save at least one subject for this programme before assigning students.</p> : studentsLoading ? <p className="text-sm text-slate-500">Loading students...</p> : students.length === 0 ? <p className="text-sm text-slate-500">No active students found for this class and session.</p> : <>
                    <div className="rounded-md border border-blue-100 bg-blue-50/60 p-3 space-y-2">
                        <p className="text-sm font-medium text-slate-800">Choose this student group’s subject combination</p>
                        <p className="text-xs text-slate-600">Compulsory subjects are preselected and locked. Tick the electives this group should take. If every subject is locked but that is not intended, return to section 3, untick “Compulsory” for the relevant subjects, and save the programme subjects. Students with different elective combinations should be assigned separately. Students who already have results must use the separate correction workflow.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {programmeSubjects.map(subject => <label key={subject.subject_id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={assignmentSubjectIds.includes(Number(subject.subject_id))} disabled={subject.is_compulsory} onChange={e => setAssignmentSubjectIds(current => e.target.checked ? [...new Set([...current, Number(subject.subject_id)])] : current.filter(id => id !== Number(subject.subject_id)))} />
                                <span>{subject.subject_name}{subject.is_compulsory ? " (Compulsory)" : " (Elective)"}</span>
                            </label>)}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-600">{studentIds.length} student(s) selected</p>
                        <button type="button" className="text-sm text-blue-700 underline" onClick={() => setStudentIds(students.filter(item => !item.has_results).map(item => Number(item.id)))}>Select all students</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y rounded-md border border-slate-200">
                        {students.map(student => <div key={student.id} className="flex items-center gap-3 p-3 text-sm hover:bg-slate-50">
                            <input aria-label={`Select ${student.surname} ${student.first_name}`} type="checkbox" checked={studentIds.includes(Number(student.id))} disabled={student.has_results} onChange={e => toggleStudent(student.id, e.target.checked)} />
                            <span className="min-w-0 flex-1">{student.surname} {student.first_name} {student.middle_name || ""}<span className="block text-xs text-slate-500">{student.admission_number} · {student.arm_name || "No arm"}{student.programme_name ? ` · Currently: ${student.programme_name}` : " · Programme not assigned"}{student.has_results ? " · Has results (use correction)" : ""}</span></span>{student.has_results && <button type="button" className="shrink-0 cursor-pointer text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900" onClick={() => { setCorrectionStudentId(String(student.id)); setCorrectionProgrammeId(student.programme_id ? String(student.programme_id) : ""); setCorrectionPreview(false); setStudentIds([]); }}>Correct programme</button>}
                        </div>)}
                    </div>
                    <Button disabled={!studentIds.length || !assignmentSubjectIds.length || assignMutation.isPending} onClick={() => assignMutation.mutate()}>{assignMutation.isPending ? "Assigning..." : `Assign programme and subjects to ${studentIds.length} student(s)`}</Button>
                    <p className="text-xs text-slate-500">To protect existing academic records, the system will not replace programme/subject assignments for students who already have results in this session.</p>
                </>}
            </Card>}
        </div>
    );
}

export default AcademicProgrammesPage;
