import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    X,
    Settings,
    Handshake,
    SlidersHorizontal,
    CreditCard,
    GraduationCap,
    BookOpen,
    Wallet,
    MessageSquare,
    Globe,
    ShieldCheck
} from "lucide-react";
import sidebarMenu from "../../constants/sidebarMenu";
import SidebarItem from "./SidebarItem";
import { useAuth } from "@/context/AuthContext";
import { useSchoolTheme } from "@/context/SchoolThemeContext";

const makeAdminMenuGroups = (items) => {
    const academicPaths = new Set([
        "/students", "/teachers", "/attendance", "/timetable",
        "/student-promotion", "/promotion-history"
    ]);
    const teachingPaths = new Set([
        "/cbt-management", "/cbt-question-bank", "/cbt-question-bank/import",
        "/cbt-results", "/lesson-notes", "/lesson-syllabus"
    ]);
    const financePaths = new Set([
        "/payments", "/parent-overview", "/payments/reports", "/admin/fees", "/expenses"
    ]);
    const communicationPaths = new Set(["/announcements", "/contact-messages"]);
    const websitePaths = new Set(["/dashboard/website"]);
    const administrationPaths = new Set(["/administrators", "/change-password"]);

    const groups = [
        { title: "Students & Staff", icon: GraduationCap, paths: academicPaths, children: [] },
        { title: "Teaching & Results", icon: BookOpen, paths: teachingPaths, children: [] },
        { title: "Fees & Finance", icon: Wallet, paths: financePaths, children: [] },
        { title: "Communication", icon: MessageSquare, paths: communicationPaths, children: [] },
        { title: "Website & School Settings", icon: Globe, paths: websitePaths, children: [] },
        { title: "School Administration", icon: ShieldCheck, paths: administrationPaths, children: [] }
    ];

    const remaining = [];

    for (const item of items) {
        if (item.title === "Results" && item.children) {
            const group = groups.find(entry => entry.title === "Teaching & Results");
            group.children.push(...item.children);
            continue;
        }

        if (item.title === "Settings" && item.children) {
            const group = groups.find(entry => entry.title === "Website & School Settings");
            group.children.push(...item.children);
            continue;
        }

        const group = groups.find(entry => entry.paths.has(item.path));
        if (group) group.children.push(item);
        else remaining.push(item);
    }

    const populatedGroups = groups
        .filter(group => group.children.length > 0)
        .map(({ paths, ...group }) => group);

    // Keep Dashboard at the top and leave items not assigned to a category
    // (including Logout) in their original order.
    return [
        ...remaining.filter(item => item.path === "/dashboard"),
        ...populatedGroups,
        ...remaining.filter(item => item.path !== "/dashboard")
    ];
};

function Sidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const { settings } = useSchoolTheme();
    const location = useLocation();
    const role = user?.role_name;
    const adminType = user?.admin_type;

    // Keep sidebar authorization consistent with ProtectedRoute.
    const normalizedRole = String(role || "").trim().toLowerCase();
    const normalizedAdminType = String(adminType || "").trim().toLowerCase();

    const canAccess = (item) => {
        if (
            item.roles &&
            !item.roles.some(itemRole =>
                String(itemRole || "").trim().toLowerCase() === normalizedRole
            )
        ) {
            return false;
        }

        if (
            normalizedRole === "admin" &&
            item.adminTypes &&
            !item.adminTypes.some(itemType =>
                String(itemType || "").trim().toLowerCase() === normalizedAdminType
            )
        ) {
            return false;
        }

        return true;
    };

    const filteredMenu = role === "Super Admin"
        ? [
            { title: "School Management", icon: Settings, path: "/settings" },
            { title: "School Subscriptions & Payments", icon: CreditCard, path: "/platform-billing" },
            { title: "Partner Programme", icon: Handshake, path: "/partner-management" },
            { title: "Partner Settings", icon: SlidersHorizontal, path: "/partner-management/settings" }
        ]
        : sidebarMenu
            .filter(canAccess)
            .map(item => {
                if (!item.children) return item;
                const children = item.children.filter(canAccess);
                return children.length === 0 ? null : { ...item, children };
            })
            .filter(Boolean);

    const shouldGroupAdminMenu =
        normalizedRole === "admin" &&
        ["proprietor", "principal"].includes(normalizedAdminType);

    const visibleMenu = shouldGroupAdminMenu
        ? makeAdminMenuGroups(filteredMenu)
        : filteredMenu;

    const displayName = user?.full_name || user?.name || "User";
    const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "U";
    const schoolName = settings?.school_name || "EDUPROW";
    const schoolLogo = settings?.school_logo?.trim() || "";

    useLayoutEffect(() => {
        const restore = () => {
            const nav = document.querySelector(".school-sidebar nav");
            const saved = sessionStorage.getItem("schoolSidebarScrollTop");
            if (!nav || saved === null) return;
            nav.scrollTop = Number(saved) || 0;
        };

        restore();
        const frame = requestAnimationFrame(() => {
            restore();
            requestAnimationFrame(restore);
        });

        return () => cancelAnimationFrame(frame);
    }, [location.pathname]);

    const rememberScroll = (event) => {
        sessionStorage.setItem("schoolSidebarScrollTop", String(event.currentTarget.scrollTop));
    };

    return (
        <aside className={`school-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[272px] flex-col border-r border-slate-800 bg-slate-950 text-slate-100 shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="school-sidebar-header border-b border-slate-800 px-5 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="school-sidebar-logo flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-sm font-extrabold text-white shadow-lg">
                            {schoolLogo ? (
                                <img src={schoolLogo} alt={schoolName + " logo"} className="h-full w-full object-contain p-1" />
                            ) : (
                                schoolName.trim().slice(0, 2).toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-extrabold tracking-wide text-white">{schoolName}</h1>
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">School Management</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden" aria-label="Close navigation menu"><X className="h-5 w-5" /></button>
                </div>
                <div className="school-sidebar-user mt-5 flex items-center gap-3 rounded-xl bg-slate-900/80 p-3 ring-1 ring-inset ring-slate-800">
                    <div className="school-sidebar-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">{initials}</div>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-100">{displayName}</p><p className="truncate text-xs capitalize text-slate-400">{adminType?.replace(/_/g, " ") || role || "Account"}</p></div>
                </div>
            </div>
            <nav onScroll={rememberScroll} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Main Menu</p>
                <div className="space-y-1">
                    {visibleMenu.map((item, index) => (
                        <SidebarItem key={item.path || item.title + "-" + index} {...item} onClose={onClose} />
                    ))}
                </div>
            </nav>
            <div className="school-sidebar-footer border-t border-slate-800 px-4 py-3"><p className="text-center text-[10px] font-medium text-slate-500">EduProw • School Administration</p></div>
        </aside>
    );
}

export default Sidebar;
