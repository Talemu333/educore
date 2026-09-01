import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/context/AuthContext";
import LegacySettingsPage from "./LegacySettingsPage";
import AcademicTermManagement from "@/components/settings/AcademicTermManagement";
import AcademicStructureManagement from "@/components/settings/AcademicStructureManagement";
import SuperAdminSchoolManagement from "@/components/settings/SuperAdminSchoolManagement";

function SettingsPage() {
    const { data: sessions = [] } = useSessions();
    const { user } = useAuth();
    const isSuperAdmin = user?.role_name === "Super Admin";

    // Super Admin is a platform-level user. Do not expose
    // school-specific settings such as sessions, terms,
    // subjects, classes, arms, grading, or branding here.
    if (isSuperAdmin) {
        return (
            <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
                <SuperAdminSchoolManagement />
            </div>
        );
    }

    // Normal school administrators continue to use the existing
    // school-scoped settings and academic management screens.
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

export default SettingsPage;
