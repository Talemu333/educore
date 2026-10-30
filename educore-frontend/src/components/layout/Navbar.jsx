import { useState } from "react";
import { Bell, Menu, UserCircle, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSchoolTheme } from "@/context/SchoolThemeContext";

const pageTitles = {
    "/dashboard": "Dashboard",
    "/teacher-dashboard": "Teacher Dashboard",
    "/teacher-students": "My Students",
    "/parent-dashboard": "Parent Dashboard",
    "/students": "Students",
    "/teachers": "Teachers",
    "/parents": "Parents",
    "/attendance": "Attendance",
    "/results": "Results",
    "/payments": "Payments",
    "/payments/reports": "Payment Reports",
    "/admin/fees": "Fee Management",
    "/parent-overview": "Parent Financial Overview",
    "/settings": "School Settings",
    "/settings/grading-scales": "Grading Scales",
    "/dashboard/website": "Website Management",
    "/change-password": "Change Password"
};

function Navbar({ onMenuClick }) {
    const location = useLocation();
    const { user } = useAuth();
    const { settings } = useSchoolTheme();
    const title = pageTitles[location.pathname] || "EduProw";
    const displayName = user?.full_name || user?.name || "User";
    const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "U";
    const roleLabel = user?.admin_type ? user.admin_type.replace(/_/g, " ") : user?.role_name || "Account";
    const schoolName = settings?.school_name || "EduProw School";
    const schoolLogo = settings?.school_logo?.trim() || "";
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur-xl sm:px-5 md:px-6 lg:px-7">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <button type="button" onClick={onMenuClick} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden" aria-label="Open navigation menu"><Menu className="h-5 w-5" /></button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-blue-50">
                    {schoolLogo ? <img src={schoolLogo} alt={`${schoolName} logo`} className="h-full w-full object-contain p-1" /> : <span className="text-xs font-extrabold text-blue-800">{schoolName.trim().slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="min-w-0">
                    <p className="max-w-[48vw] truncate text-sm font-bold text-slate-900 sm:max-w-[55vw] sm:text-base">{schoolName}</p>
                    <p className="truncate text-[11px] font-medium text-slate-500">{title} <span className="hidden sm:inline">· EduProw School Management</span></p>
                </div>
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-1.5 sm:gap-3">
                <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications"><Bell className="h-5 w-5" /><span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[var(--school-primary)]" /></button>
                <div className="hidden h-8 w-px bg-slate-200 sm:block" />
                <div className="flex items-center gap-2 rounded-xl px-1 py-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--school-primary-light)] text-sm font-bold text-[var(--school-primary-dark)]">
                        {user?.profile_image_url && !imageFailed ? <img src={user.profile_image_url} alt={`${displayName} profile`} className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : initials}
                    </div>
                    <div className="hidden min-w-0 md:block"><p className="max-w-40 truncate text-sm font-semibold text-slate-800">{displayName}</p><p className="max-w-40 truncate text-xs capitalize text-slate-500">{roleLabel}</p></div>
                    <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
                    <UserCircle className="sr-only" aria-hidden="true" />
                </div>
            </div>
        </header>
    );
}

export default Navbar;
