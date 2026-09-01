import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import LegacySettingsPage from "./LegacySettingsPage";
import AcademicTermManagement from "@/components/settings/AcademicTermManagement";
import AcademicStructureManagement from "@/components/settings/AcademicStructureManagement";
import SuperAdminSchoolManagement from "@/components/settings/SuperAdminSchoolManagement";
import SuperAdminManageSchoolPage from "./SuperAdminManageSchoolPage";

function SchoolSettingsContent() {
    const { data: sessions = [] } = useSessions();

    return (
        <>
            <LegacySettingsPage />

            <section className="w-full min-w-0 overflow-hidden rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                <AcademicTermManagement sessions={sessions} />
            </section>

            <section className="w-full min-w-0 overflow-hidden rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                <AcademicStructureManagement />
            </section>
        </>
    );
}

function SettingsPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const isSuperAdmin = user?.role_name === "Super Admin";
    const managedSchoolId = searchParams.get("schoolId");

    // Super Admin can enter a specific school's management context without
    // exposing school-specific settings at the platform root.
    if (isSuperAdmin && managedSchoolId) {
        return <SuperAdminManageSchoolPage schoolId={managedSchoolId} />;
    }

    if (isSuperAdmin) {
        return (
            <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
                <SuperAdminSchoolManagement />
            </div>
        );
    }

    return <SchoolSettingsContent />;
}

export default SettingsPage;
