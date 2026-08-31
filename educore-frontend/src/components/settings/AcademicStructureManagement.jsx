import { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import { getClasses } from "@/api/classApi";
import { getArms } from "@/api/armApi";
import { saveClassSubjects, getClassSubjects } from "@/api/classSubjectApi";
import { Card } from "@/components/ui/Card";

const emptyClass = { class_name: "", class_level: "Primary", sort_order: "" };
const emptyArm = { class_id: "", arm_name: "" };
const emptySubject = { subject_name: "", subject_code: "", is_core: true };

function messageFromError(error, fallback) {
    return error?.response?.data?.message || error?.message || fallback;
}

function AcademicStructureManagement() {
    const [classes, setClasses] = useState([]);
    const [arms, setArms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [classSubjects, setClassSubjects] = useState([]);
    const [assignment, setAssignment] = useState({});
    const [classForm, setClassForm] = useState(emptyClass);
    const [armForm, setArmForm] = useState(emptyArm);
    const [subjectForm, setSubjectForm] = useState(emptySubject);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState({ type: "", text: "" });

    const selectedClassObject = useMemo(
        () => classes.find((item) => String(item.id) === String(selectedClass)),
        [classes, selectedClass]
    );

    const loadStructure = async () => {
        setLoading(true);
        try {
            const [classRows, armRows, subjectResponse] = await Promise.all([
                getClasses(),
                getArms(),
                api.get("/subjects")
            ]);
            setClasses(classRows || []);
            setArms(armRows || []);
            setSubjects(subjectResponse.data?.data || []);
        } catch (error) {
            setNotice({ type: "error", text: messageFromError(error, "Failed to load academic structure.") });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStructure();
    }, []);

    useEffect(() => {
        if (!selectedClass) {
            setClassSubjects([]);
            setAssignment({});
            return;
        }

        const loadAssignments = async () => {
            try {
                const rows = await getClassSubjects(selectedClass);
                setClassSubjects(rows || []);
                const next = {};
                (rows || []).forEach((row) => {
                    next[row.subject_id] = Boolean(row.is_compulsory);
                });
                setAssignment(next);
            } catch (error) {
                setNotice({ type: "error", text: messageFromError(error, "Failed to load class subjects.") });
            }
        };

        loadAssignments();
    }, [selectedClass]);

    const submitClass = async (event) => {
        event.preventDefault();
        setSaving(true);
        setNotice({ type: "", text: "" });
        try {
            await api.post("/classes", {
                ...classForm,
                sort_order: Number(classForm.sort_order)
            });
            setClassForm(emptyClass);
            await loadStructure();
            setNotice({ type: "success", text: "Class created successfully." });
        } catch (error) {
            setNotice({ type: "error", text: messageFromError(error, "Failed to create class.") });
        } finally {
            setSaving(false);
        }
    };

    const submitArm = async (event) => {
        event.preventDefault();
        setSaving(true);
        setNotice({ type: "", text: "" });
        try {
            await api.post("/arms", {
                class_id: Number(armForm.class_id),
                arm_name: armForm.arm_name.trim()
            });
            setArmForm(emptyArm);
            await loadStructure();
            setNotice({ type: "success", text: "Arm created successfully." });
        } catch (error) {
            setNotice({ type: "error", text: messageFromError(error, "Failed to create arm.") });
        } finally {
            setSaving(false);
        }
    };

    const submitSubject = async (event) => {
        event.preventDefault();
        setSaving(true);
        setNotice({ type: "", text: "" });
        try {
            await api.post("/subjects", {
                subject_name: subjectForm.subject_name.trim(),
                subject_code: subjectForm.subject_code.trim().toUpperCase(),
                is_core: Boolean(subjectForm.is_core)
            });
            setSubjectForm(emptySubject);
            await loadStructure();
            setNotice({ type: "success", text: "Subject created successfully." });
        } catch (error) {
            setNotice({ type: "error", text: messageFromError(error, "Failed to create subject.") });
        } finally {
            setSaving(false);
        }
    };

    const saveAssignments = async () => {
        if (!selectedClass) return;
        setSaving(true);
        setNotice({ type: "", text: "" });
        try {
            const selectedSubjects = subjects
                .filter((subject) => Object.prototype.hasOwnProperty.call(assignment, subject.id))
                .map((subject) => ({
                    subject_id: Number(subject.id),
                    is_compulsory: Boolean(assignment[subject.id])
                }));

            const rows = await saveClassSubjects({
                class_id: Number(selectedClass),
                subjects: selectedSubjects
            });
            setClassSubjects(rows || []);
            setNotice({ type: "success", text: "Class subjects saved successfully." });
        } catch (error) {
            setNotice({ type: "error", text: messageFromError(error, "Failed to save class subjects.") });
        } finally {
            setSaving(false);
        }
    };

    const armsForClass = arms.filter((arm) => String(arm.class_id) === String(selectedClass));

    return (
        <section className="mt-6 space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Academic Structure</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create the classes, arms and subjects used by this school. All records are automatically saved under the currently logged-in school.
                </p>
            </div>

            {notice.text && (
                <div className={`rounded-lg border p-3 text-sm ${notice.type === "error" ? "border-red-300 bg-red-50 text-red-700" : "border-green-300 bg-green-50 text-green-700"}`}>
                    {notice.text}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-5">
                    <h3 className="mb-4 font-semibold">Create Class</h3>
                    <form onSubmit={submitClass} className="space-y-3">
                        <input
                            className="w-full rounded-md border px-3 py-2"
                            placeholder="Class name e.g. Primary 1"
                            value={classForm.class_name}
                            onChange={(e) => setClassForm({ ...classForm, class_name: e.target.value })}
                            required
                        />
                        <select
                            className="w-full rounded-md border px-3 py-2"
                            value={classForm.class_level}
                            onChange={(e) => setClassForm({ ...classForm, class_level: e.target.value })}
                        >
                            <option value="Nursery">Nursery</option>
                            <option value="Primary">Primary</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                        </select>
                        <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border px-3 py-2"
                            placeholder="Sort order e.g. 1"
                            value={classForm.sort_order}
                            onChange={(e) => setClassForm({ ...classForm, sort_order: e.target.value })}
                            required
                        />
                        <button disabled={saving} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">
                            {saving ? "Saving..." : "Add Class"}
                        </button>
                    </form>
                </Card>

                <Card className="p-5">
                    <h3 className="mb-4 font-semibold">Create Arm</h3>
                    <form onSubmit={submitArm} className="space-y-3">
                        <select
                            className="w-full rounded-md border px-3 py-2"
                            value={armForm.class_id}
                            onChange={(e) => setArmForm({ ...armForm, class_id: e.target.value })}
                            required
                        >
                            <option value="">Select class</option>
                            {classes.map((item) => <option key={item.id} value={item.id}>{item.class_name}</option>)}
                        </select>
                        <input
                            className="w-full rounded-md border px-3 py-2"
                            placeholder="Arm name e.g. A"
                            value={armForm.arm_name}
                            onChange={(e) => setArmForm({ ...armForm, arm_name: e.target.value })}
                            required
                        />
                        <button disabled={saving || !classes.length} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">
                            {saving ? "Saving..." : "Add Arm"}
                        </button>
                    </form>
                </Card>

                <Card className="p-5">
                    <h3 className="mb-4 font-semibold">Create Subject</h3>
                    <form onSubmit={submitSubject} className="space-y-3">
                        <input
                            className="w-full rounded-md border px-3 py-2"
                            placeholder="Subject name e.g. Mathematics"
                            value={subjectForm.subject_name}
                            onChange={(e) => setSubjectForm({ ...subjectForm, subject_name: e.target.value })}
                            required
                        />
                        <input
                            className="w-full rounded-md border px-3 py-2"
                            placeholder="Code e.g. MTH"
                            value={subjectForm.subject_code}
                            onChange={(e) => setSubjectForm({ ...subjectForm, subject_code: e.target.value })}
                            required
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={subjectForm.is_core}
                                onChange={(e) => setSubjectForm({ ...subjectForm, is_core: e.target.checked })}
                            />
                            Core subject
                        </label>
                        <button disabled={saving} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">
                            {saving ? "Saving..." : "Add Subject"}
                        </button>
                    </form>
                </Card>
            </div>

            <Card className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="font-semibold">Classes and Arms</h3>
                        <p className="text-sm text-muted-foreground">{loading ? "Loading..." : `${classes.length} classes, ${arms.length} arms`}</p>
                    </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b text-left"><th className="p-2">Class</th><th className="p-2">Level</th><th className="p-2">Arms</th></tr></thead>
                        <tbody>
                            {classes.map((item) => {
                                const itemArms = arms.filter((arm) => String(arm.class_id) === String(item.id));
                                return <tr key={item.id} className="border-b"><td className="p-2 font-medium">{item.class_name}</td><td className="p-2">{item.class_level}</td><td className="p-2">{itemArms.length ? itemArms.map((arm) => arm.arm_name).join(", ") : "No arms"}</td></tr>;
                            })}
                            {!classes.length && <tr><td colSpan="3" className="p-4 text-center text-muted-foreground">No classes created yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card className="p-5">
                <h3 className="font-semibold">Assign Subjects to Class</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
                    <div className="space-y-3">
                        <select className="w-full rounded-md border px-3 py-2" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option value="">Select class</option>
                            {classes.map((item) => <option key={item.id} value={item.id}>{item.class_name}</option>)}
                        </select>
                        {selectedClassObject && <div className="rounded-md border p-3 text-sm"><div className="font-medium">{selectedClassObject.class_name}</div><div className="text-muted-foreground">Arms: {armsForClass.length ? armsForClass.map((arm) => arm.arm_name).join(", ") : "None"}</div></div>}
                    </div>
                    <div>
                        {!selectedClass ? (
                            <p className="text-sm text-muted-foreground">Select a class to manage its subjects.</p>
                        ) : !subjects.length ? (
                            <p className="text-sm text-muted-foreground">Create subjects first.</p>
                        ) : (
                            <div className="space-y-2">
                                {subjects.map((subject) => {
                                    const checked = Object.prototype.hasOwnProperty.call(assignment, subject.id);
                                    return <label key={subject.id} className="flex items-center justify-between rounded-md border p-3">
                                        <span><span className="font-medium">{subject.subject_name}</span><span className="ml-2 text-xs text-muted-foreground">{subject.subject_code}</span></span>
                                        <span className="flex items-center gap-3 text-sm"><label className="flex items-center gap-1"><input type="checkbox" checked={checked} onChange={(e) => { const next = { ...assignment }; if (e.target.checked) next[subject.id] = true; else delete next[subject.id]; setAssignment(next); }} /> Assigned</label>{checked && <label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(assignment[subject.id])} onChange={(e) => setAssignment({ ...assignment, [subject.id]: e.target.checked })} /> Compulsory</label>}</span>
                                    </label>;
                                })}
                                <button disabled={saving} onClick={saveAssignments} className="mt-3 rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">{saving ? "Saving..." : "Save Class Subjects"}</button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {classSubjects.length > 0 && selectedClassObject && (
                <p className="text-xs text-muted-foreground">{selectedClassObject.class_name} currently has {classSubjects.length} assigned subject(s).</p>
            )}
        </section>
    );
}

export default AcademicStructureManagement;
