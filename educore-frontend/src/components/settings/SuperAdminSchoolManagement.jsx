import { useEffect, useState } from "react";
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
    const { user } = useAuth();
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
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">EduCore School Management</h2>
                <p className="text-sm text-muted-foreground">
                    Platform-level management. Each school has its own administrator accounts and school data.
                </p>
            </div>

            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

            <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
                <h3 className="md:col-span-2 font-medium">Add New School</h3>

                <input className="rounded-md border p-2" name="school_name" value={form.school_name} onChange={handleChange} placeholder="School name *" required />
                <input className="rounded-md border p-2" name="admission_prefix" value={form.admission_prefix} onChange={handleChange} placeholder="Admission prefix * (e.g. SCH)" required />
                <input className="rounded-md border p-2" name="school_email" value={form.school_email} onChange={handleChange} placeholder="School email" type="email" />
                <input className="rounded-md border p-2" name="school_phone" value={form.school_phone} onChange={handleChange} placeholder="School phone" />
                <input className="rounded-md border p-2" name="school_motto" value={form.school_motto} onChange={handleChange} placeholder="School motto" />
                <input className="rounded-md border p-2" name="school_level" value={form.school_level} onChange={handleChange} placeholder="School level (e.g. Primary & Secondary)" />
                <textarea className="rounded-md border p-2 md:col-span-2" name="school_address" value={form.school_address} onChange={handleChange} placeholder="School address" rows="2" />

                <div className="md:col-span-2 border-t pt-4">
                    <h4 className="mb-3 font-medium">Initial School Administrator</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                        <input className="rounded-md border p-2" name="admin_username" value={form.admin_username} onChange={handleChange} placeholder="Username *" required />
                        <input className="rounded-md border p-2" name="admin_email" value={form.admin_email} onChange={handleChange} placeholder="Email" type="email" />
                        <input className="rounded-md border p-2" name="admin_password" value={form.admin_password} onChange={handleChange} placeholder="Temporary password *" type="password" minLength="6" required />
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
                        <input className="rounded-md border p-2" name="username" value={adminForm.username} onChange={handleAdminChange} placeholder="Username *" required />
                        <input className="rounded-md border p-2" name="email" value={adminForm.email} onChange={handleAdminChange} placeholder="Email" type="email" />
                        <input className="rounded-md border p-2" name="password" value={adminForm.password} onChange={handleAdminChange} placeholder="Temporary password *" type="password" minLength="6" required />
                        <select className="rounded-md border p-2" name="admin_type" value={adminForm.admin_type} onChange={handleAdminChange}>
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

            <div className="rounded-lg border">
                <div className="border-b p-4">
                    <h3 className="font-medium">Registered Schools</h3>
                </div>
                {loading ? (
                    <p className="p-4 text-sm text-muted-foreground">Loading schools...</p>
                ) : schools.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No schools found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">School</th>
                                    <th className="p-3 text-left">Prefix</th>
                                    <th className="p-3 text-left">Users</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools.map((school) => (
                                    <tr key={school.school_id} className="border-b last:border-0">
                                        <td className="p-3">{school.school_id}</td>
                                        <td className="p-3 font-medium">{school.school_name}</td>
                                        <td className="p-3">{school.admission_prefix}</td>
                                        <td className="p-3">{school.user_count}</td>
                                        <td className="p-3">{school.is_active ? "Active" : "Inactive"}</td>
                                        <td className="p-3">
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
