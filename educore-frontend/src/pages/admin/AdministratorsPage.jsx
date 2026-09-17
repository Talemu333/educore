import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, KeyRound, Plus, ShieldCheck, ShieldOff } from "lucide-react";

import api from "@/api/axios";
import { useAdministrators } from "@/hooks/useAdministrators";
import { useCreateAdministrator } from "@/hooks/useCreateAdministrator";
import { useActivateAdministrator } from "@/hooks/useActivateAdministrator";
import { useDeactivateAdministrator } from "@/hooks/useDeactivateAdministrator";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/Button";

function AdministratorsPage() {
    const { data: administrators = [], isLoading } = useAdministrators();
    const { mutate: createAdministrator, isPending: isCreating } = useCreateAdministrator();
    const { mutate: activateAdministrator, isPending: isActivating } = useActivateAdministrator();
    const { mutate: deactivateAdministrator, isPending: isDeactivating } = useDeactivateAdministrator();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        admin_type: "principal"
    });

    const resetForm = () => {
        setFormData({ username: "", email: "", admin_type: "principal" });
    };

    const copyCredentials = async (username, password) => {
        try {
            await navigator.clipboard.writeText(`Username: ${username}\nTemporary Password: ${password}`);
            toast.success("Credentials copied.");
        } catch {
            toast.error("Unable to copy credentials.");
        }
    };

    const handleCreate = (event) => {
        event.preventDefault();
        if (!formData.username.trim()) {
            toast.error("Username is required.");
            return;
        }

        createAdministrator(
            {
                username: formData.username.trim(),
                email: formData.email.trim() || null,
                admin_type: formData.admin_type
            },
            {
                onSuccess: (administrator) => {
                    setCredentials({
                        username: administrator.username,
                        password: administrator.temporary_password
                    });
                    toast.success("Administrator account created successfully.");
                    resetForm();
                    setShowCreateForm(false);
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || "Failed to create administrator.");
                }
            }
        );
    };

    const handleResetPassword = async (administrator) => {
        const confirmed = window.confirm(
            `Generate a new temporary password for ${administrator.username}? Their current password will stop working.`
        );
        if (!confirmed) return;

        setSelectedAdminId(administrator.id);
        try {
            const response = await api.post(`/auth/admin-reset-password/${administrator.id}`);
            const data = response.data?.data;
            setCredentials({
                username: data.username,
                password: data.temporary_password
            });
            toast.success("New temporary password generated.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
        } finally {
            setSelectedAdminId(null);
        }
    };

    const handleActivate = (administrator) => {
        setSelectedAdminId(administrator.id);
        activateAdministrator(administrator.id, {
            onSuccess: () => {
                toast.success(`${administrator.username} has been activated.`);
                setSelectedAdminId(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to activate administrator.");
                setSelectedAdminId(null);
            }
        });
    };

    const handleDeactivate = (administrator) => {
        if (!window.confirm(`Are you sure you want to deactivate ${administrator.username}?`)) return;
        setSelectedAdminId(administrator.id);
        deactivateAdministrator(administrator.id, {
            onSuccess: () => {
                toast.success(`${administrator.username} has been deactivated.`);
                setSelectedAdminId(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to deactivate administrator.");
                setSelectedAdminId(null);
            }
        });
    };

    const formatAdminType = (value) =>
        value
            ? value.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
            : "—";

    if (isLoading) return <Loading message="Loading administrators..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Administrators</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage school administrator accounts.</p>
                </div>
                <Button type="button" onClick={() => setShowCreateForm((value) => !value)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Administrator
                </Button>
            </div>

            {credentials && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-emerald-950">Login credentials</h2>
                            <p className="mt-1 text-sm text-emerald-800">
                                Give these credentials to the administrator. The temporary password should be changed after the first login.
                            </p>
                            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                <div className="rounded-lg border border-emerald-200 bg-white p-3">
                                    <span className="block text-xs text-slate-500">Username</span>
                                    <span className="font-semibold text-slate-900">{credentials.username}</span>
                                </div>
                                <div className="rounded-lg border border-emerald-200 bg-white p-3">
                                    <span className="block text-xs text-slate-500">Temporary Password</span>
                                    <span className="font-mono font-semibold text-slate-900">{credentials.password}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => copyCredentials(credentials.username, credentials.password)}>
                                <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setCredentials(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateForm && (
                <div className="rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Create Administrator</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            EduProw will generate a temporary password automatically.
                        </p>
                    </div>

                    <form onSubmit={handleCreate} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label htmlFor="username" className="mb-2 block text-sm font-medium">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                                placeholder="Enter username"
                                className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                                placeholder="administrator@school.com"
                                className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="admin_type" className="mb-2 block text-sm font-medium">Administrator Type</label>
                            <select
                                id="admin_type"
                                name="admin_type"
                                value={formData.admin_type}
                                onChange={(event) => setFormData({ ...formData, admin_type: event.target.value })}
                                className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="principal">Principal</option>
                                <option value="vice_principal">Vice Principal</option>
                                <option value="bursar">Bursar</option>
                                <option value="librarian">Librarian</option>
                            </select>
                        </div>

                        <div className="rounded-lg border border-dashed bg-slate-50 p-3 text-sm text-slate-600">
                            <KeyRound className="mb-1 h-4 w-4 text-slate-500" />
                            No password is entered here. A secure temporary password will be generated automatically.
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                            <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                                {isCreating ? "Creating..." : "Create Administrator"}
                            </Button>
                            <Button type="button" variant="outline" disabled={isCreating} className="w-full sm:w-auto" onClick={() => { resetForm(); setShowCreateForm(false); }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="border-b px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">Administrators</h2>
                            <p className="mt-1 text-xs text-muted-foreground">School administrator accounts and access.</p>
                        </div>
                        <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{administrators.length}</div>
                    </div>
                </div>

                <div className="divide-y md:hidden">
                    {administrators.length === 0 ? (
                        <div className="px-4 py-12 text-center text-sm text-muted-foreground">No administrators found.</div>
                    ) : administrators.map((administrator) => {
                        const processing = selectedAdminId === administrator.id;
                        const isProprietor = administrator.admin_type?.toLowerCase() === "proprietor";
                        return (
                            <div key={administrator.id} className="space-y-4 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><ShieldCheck className="h-5 w-5 text-primary" /></div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{administrator.username}</p>
                                            <p className="text-xs text-muted-foreground">{formatAdminType(administrator.admin_type)}</p>
                                        </div>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${administrator.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                        {administrator.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">{administrator.email || "No email address"}</p>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" disabled={processing || isProprietor} onClick={() => handleResetPassword(administrator)}>
                                        <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                    </Button>
                                    {administrator.is_active ? (
                                        <Button type="button" variant="outline" disabled={processing || isProprietor || isDeactivating} onClick={() => handleDeactivate(administrator)}>
                                            <ShieldOff className="mr-2 h-4 w-4" /> Deactivate
                                        </Button>
                                    ) : (
                                        <Button type="button" variant="outline" disabled={processing || isActivating} onClick={() => handleActivate(administrator)}>
                                            <ShieldCheck className="mr-2 h-4 w-4" /> Activate
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Username</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {administrators.length === 0 ? (
                                <tr><td colSpan="5" className="px-5 py-12 text-center text-muted-foreground">No administrators found.</td></tr>
                            ) : administrators.map((administrator) => {
                                const processing = selectedAdminId === administrator.id;
                                const isProprietor = administrator.admin_type?.toLowerCase() === "proprietor";
                                return (
                                    <tr key={administrator.id}>
                                        <td className="px-5 py-4 font-medium text-slate-900">{administrator.username}</td>
                                        <td className="px-5 py-4">{formatAdminType(administrator.admin_type)}</td>
                                        <td className="px-5 py-4 text-slate-600">{administrator.email || "—"}</td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${administrator.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{administrator.is_active ? "Active" : "Inactive"}</span></td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="outline" size="sm" disabled={processing || isProprietor} onClick={() => handleResetPassword(administrator)}>
                                                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                                </Button>
                                                {administrator.is_active ? (
                                                    <Button type="button" variant="outline" size="sm" disabled={processing || isProprietor || isDeactivating} onClick={() => handleDeactivate(administrator)}>Deactivate</Button>
                                                ) : (
                                                    <Button type="button" variant="outline" size="sm" disabled={processing || isActivating} onClick={() => handleActivate(administrator)}>Activate</Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdministratorsPage;
