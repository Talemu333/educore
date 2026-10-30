import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    X, GraduationCap, BookOpen, Wallet, MessageSquare, Globe, ShieldCheck,
    LogOut, Settings, Users, UserRound, ClipboardList, FileText, CreditCard,
    CalendarDays, BarChart3, Bell, ChevronDown, School, LayoutDashboard,
    ClipboardCheck, NotebookTabs
} from "lucide-react";
import sidebarMenu from "../../constants/sidebarMenu";
import SidebarItem from "./SidebarItem";
import { useAuth } from "@/context/AuthContext";
import { useSchoolTheme } from "@/context/SchoolThemeContext";

function Sidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const { settings } = useSchoolTheme();
    const location = useLocation();
    const role = String(user?.role_name || "").trim().toLowerCase();
    const adminType = String(user?.admin_type || "").trim().toLowerCase();
    const isSchoolAdmin = role === "admin";
    const isSuperAdmin = role === "super admin";

    const canAccess = item => {
        if (item.roles && !item.roles.some(value => String(value).toLowerCase() === role)) return false;
        if (isSchoolAdmin && item.adminTypes && !item.adminTypes.some(value => String(value).toLowerCase() === adminType)) return false;
        return true;
    };

    const filtered = isSuperAdmin
        ? [
            { title: "School Management", icon: Settings, path: "/settings" },
            { title: "School Subscriptions & Payments", icon: CreditCard, path: "/platform-billing" },
            { title: "Logout", icon: LogOut, path: "/logout" }
        ]
        : sidebarMenu.filter(canAccess).map(item => item.children
            ? { ...item, children: item.children.filter(canAccess) }
            : item
        ).filter(item => !item.children || item.children.length);

    const findItems = paths => filtered.flatMap(item => {
        if (item.children) return item.children.filter(child => paths.includes(child.path));
        return paths.includes(item.path) ? [item] : [];
    });
    const findTop = title => filtered.find(item => item.title === title && item.path);
    const dashboard = findTop("Dashboard");
    const academic = findItems(["/attendance", "/attendance/reports", "/timetable", "/student-promotion", "/promotion-history"]);
    const students = findItems(["/students"]);
    const teachers = findItems(["/teachers", "/progress-report-review"]);
    const parents = findItems(["/administrators"]);
    const classes = findItems(["/timetable"]);
    const cbt = findItems(["/cbt-management", "/cbt-question-bank", "/cbt-question-bank/import", "/cbt-results", "/lesson-notes", "/lesson-syllabus"]);
    const resultItem = filtered.find(item => item.title === "Results" && item.children);
    const finance = findItems(["/payments", "/parent-overview", "/payments/reports", "/admin/fees", "/expenses"]);
    const reports = findItems(["/attendance/reports", "/payments/reports", "/reports", "/results/class-sheet", "/results/detailed-class-sheet"]);
    const website = findItems(["/dashboard/website", "/contact-messages"]);
    const settingsItem = filtered.find(item => item.title === "Settings" && item.children);
    const standalone = isSuperAdmin ? filtered : [];

    const menu = isSchoolAdmin && ["proprietor", "principal", "vice_principal", "bursar"].includes(adminType)
        ? [
            dashboard,
            { title: "Academic", icon: BookOpen, children: academic },
            ...students,
            ...teachers,
            ...parents.map(item => ({ ...item, title: "Parents", icon: UserRound })),
            ...classes.map(item => ({ ...item, title: "Classes", icon: School })),
            { title: "CBT", icon: ClipboardList, children: cbt },
            resultItem && { ...resultItem, title: "Results" },
            { title: "Finance", icon: Wallet, children: finance },
            { title: "Reports", icon: BarChart3, children: reports },
            { title: "School Website", icon: Globe, children: website },
            settingsItem && { ...settingsItem, title: "Settings" }
        ].filter(item => item && (item.path || item.children?.length))
        : filtered;

    const schoolName = settings?.school_name || "Your School";
    const schoolLogo = settings?.school_logo?.trim() || "";
    const motto = settings?.school_motto || "Better Schools. Brighter Futures.";
    const initials = schoolName.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

    useLayoutEffect(() => {
        const nav = document.querySelector(".school-sidebar nav");
        const saved = sessionStorage.getItem("schoolSidebarScrollTop");
        if (nav && saved !== null) nav.scrollTop = Number(saved) || 0;
    }, [location.pathname]);

    const rememberScroll = event => sessionStorage.setItem("schoolSidebarScrollTop", String(event.currentTarget.scrollTop));

    return (
        <aside className={`school-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[254px] flex-col text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex h-[91px] shrink-0 items-center border-b border-white/10 px-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40"><GraduationCap size={31} strokeWidth={2.3}/></div>
                    <div><div className="text-[27px] font-extrabold leading-none tracking-tight"><span className="text-blue-400">Edu</span><span className="text-white">Prow</span></div><p className="mt-1 text-[9px] tracking-wide text-blue-100/80">Better Schools. Brighter Futures.</p></div>
                </div>
                <button type="button" onClick={onClose} aria-label="Close menu" className="ml-auto rounded-lg p-2 text-blue-100 hover:bg-white/10 lg:hidden"><X size={19}/></button>
            </div>

            <button type="button" className="mx-4 mt-4 flex min-h-[55px] items-center gap-3 rounded-xl border border-blue-300/20 bg-blue-950/35 px-3 text-left hover:bg-blue-900/50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white text-blue-900">{schoolLogo ? <img src={schoolLogo} alt="" className="h-full w-full object-contain p-0.5"/> : <School size={22}/>}</span>
                <span className="min-w-0 flex-1 text-[11px] font-semibold leading-4 text-white">{schoolName}</span><ChevronDown size={15} className="shrink-0 text-blue-100"/>
            </button>

            <nav onScroll={rememberScroll} className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
                <div className="space-y-1.5">
                    {menu.map((item, index) => <SidebarItem key={item.path || item.title + "-" + index} {...item} onClose={onClose}/>)}
                </div>
            </nav>

            <div className="shrink-0 px-4 pb-6 pt-3">
                <div className="flex flex-col items-center border-t border-white/10 pt-5 text-center">
                    <School size={37} strokeWidth={1.5} className="mb-3 text-blue-100"/>
                    <p className="max-w-[205px] text-xs font-semibold leading-4 text-white">{schoolName}</p>
                    <p className="mt-1 max-w-[205px] text-[10px] text-blue-100/70">{motto}</p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
