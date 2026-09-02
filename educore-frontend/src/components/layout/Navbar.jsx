import {
    Bell,
    Menu,
    UserCircle
} from "lucide-react";

import {
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "@/context/AuthContext";


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


function Navbar({
    onMenuClick
}) {

    const location =
        useLocation();

    const {
        user
    } = useAuth();

    const title =
        pageTitles[location.pathname] ||
        "EduCore";

    const displayName =
        user?.full_name ||
        user?.name ||
        "User";

    const initials =
        displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase() || "U";

    const roleLabel =
        user?.admin_type
            ? user.admin_type.replace(/_/g, " ")
            : user?.role_name || "Account";


    return (

        <header
            className="
                sticky top-0 z-30 flex h-[72px] items-center
                border-b border-slate-200 bg-white/95 px-4
                backdrop-blur sm:px-5 md:px-6 lg:px-8
            "
        >

            <div className="flex min-w-0 flex-1 items-center gap-3">

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="
                        inline-flex h-10 w-10 items-center justify-center
                        rounded-xl text-slate-600 transition-colors
                        hover:bg-slate-100 hover:text-slate-900 lg:hidden
                    "
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                    <p className="hidden text-xs font-medium text-slate-400 sm:block">
                        EduCore School Management
                    </p>
                    <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                        {title}
                    </h2>
                </div>

            </div>

            <div className="flex items-center gap-2 sm:gap-3">

                <button
                    type="button"
                    className="
                        relative inline-flex h-10 w-10 items-center justify-center
                        rounded-xl text-slate-500 transition-colors
                        hover:bg-slate-100 hover:text-slate-900
                    "
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
                </button>

                <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                <div className="flex items-center gap-2.5 rounded-xl px-1 py-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                        {initials}
                    </div>

                    <div className="hidden min-w-0 md:block">
                        <p className="max-w-40 truncate text-sm font-semibold text-slate-800">
                            {displayName}
                        </p>
                        <p className="max-w-40 truncate text-xs capitalize text-slate-500">
                            {roleLabel}
                        </p>
                    </div>

                    <UserCircle className="hidden h-4 w-4 text-slate-400 lg:block" />
                </div>

            </div>

        </header>

    );

}


export default Navbar;