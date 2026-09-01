import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getSchool } from "@/services/superAdminSchoolService";
import LegacySettingsPage from "./LegacySettingsPage";
import AcademicTermManagement from "@/components/settings/AcademicTermManagement";
import AcademicStructureManagement from "@/components/settings/AcademicStructureManagement";
import GradingScalesPage from "./GradingScalesPage";
import AdministratorsPage from "@/pages/admin/AdministratorsPage";
import { useSessions } from "@/hooks/useSessions";

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "settings", label: "School Settings" },
    { id: "academic", label: "Academic Structure" },
    { id: "grading", label: "Grading System" },
    { id: "administrators", label: "Administrators" }
];

function AcademicManagementContent() {
    const { data: sessions = [] } = useSessions();

    return (
        <div className="space-y-6">
            <section className="rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                <AcademicTermManagement sessions={sessions} />
            </section>
            <section className="rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                <AcademicStructureManagement />
            </section>
        </div>
    );
}

function SuperAdminManageSchoolPage({ schoolId: schoolIdProp }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [contextReady, setContextReady] = useState(false);

    const schoolId = useMemo(() => Number(schoolIdProp), [schoolIdProp]);
    const isSuperAdmin = user?.role_name === "Super Admin";

    useEffect(() => {
        if (!isSuperAdmin || !Number.isInteger(schoolId) || schoolId < 1) return;

        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getSchool(schoolId);
                if (mounted) setSchool(response?.data || null);
            } catch (err) {
                if (mounted) setError(err.response?.data?.message || "Unable to load school.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [isSuperAdmin, schoolId]);

    useEffect(() => {
        if (!isSuperAdmin || !schoolId) return undefined;

        sessionStorage.setItem("educore_super_admin_school_id", String(schoolId));
        setContextReady(true);

        return () => {
            sessionStorage.removeItem("educore_super_admin_school_id");
        };
    }, [isSuperAdmin, schoolId]);

    if (!isSuperAdmin) return null;

    if (loading) {
        return <div className="p-6 text-sm text-muted-foreground">Loading school...</div>;
    }

    if (error || !school) {
        return (
            <section className="space-y-4 rounded-xl border bg-background p-6">
                <button type="button" onClick={() => navigate("/settings")} className="rounded-md border px-3 py-2 text-sm">
                    ← Back to Schools
                </button>
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error || "School not found."}
                </div>
            </section>
        );
    }

    return (
        <section className="w-full min-w-0 space-y-6 overflow-x-hidden">
            <div className="flex flex-col gap-4 rounded-xl border bg-background p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                    <button type="button" onClick={() => navigate("/settings")} className="mb-3 text-sm text-primary hover:underline">
                        ← Back to School Management
                    </button>
                    <h2 className="text-2xl font-semibold">{school.school_name}</h2>
                    <p className="text-sm text-muted-foreground">
                        School ID: {school.school_id} · Prefix: {school.admission_prefix || "—"}
                    </p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-sm ${school.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {school.is_active ? "Active" : "Inactive"}
                </span>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "overview" && (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border bg-background p-5">
                        <h3 className="mb-3 font-semibold">School Information</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Email</dt><dd>{school.school_email || "—"}</dd></div>
                            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Phone</dt><dd>{school.school_phone || "—"}</dd></div>
                            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Level</dt><dd>{school.school_level || "—"}</dd></div>
                            <div><dt className="text-muted-foreground">Address</dt><dd className="mt-1">{school.school_address || "—"}</dd></div>
                            <div><dt className="text-muted-foreground">Motto</dt><dd className="mt-1">{school.school_motto || "—"}</dd></div>
                        </dl>
                    </div>
                    <div className="rounded-xl border bg-background p-5">
                        <h3 className="mb-3 font-semibold">Management Context</h3>
                        <p className="text-sm text-muted-foreground">
                            All school-scoped requests made from this page use School {school.school_id} as the active Super Admin management context. This keeps the selected school's academic, financial, student, teacher and other records separate from other schools.
                        </p>
                    </div>
                </div>
            )}

            {contextReady && activeTab === "settings" && <LegacySettingsPage />}
            {contextReady && activeTab === "academic" && <AcademicManagementContent />}
            {contextReady && activeTab === "grading" && <GradingScalesPage />}
            {contextReady && activeTab === "administrators" && <AdministratorsPage />}
        </section>
    );
}

export default SuperAdminManageSchoolPage;
