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
    const { settings, theme } = useSchoolTheme();
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
    const parents = findItems(["/parents"]);
    const classes = findItems(["/class-subjects"]);
    const cbt = findItems(["/cbt-management", "/cbt-question-bank", "/cbt-question-bank/import", "/cbt-results", "/lesson-notes", "/lesson-syllabus"]);
    const resultItem = filtered.find(item => item.title === "Results" && item.children);
    const finance = findItems(["/payments", "/parent-overview", "/payments/reports", "/admin/fees", "/expenses"]);
    const reports = findItems(["/attendance/reports", "/payments/reports", "/reports", "/results/class-sheet", "/results/detailed-class-sheet"]);
    const website = findItems(["/dashboard/website", "/dashboard/website-content", "/contact-messages"]);
    const settingsItem = filtered.find(item => item.title === "Settings" && item.children);
    const standalone = isSuperAdmin ? filtered : [];

    const menu = isSchoolAdmin && ["proprietor", "principal", "vice_principal", "bursar"].includes(adminType)
        ? [
            dashboard,
            { title: "Academic", icon: BookOpen, children: academic },
            ...students,
            ...teachers,
            ...parents,
            ...classes,
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
    const initials = schoolName.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

    useLayoutEffect(() => {
        const nav = document.querySelector(".school-sidebar nav");
        const saved = sessionStorage.getItem("schoolSidebarScrollTop");
        if (nav && saved !== null) nav.scrollTop = Number(saved) || 0;
    }, [location.pathname]);

    const rememberScroll = event => sessionStorage.setItem("schoolSidebarScrollTop", String(event.currentTarget.scrollTop));

    return (
        <aside style={{ backgroundColor: theme.primaryDark }} className={`school-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[254px] flex-col text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex h-12 shrink-0 items-center justify-end px-3 lg:hidden">
                <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-blue-100 hover:bg-white/10"><X size={19}/></button>
            </div>
            <button type="button" className="mx-4 mt-3 flex min-h-[72px] items-center gap-3 rounded-xl py-2 border border-blue-300/20 bg-blue-950/35 px-3 text-left hover:bg-blue-900/50">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-white/35 bg-white text-blue-900 shadow-sm">{schoolLogo ? <img src={schoolLogo} alt="" className="h-full w-full object-contain p-0.5"/> : <School size={22}/>}</span>
                <span className="min-w-0 flex-1 text-[14px] font-extrabold leading-5 text-white">{schoolName}</span><ChevronDown size={17} className="shrink-0 text-blue-100"/>
            </button>

            <nav onScroll={rememberScroll} className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
                <div className="flex min-h-full flex-col justify-evenly gap-1.5">
                    {menu.map((item, index) => <SidebarItem key={item.path || item.title + "-" + index} {...item} onClose={onClose}/>)}
                </div>
            </nav>
            <div className="shrink-0 border-t border-white/10 px-4 py-3 text-center">
                <p className="text-[10px] font-medium tracking-wide text-blue-100/65">powered by <span className="font-semibold text-blue-200">EduProw</span></p>
            </div>
        </aside>
    );
}

export default Sidebar;
