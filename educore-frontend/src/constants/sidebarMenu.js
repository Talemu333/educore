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
    KeyRound
} from "lucide-react";

import ROLES from "./roles";


const ADMIN =
    ROLES.ADMIN;


/*
=========================================
ADMIN TYPES
=========================================

All of these have:

role_name = "Admin"

The admin_type determines
the type of administrator.
=========================================
*/

const PROPRIETOR =
    "proprietor";

const PRINCIPAL =
    "principal";

const VICE_PRINCIPAL =
    "vice_principal";

const BURSAR =
    "bursar";


const sidebarMenu = [

    /*
    =========================================
    ADMIN DASHBOARD
    =========================================
    */

    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            VICE_PRINCIPAL,
            BURSAR
        ]
    },
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/parent-dashboard",

        roles: [
            ROLES.PARENT
        ]
    },
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/teacher-dashboard",

        roles: [
            ROLES.TEACHER
        ]
    },


    /*
    =========================================
    ADMINISTRATORS
    =========================================

    PROPRIETOR ONLY
    =========================================
    */

    {
        title: "Administrators",
        icon: Users,
        path: "/administrators",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR
        ]
    },


    /*
    =========================================
    SCHOOL MANAGEMENT
    =========================================
    */

    /*
    -----------------------------------------
    STUDENTS
    -----------------------------------------
    */

    {
        title: "Students",
        icon: GraduationCap,
        path: "/students",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            VICE_PRINCIPAL
        ]
    },

    {
        title: "Student Promotion",
        icon: GraduationCap,
        path: "/student-promotion",

        roles: [
            ROLES.ADMIN
        ],

        adminTypes: [
            "proprietor",
            "principal"
        ]
    },
    {
        title: "Promotion History",
        icon: History,
        path: "/promotion-history",

        roles: [
            ROLES.ADMIN
        ],

        adminTypes: [
            "proprietor",
            "principal"
        ]
    },


    /*
    -----------------------------------------
    TEACHERS
    -----------------------------------------
    */

    {
        title: "Teachers",
        icon: Users,
        path: "/teachers",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            VICE_PRINCIPAL
        ]
    },
    {
        title: "My Students",
        icon: GraduationCap,
        path: "/teacher-students",

        roles: [
            ROLES.TEACHER
        ]
    },


    /*
    -----------------------------------------
    PARENTS
    -----------------------------------------
    */


    // {
    //     title: "Parents",
    //     icon: Users,
    //     path: "/parents",

    //     roles: [
    //         ADMIN
    //     ],

    //     adminTypes: [
    //         PROPRIETOR,
    //         PRINCIPAL,
    //         VICE_PRINCIPAL
    //     ]
    // },
    {
        title: "My Payments",
        icon: CreditCard,
        path: "/parent/payments",

        roles: [
            ROLES.PARENT
        ]
    },


    /*
    -----------------------------------------
    CLASS SUBJECTS
    -----------------------------------------
    */

    {
        title: "Class Subjects",
        icon: BookOpen,
        path: "/class-subjects",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL
        ]
    },


    /*
    =========================================
    ATTENDANCE
    =========================================
    */

    {
        title: "Attendance",
        icon: ClipboardList,
        path: "/attendance",

        roles: [
            ADMIN,
            ROLES.TEACHER
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            VICE_PRINCIPAL
        ]
    },
    {
        title: "Attendance",
        icon: ClipboardList,
        path: "/parent-attendance",

        roles: [
            ROLES.PARENT
        ]
    },


    /*
    =========================================
    RESULTS
    =========================================
    */

    {
        title: "Results",
        icon: FileText,

        roles: [
            ADMIN,
            ROLES.TEACHER
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            VICE_PRINCIPAL
        ],

        children: [

            /*
            ---------------------------------
            RESULT ENTRY
            ---------------------------------
            */

            {
                title: "Result Entry",
                path: "/results",

                roles: [
                    ADMIN,
                    ROLES.TEACHER
                ],

                adminTypes: [
                    PROPRIETOR,
                    PRINCIPAL,
                    VICE_PRINCIPAL
                ]
            },


            /*
            ---------------------------------
            CLASS RESULT SHEET
            ---------------------------------
            */

            {
                title: "Class Result Sheet",
                path: "/results/class-sheet",

                roles: [
                    ADMIN
                ],

                adminTypes: [
                    PROPRIETOR,
                    PRINCIPAL,
                    VICE_PRINCIPAL
                ]
            },


            /*
            ---------------------------------
            DETAILED CLASS RESULT SHEET
            ---------------------------------
            */

            {
                title: "Detailed Class Result Sheet",
                path: "/results/detailed-class-sheet",

                roles: [
                    ADMIN
                ],

                adminTypes: [
                    PROPRIETOR,
                    PRINCIPAL
                ]
            }

        ]
    },

    {
        title: "Results",
        icon: FileText,
        path: "/parent-results",

        roles: [
            ROLES.PARENT
        ]
    },


    /*
    =========================================
    TIMETABLE
    =========================================
    */

    // {
    //     title: "Timetable",
    //     icon: Calendar,
    //     path: "/timetable",

    //     roles: [
    //         ADMIN
    //     ],

    //     adminTypes: [
    //         PROPRIETOR,
    //         PRINCIPAL,
    //         VICE_PRINCIPAL
    //     ]
    // },


    /*
    =========================================
    FINANCE
    =========================================
    */

    /*
    -----------------------------------------
    PAYMENTS
    -----------------------------------------
    */

    {
        title: "Payments",
        icon: CreditCard,
        path: "/payments",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            BURSAR
        ]
    },
    {
        title: "Parent Financial Overview",
        icon: CreditCard,
        path: "/parent-overview",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            BURSAR
        ]
    },


    /*
    -----------------------------------------
    PAYMENT REPORTS
    -----------------------------------------
    */

    {
        title: "Payment Reports",
        icon: FileText,
        path: "/payments/reports",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            BURSAR
        ]
    },


    /*
    -----------------------------------------
    FEE MANAGEMENT
    -----------------------------------------
    */

    {
        title: "Fee Management",
        icon: Wallet,
        path: "/admin/fees",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            BURSAR
        ]
    },


    /*
    =========================================
    ANNOUNCEMENTS
    =========================================
    */

    // {
    //     title: "Announcements",
    //     icon: Bell,
    //     path: "/announcements",

    //     roles: [
    //         ADMIN
    //     ],

    //     adminTypes: [
    //         PROPRIETOR,
    //         PRINCIPAL,
    //         VICE_PRINCIPAL
    //     ]
    // },


    /*
    =========================================
    WEBSITE
    =========================================
    */

    {
        title: "Website",
        icon: Globe,
        path: "/dashboard/website",

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL
        ]
    },


    /*
    =========================================
    SETTINGS
    =========================================
    */

    {
        title: "Settings",
        icon: Settings,

        roles: [
            ADMIN
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL
        ],

        children: [

            /*
            ---------------------------------
            SCHOOL SETTINGS
            ---------------------------------
            */

            {
                title: "School Settings",
                path: "/settings",

                roles: [
                    ADMIN
                ],

                adminTypes: [
                    PROPRIETOR,
                    PRINCIPAL
                ]
            },


            /*
            ---------------------------------
            GRADING SCALES
            ---------------------------------
            */

            {
                title: "Grading Scales",
                path: "/settings/grading-scales",

                roles: [
                    ADMIN
                ],

                adminTypes: [
                    PROPRIETOR,
                    PRINCIPAL
                ]
            }

        ]
    },


    /*
    =========================================
    CHANGE PASSWORD
    =========================================
    */

    {
        title: "Change Password",
        icon: KeyRound,
        path: "/change-password",

        roles: [
            ADMIN,
            ROLES.TEACHER,
            ROLES.PARENT
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            VICE_PRINCIPAL,
            BURSAR
        ]
    },


    /*
    =========================================
    LOGOUT
    =========================================
    */

    {
        title: "Logout",
        icon: LogOut,

        roles: [
            ADMIN,
            ROLES.TEACHER,
            ROLES.PARENT
        ],

        adminTypes: [
            PROPRIETOR,
            PRINCIPAL,
            VICE_PRINCIPAL,
            BURSAR
        ]
    }

];


export default sidebarMenu;