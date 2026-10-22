import { useMemo, useState } from "react";
import { Printer, Search, Users, CreditCard, AlertCircle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { getStudents } from "@/services/studentService";
import { useSchoolTheme } from "@/context/SchoolThemeContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const normalizeStudents = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.students)) return response.students;
    return [];
};

export default function StudentIdCardsPage() {
    const { settings, theme } = useSchoolTheme();
    const [search, setSearch] = useState("");
    const [classId, setClassId] = useState("");
    const [selected, setSelected] = useState([]);
    const [includeAll, setIncludeAll] = useState(false);
    const { data: studentsResponse, isLoading, error } = useQuery({
        queryKey: ["student-id-card-directory", search, classId, includeAll],
        queryFn: () => getStudents(search, 1, 500, classId, includeAll),
    });
    const students = useMemo(() => normalizeStudents(studentsResponse), [studentsResponse]);
    const visibleStudents = students.filter(student => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        return [student.first_name, student.last_name, student.middle_name, student.admission_number, student.admission_no]
            .filter(Boolean).some(value => String(value).toLowerCase().includes(term));
    });
    const chosen = visibleStudents.filter(student => selected.includes(String(student.id)));
    const logo = settings?.school_logo || settings?.school_logo_url || settings?.logo_url || settings?.logo || "";
    const schoolName = settings?.school_name || settings?.name || "School Name";
    const primary = theme?.primary || settings?.primary_color || "#1D4ED8";
    const getName = student => [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ") || student.full_name || student.name || "Student";
    const getAdmission = student => student.admission_number || student.admission_no || student.admissionNumber || "—";
    const getClass = student => student.class_name || student.className || student.class?.name || student.class || "—";
    const getPhoto = student => student.passport || student.passport_photo || student.photo_url || student.photo || student.profile_picture || "";

    const toggle = id => setSelected(current => current.includes(String(id)) ? current.filter(value => value !== String(id)) : [...current, String(id)]);
    const selectVisible = () => setSelected(current => {
        const visibleIds = visibleStudents.map(student => String(student.id));
        return visibleIds.every(id => current.includes(id))
            ? current.filter(id => !visibleIds.includes(id))
            : [...new Set([...current, ...visibleIds])];
    });

    const printCards = async () => {
        // QR verification is deliberately server-issued; do not create a client-side
        // QR from admission numbers or other student data.
        try {
            await api.post("/student-id-cards/issue", { studentIds: chosen.map(student => student.id) });
            window.print();
        } catch (issueError) {
            const message = issueError?.response?.data?.message || "Secure ID verification is not configured on the server yet. Cards have not been printed.";
            window.alert(message);
        }
    };

    return (
        <div className="space-y-5">
            <PageHeader title="Student ID Cards" description="Prepare school-branded student ID cards for individual students or a whole class." />
            <div className="app-surface p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary"><CreditCard className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-slate-900">Select students</h2>
                        <p className="text-sm text-slate-500">Choose one student or select a group. Cards use this school's branding and student records.</p>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <label className="relative block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or admission number" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm" />
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <input type="checkbox" checked={includeAll} onChange={event => setIncludeAll(event.target.checked)} />
                        Include inactive
                    </label>
                    <button type="button" onClick={selectVisible} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                        {visibleStudents.length && visibleStudents.every(student => selected.includes(String(student.id))) ? "Deselect visible" : "Select visible"}
                    </button>
                </div>
                {isLoading ? <p className="text-sm text-slate-500">Loading students…</p> : null}
                {error ? <p className="text-sm text-red-600">Unable to load student records. Please try again.</p> : null}
                {!isLoading && !error && visibleStudents.length === 0 ? <p className="text-sm text-slate-500">No students found for this search.</p> : null}
                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
                    {visibleStudents.map(student => (
                        <label key={student.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 last:border-b-0 hover:bg-slate-50">
                            <input type="checkbox" checked={selected.includes(String(student.id))} onChange={() => toggle(student.id)} />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-slate-800">{getName(student)}</span>
                                <span className="block text-xs text-slate-500">Admission: {getAdmission(student)} · Class: {getClass(student)}</span>
                            </span>
                        </label>
                    ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-600"><Users className="mr-1 inline h-4 w-4" /> {selected.length} student(s) selected</p>
                    <button type="button" disabled={!chosen.length} onClick={printCards} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{background:primary}}>
                        <Printer className="h-4 w-4" /> Generate / Print Cards
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                Secure QR issuance must be enabled by the server before printing. This screen will not encode admission numbers or private student details into a QR code.
            </div>

            <section className="id-card-print-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {chosen.map(student => (
                    <article key={student.id} className="student-id-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{'--id-primary': primary}}>
                        <header className="flex min-h-20 items-center gap-3 px-4 py-3 text-white" style={{background:primary}}>
                            {logo ? <img src={logo} alt="" className="h-12 w-12 shrink-0 rounded-md bg-white object-contain p-1" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/15"><CreditCard className="h-6 w-6" /></div>}
                            <div className="min-w-0"><p className="line-clamp-2 text-sm font-bold uppercase leading-tight">{schoolName}</p><p className="mt-1 text-[10px] font-semibold tracking-[.16em] text-white/85">STUDENT IDENTITY CARD</p></div>
                        </header>
                        <div className="flex gap-3 p-4">
                            {getPhoto(student) ? <img src={getPhoto(student)} alt="" className="h-28 w-22 shrink-0 rounded-md border border-slate-200 object-cover" /> : <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-300 text-center text-[10px] text-slate-400">Student<br/>photo</div>}
                            <div className="min-w-0 space-y-1 text-xs text-slate-700">
                                <p className="break-words text-sm font-bold leading-tight text-slate-900">{getName(student)}</p>
                                <p><strong>Admission No.</strong><br/>{getAdmission(student)}</p>
                                <p><strong>Class</strong>: {getClass(student)}</p>
                                <p><strong>Session</strong>: {settings?.academic_session || settings?.current_session || "—"}</p>
                            </div>
                        </div>
                        <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[10px] text-slate-500">
                            <span>{settings?.school_phone || settings?.phone || "School office"}</span>
                            <span className="rounded bg-slate-100 px-2 py-1 font-semibold">ID: {String(student.id).slice(-6)}</span>
                        </footer>
                    </article>
                ))}
            </section>
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    body * { visibility: hidden !important; }
                    .id-card-print-grid, .id-card-print-grid * { visibility: visible !important; }
                    .id-card-print-grid { display: grid !important; grid-template-columns: repeat(2, 85.6mm) !important; gap: 5mm !important; }
                    .student-id-card { width: 85.6mm !important; height: 53.98mm !important; border-radius: 2mm !important; box-shadow: none !important; break-inside: avoid !important; page-break-inside: avoid !important; overflow: hidden !important; }
                    .student-id-card header { min-height: 14mm !important; padding: 2mm 3mm !important; }
                    .student-id-card header img, .student-id-card header > div:first-child { width: 10mm !important; height: 10mm !important; }
                    .student-id-card header p:first-child { font-size: 7pt !important; }
                    .student-id-card header p:last-child { font-size: 5.5pt !important; }
                    .student-id-card > div { padding: 2.5mm 3mm !important; gap: 3mm !important; }
                    .student-id-card > div > img, .student-id-card > div > div:first-child { width: 18mm !important; height: 25mm !important; }
                    .student-id-card footer { padding: 1.5mm 3mm !important; font-size: 5.5pt !important; }
                    .student-id-card p { line-height: 1.15 !important; margin: 0 0 1mm !important; }
                    button, .app-surface, .id-card-page-header { display: none !important; }
                }
            `}</style>
        </div>
    );
}
