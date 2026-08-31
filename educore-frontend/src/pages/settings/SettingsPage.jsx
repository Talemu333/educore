import { useSessions } from "@/hooks/useSessions";
import LegacySettingsPage from "./LegacySettingsPage";
import AcademicTermManagement from "@/components/settings/AcademicTermManagement";
import AcademicStructureManagement from "@/components/settings/AcademicStructureManagement";

function SettingsPage() {
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

export default SettingsPage;
