import {
    LayoutDashboard,
    GraduationCap,
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    Calendar,
    CreditCard,
    Bell,
    History,
    Wallet,
    Settings,
    Globe,
    LogOut,
    KeyRound,
    Receipt,
    Mail,
    BarChart3,
    FileUp
} from "lucide-react";

import ROLES from "./roles";

const ADMIN = ROLES.ADMIN;
const PROPRIETOR = "proprietor";
const PRINCIPAL = "principal";
const VICE_PRINCIPAL = "vice_principal";
const BURSAR = "bursar";

const sidebarMenu = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL, BURSAR] },
    { title: "Dashboard", icon: LayoutDashboard, path: "/parent-dashboard", roles: [ROLES.PARENT] },
    { title: "Dashboard", icon: LayoutDashboard, path: "/teacher-dashboard", roles: [ROLES.TEACHER] },
    { title: "Dashboard", icon: LayoutDashboard, path: "/student-dashboard", roles: [ROLES.STUDENT] },
    { title: "CBT Practice", icon: ClipboardList, path: "/student-cbt", roles: [ROLES.STUDENT] },
    { title: "My Results", icon: FileText, path: "/student-results", roles: [ROLES.STUDENT] },
    { title: "My Subjects", icon: BookOpen, path: "/student-subjects", roles: [ROLES.STUDENT] },
    { title: "CBT Management", icon: ClipboardList, path: "/cbt-management", roles: [ADMIN, ROLES.TEACHER], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
    { title: "Question Bank", icon: BookOpen, path: "/cbt-question-bank", roles: [ADMIN, ROLES.TEACHER], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
    { title: "Import Questions (PDF)", icon: FileUp, path: "/cbt-question-bank/import", roles: [ADMIN, ROLES.TEACHER], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
    { title: "CBT Results", icon: BarChart3, path: "/cbt-results", roles: [ADMIN, ROLES.TEACHER], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
    { title: "Administrators", icon: Users, path: "/administrators", roles: [ADMIN], adminTypes: [PROPRIETOR] },
    { title: "Students", icon: GraduationCap, path: "/students", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
    { title: "Student Promotion", icon: GraduationCap, path: "/student-promotion", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] },
    { title: "Promotion History", icon: History, path: "/promotion-history", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] },
    { title: "Teachers", icon: Users, path: "/teachers", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
    { title: "My Students", icon: GraduationCap, path: "/teacher-students", roles: [ROLES.TEACHER] },
    { title: "My Payments", icon: CreditCard, path: "/parent/payments", roles: [ROLES.PARENT] },
    { title: "Class Subjects", icon: BookOpen, path: "/class-subjects", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] },
    { title: "Attendance", icon: ClipboardList, path: "/attendance", roles: [ADMIN, ROLES.TEACHER], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
    { title: "Attendance", icon: ClipboardList, path: "/parent-attendance", roles: [ROLES.PARENT] },
    {
        title: "Results", icon: FileText, roles: [ADMIN, ROLES.TEACHER], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL],
        children: [
            { title: "Result Entry", path: "/results", roles: [ADMIN, ROLES.TEACHER], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
            { title: "Class Result Sheet", path: "/results/class-sheet", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL] },
            { title: "Detailed Class Result Sheet", path: "/results/detailed-class-sheet", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] }
        ]
    },
    { title: "Results", icon: FileText, path: "/parent-results", roles: [ROLES.PARENT] },
    { title: "Payments", icon: CreditCard, path: "/payments", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, BURSAR] },
    { title: "Parent Financial Overview", icon: CreditCard, path: "/parent-overview", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, BURSAR] },
    { title: "Payment Reports", icon: FileText, path: "/payments/reports", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, BURSAR] },
    { title: "Fee Management", icon: Wallet, path: "/admin/fees", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, BURSAR] },
    { title: "Expenses", icon: Receipt, path: "/expenses", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL, BURSAR] },
    { title: "Website", icon: Globe, path: "/dashboard/website", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] },
    { title: "Contact Messages", icon: Mail, path: "/contact-messages", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] },
    {
        title: "Settings", icon: Settings, path: "/settings", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL],
        children: [
            { title: "School Settings", path: "/settings", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] },
            { title: "Grading Scales", path: "/settings/grading-scales", roles: [ADMIN], adminTypes: [PROPRIETOR, PRINCIPAL] }
        ]
    },
    { title: "Change Password", icon: KeyRound, path: "/change-password", roles: [ADMIN, ROLES.TEACHER, ROLES.PARENT, ROLES.STUDENT], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL, BURSAR] },
    { title: "Logout", icon: LogOut, path: "/logout", roles: [ADMIN, ROLES.TEACHER, ROLES.PARENT, ROLES.STUDENT], adminTypes: [PROPRIETOR, PRINCIPAL, VICE_PRINCIPAL, BURSAR] }
];

export default sidebarMenu;
