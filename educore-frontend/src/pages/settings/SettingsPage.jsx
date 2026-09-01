import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/context/AuthContext";
import LegacySettingsPage from "./LegacySettingsPage";
import AcademicTermManagement from "@/components/settings/AcademicTermManagement";
import AcademicStructureManagement from "@/components/settings/AcademicStructureManagement";
import SuperAdminSchoolManagement from "@/components/settings/SuperAdminSchoolManagement";

function SettingsPage() {
    const { data: sessions = [] } = useSessions();
    const { user } = useAuth();

    return (
        <>
            <LegacySettingsPage />

            <section className="w-full min-w-0 overflow-hidden rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                <AcademicTermManagement sessions={sessions} />
            </section>

            <section className="w-full min-w-0 overflow-hidden rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                <AcademicStructureManagement />
            </section>

            {user?.role_name === "Super Admin" && (
                <section className="w-full min-w-0 overflow-hidden rounded-xl border bg-background p-4 shadow-sm sm:p-6">
                    <SuperAdminSchoolManagement />
                </section>
            )}
        </>
    );
}

export default SettingsPage;
