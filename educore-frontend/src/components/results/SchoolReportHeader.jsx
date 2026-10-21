import { useSchoolSettings } from "@/hooks/useSchoolSettings";

function SchoolReportHeader() {
    const { data: settings, isLoading } = useSchoolSettings();

    if (isLoading) return null;

    // Settings are school-scoped, so branding follows each school's own profile.
    const accent = settings?.school_primary_color
        || settings?.primary_color
        || settings?.theme_primary_color
        || "#173b68";
    const motto = settings?.school_motto || settings?.motto;
    const headName = settings?.principal_name || settings?.head_teacher_name || settings?.headteacher_name;
    const logo = settings?.school_logo || settings?.school_logo_url || settings?.logo_url || settings?.logo || settings?.schoolLogo || "";

    return (
        <header className="school-report-header mb-5 border-b-2 pb-4" style={{ borderColor: accent }}>
            <div className="flex items-center gap-4">
                {logo ? (
                    <img
                        src={logo}
                        alt={`${settings?.school_name || "School"} logo`}
                        className="h-20 w-20 shrink-0 object-contain"
                    />
                ) : null}
                <div className="min-w-0 flex-1 text-center">
                    <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-2xl" style={{ color: accent }}>
                        {settings?.school_name || "SCHOOL NAME"}
                    </h1>
                    {settings?.school_address ? (
                        <p className="mt-1 text-sm">{settings.school_address}</p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                        {settings?.school_phone ? <span>Tel: {settings.school_phone}</span> : null}
                        {settings?.school_email ? <span>Email: {settings.school_email}</span> : null}
                        {settings?.school_code ? <span>School Code: {settings.school_code}</span> : null}
                    </div>
                    {motto ? <p className="mt-2 text-xs italic sm:text-sm">“{motto}”</p> : null}
                </div>
                {logo ? <div className="w-20 shrink-0" aria-hidden="true" /> : null}
            </div>
            {headName ? <p className="mt-2 text-center text-xs">Head of School: {headName}</p> : null}
            <div className="mt-3 text-center">
                <span className="inline-block border px-5 py-1 text-sm font-bold uppercase tracking-widest" style={{ borderColor: accent, color: accent }}>
                    Student Academic Report
                </span>
            </div>
        </header>
    );
}

export default SchoolReportHeader;
