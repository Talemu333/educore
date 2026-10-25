import { useEffect, useMemo, useState } from "react";
import { Building2, GraduationCap, Users, UserRound, Search, RotateCcw, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    getSchools,
    createSchool,
    createSchoolAdministrator,
    setSchoolStatus
} from "@/services/superAdminSchoolService";

const initialForm = {
    school_name: "",
    admission_prefix: "",
    school_email: "",
    school_phone: "",
    school_address: "",
    school_motto: "",
    school_level: "",
    admin_username: "",
    admin_email: "",
    admin_password: ""
};

const initialAdminForm = {
    username: "",
    email: "",
    password: "",
    admin_type: "proprietor"
};

function SuperAdminSchoolManagement() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adminSaving, setAdminSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState(initialForm);
    const [adminSchool, setAdminSchool] = useState(null);
    const [adminForm, setAdminForm] = useState(initialAdminForm);
    const [schoolSearch, setSchoolSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const filteredSchools = useMemo(() => schools.filter((school) => {
        const term = schoolSearch.trim().toLowerCase();
        const matchesSearch = !term || [school.school_name, school.school_id, school.admission_prefix, school.domain].some((value) => String(value ?? "").toLowerCase().includes(term));
        const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? Boolean(school.is_active) : !school.is_active);
        return matchesSearch && matchesStatus;
    }), [schools, schoolSearch, statusFilter]);
    const totals = useMemo(() => schools.reduce((acc, school) => ({ students: acc.students + Number(school.student_count || 0), teachers: acc.teachers + Number(school.teacher_count || 0), admins: acc.admins + Number(school.admin_count || 0), parents: acc.parents + Number(school.parent_count || 0) }), { students: 0, teachers: 0, admins: 0, parents: 0 }), [schools]);

    const isSuperAdmin = user?.role_name === "Super Admin";

    const loadSchools = async () => {
        setLoading(true);
        try {
            const response = await getSchools();
            setSchools(response?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load schools.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) loadSchools();
    }, [isSuperAdmin]);

    if (!isSuperAdmin) return null;

    const handleLogout = async () => {
        await logoutUser();
        navigate("/", { replace: true });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleAdminChange = (event) => {
        const { name, value } = event.target;
        setAdminForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            await createSchool({
                school: {
                    school_name: form.school_name,
                    admission_prefix: form.admission_prefix,
                    school_email: form.school_email,
                    school_phone: form.school_phone,
                    school_address: form.school_address,
                    school_motto: form.school_motto,
                    school_level: form.school_level
                },
                admin: {
                    username: form.admin_username,
                    email: form.admin_email,
                    password: form.admin_password
                }
            });
            setForm(initialForm);
            setSuccess("School and initial proprietor account created successfully.");
            await loadSchools();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to create school.");
        } finally {
            setSaving(false);
        }
    };

    const openAdminForm = (school) => {
        setError("");
        setSuccess("");
        setAdminSchool(school);
        setAdminForm(initialAdminForm);
    };

    const closeAdminForm = () => {
        setAdminSchool(null);
        setAdminForm(initialAdminForm);
    };

    const handleCreateAdministrator = async (event) => {
        event.preventDefault();
        if (!adminSchool) return;
        setError("");
        setSuccess("");
        setAdminSaving(true);
        try {
            await createSchoolAdministrator(adminSchool.school_id, adminForm);
            setSuccess(`Administrator account created for ${adminSchool.school_name}.`);
            closeAdminForm();
            await loadSchools();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to create administrator account.");
        } finally {
            setAdminSaving(false);
        }
    };

    const toggleStatus = async (school) => {
        setError("");
        setSuccess("");
        try {
            await setSchoolStatus(school.school_id, !school.is_active);
            setSuccess(`School ${school.is_active ? "deactivated" : "activated"} successfully.`);
            await loadSchools();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update school status.");
        }
    };

    return (
        <section className="space-y-6 text-slate-800">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Super Admin Dashboard</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage registered schools, monitor platform usage, and administer each school securely.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all duration-200 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-2 active:scale-[0.98]"
                >
                    <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Logout
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4"><div className="rounded-full bg-blue-600 p-3 text-white"><Building2 className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Total Schools</p><p className="mt-1 text-2xl font-bold text-slate-900">{schools.length}</p></div></div>
                <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/70 p-4"><div className="rounded-full bg-teal-600 p-3 text-white"><GraduationCap className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Total Students</p><p className="mt-1 text-2xl font-bold text-slate-900">{totals.students.toLocaleString()}</p></div></div>
                <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50/70 p-4"><div className="rounded-full bg-violet-600 p-3 text-white"><Users className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Total Teachers</p><p className="mt-1 text-2xl font-bold text-slate-900">{totals.teachers.toLocaleString()}</p></div></div>
                <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/70 p-4"><div className="rounded-full bg-orange-500 p-3 text-white"><UserRound className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-orange-800">Total Admins</p><p className="mt-1 text-2xl font-bold text-slate-900">{totals.admins.toLocaleString()}</p></div></div>
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4"><div className="rounded-full bg-rose-500 p-3 text-white"><Users className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-rose-800">Total Parents</p><p className="mt-1 text-2xl font-bold text-slate-900">{totals.parents.toLocaleString()}</p></div></div>
            </div>
            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

            <form id="eduprow-add-school" onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-slate-300 bg-white p-5 shadow-sm md:grid-cols-2">
                <h3 className="md:col-span-2 font-medium">Add New School</h3>

                <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="school_name" value={form.school_name} onChange={handleChange} placeholder="School name *" required />
                <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="admission_prefix" value={form.admission_prefix} onChange={handleChange} placeholder="Admission prefix * (e.g. SCH)" required />
                <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="school_email" value={form.school_email} onChange={handleChange} placeholder="School email" type="email" />
                <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="school_phone" value={form.school_phone} onChange={handleChange} placeholder="School phone" />
                <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="school_motto" value={form.school_motto} onChange={handleChange} placeholder="School motto" />
                <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="school_level" value={form.school_level} onChange={handleChange} placeholder="School level (e.g. Primary & Secondary)" />
                <textarea className="rounded-md border p-2 md:col-span-2" name="school_address" value={form.school_address} onChange={handleChange} placeholder="School address" rows="2" />

                <div className="md:col-span-2 border-t pt-4">
                    <h4 className="mb-3 font-medium">Initial School Administrator</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                        <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="admin_username" value={form.admin_username} onChange={handleChange} placeholder="Username *" required />
                        <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="admin_email" value={form.admin_email} onChange={handleChange} placeholder="Email" type="email" />
                        <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="admin_password" value={form.admin_password} onChange={handleChange} placeholder="Temporary password *" type="password" minLength="6" required />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        The account is created as a proprietor and must change its password on first login.
                    </p>
                </div>

                <button disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 md:w-fit">
                    {saving ? "Creating..." : "Create School"}
                </button>
            </form>

            {adminSchool && (
                <form onSubmit={handleCreateAdministrator} className="grid gap-4 rounded-lg border bg-muted/20 p-4">
                    <div>
                        <h3 className="font-medium">Create School Administrator</h3>
                        <p className="text-sm text-muted-foreground">
                            School: <strong>{adminSchool.school_name}</strong> (ID {adminSchool.school_id})
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="username" value={adminForm.username} onChange={handleAdminChange} placeholder="Username *" required />
                        <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="email" value={adminForm.email} onChange={handleAdminChange} placeholder="Email" type="email" />
                        <input className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="password" value={adminForm.password} onChange={handleAdminChange} placeholder="Temporary password *" type="password" minLength="6" required />
                        <select className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="admin_type" value={adminForm.admin_type} onChange={handleAdminChange}>
                            <option value="proprietor">Proprietor</option>
                            <option value="principal">Principal</option>
                            <option value="vice_principal">Vice Principal</option>
                            <option value="bursar">Bursar</option>
                            <option value="librarian">Librarian</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={adminSaving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                            {adminSaving ? "Creating..." : "Create Administrator"}
                        </button>
                        <button type="button" onClick={closeAdminForm} className="rounded-md border px-4 py-2 text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                <div className="border-b border-slate-300 bg-white p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><h3 className="text-lg font-semibold text-slate-900">Registered Schools</h3><p className="mt-1 text-sm text-slate-500">Search, review school usage, and manage school access.</p></div><button type="button" onClick={loadSchools} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Refresh</button></div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[minmax(240px,1fr)_200px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={schoolSearch} onChange={(event) => setSchoolSearch(event.target.value)} placeholder="Search by school name, domain, prefix or ID..." className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="all">All statuses</option><option value="active">Active schools</option><option value="inactive">Inactive schools</option></select></div>
                </div>
                {loading ? (
                    <p className="p-4 text-sm text-muted-foreground">Loading schools...</p>
                ) : schools.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No schools found.</p>
                ) : (
                    <div className="max-w-full overflow-x-auto overscroll-x-contain" role="region" aria-label="Registered schools and registration counts" tabIndex={0}>
                        <p className="sticky left-0 w-fit px-3 py-2 text-xs text-muted-foreground md:hidden">Swipe horizontally to view all registration and limit columns →</p>
                        <table className="w-max min-w-[1900px] border-collapse text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="border border-slate-300 p-3 text-left">ID</th>
                                    <th className="border border-slate-300 p-3 text-left">School</th>
                                    <th className="border border-slate-300 p-3 text-left">Prefix</th>
                                    <th className="border border-slate-300 p-3 text-left">Registered Students</th>
                                    <th className="border border-slate-300 p-3 text-left">Students (Active / Inactive)</th>
                                    <th className="border border-slate-300 p-3 text-left">Agreed Limit</th>
                                    <th className="border border-slate-300 p-3 text-left">Limit Status</th>
                                    <th className="border border-slate-300 p-3 text-left">Registered Teachers</th>
                                    <th className="border border-slate-300 p-3 text-left">Teachers (Active / Inactive)</th>
                                    <th className="border border-slate-300 p-3 text-left">Registered Admins</th>
                                    <th className="border border-slate-300 p-3 text-left">Admins (Active / Inactive)</th>
                                    <th className="border border-slate-300 p-3 text-left">Registered Parents</th>
                                    <th className="border border-slate-300 p-3 text-left">Parents (Active / Inactive)</th>
                                    <th className="border border-slate-300 p-3 text-left">Status</th>
                                    <th className="border border-slate-300 p-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchools.map((school) => (
                                    <tr key={school.school_id} className="transition-colors hover:bg-blue-50/60">
                                        <td className="border border-slate-300 p-3">{school.school_id}</td>
                                        <td className="border border-slate-300 p-3 font-medium">{school.school_name}</td>
                                        <td className="border border-slate-300 p-3">{school.admission_prefix}</td>
                                        <td className="border border-slate-300 p-3">{school.student_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.active_student_count ?? "—"} / {school.inactive_student_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.agreed_student_limit ?? "Not set"}</td>
                                        <td className="border border-slate-300 p-3">{school.agreed_student_limit == null || school.student_count == null ? "—" : Number(school.student_count) > Number(school.agreed_student_limit) ? `Exceeded by ${Number(school.student_count) - Number(school.agreed_student_limit)}` : `${Number(school.agreed_student_limit) - Number(school.student_count)} remaining`}</td>
                                        <td className="border border-slate-300 p-3">{school.teacher_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.active_teacher_count ?? "—"} / {school.inactive_teacher_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.admin_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.active_admin_count ?? "—"} / {school.inactive_admin_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.parent_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.active_parent_count ?? "—"} / {school.inactive_parent_count ?? "—"}</td>
                                        <td className="border border-slate-300 p-3">{school.is_active ? "Active" : "Inactive"}</td>
                                        <td className="border border-slate-300 p-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button type="button" onClick={() => navigate(`/settings?schoolId=${school.school_id}`)} className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">
                                                    Manage
                                                </button>
                                                <button type="button" onClick={() => openAdminForm(school)} className="rounded-md border px-3 py-1.5">
                                                    Add Admin
                                                </button>
                                                <button type="button" onClick={() => toggleStatus(school)} className="rounded-md border px-3 py-1.5">
                                                    {school.is_active ? "Deactivate" : "Activate"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default SuperAdminSchoolManagement;
