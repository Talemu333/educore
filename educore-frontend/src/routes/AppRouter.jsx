import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


import DashboardLayout
    from "../layouts/DashboardLayout";


import LoginPage
    from "../pages/auth/LoginPage";


import DashboardPage
    from "../pages/dashboard/DashboardPage";


import TeacherDashboardPage
    from "../pages/dashboard/TeacherDashboardPage";


import StudentsPage
    from "../pages/students/StudentsPage";


import TeachersPage
    from "../pages/teachers/TeachersPage";


import ParentsPage
    from "../pages/parents/ParentsPage";


import AttendancePage
    from "../pages/attendance/AttendancePage";


import PaymentsPage
    from "../pages/payments/PaymentsPage";


import PaymentReportsPage
    from "@/pages/payments/PaymentReportsPage";


import SettingsPage
    from "../pages/settings/SettingsPage";


import TimetablePage
    from "../pages/timetable/TimetablePage";


import AnnouncementsPage
    from "../pages/announcements/AnnouncementsPage";


import StudentFormPage
    from "../pages/students/StudentFormPage";


import StudentProfilePage
    from "../pages/students/StudentProfilePage";


import CreateParentPage
    from "../pages/parents/CreateParentPage";


import ClassSubjectsPage
    from "../pages/ClassSubjectsPage";


import ResultEntryPage
    from "../pages/results/ResultEntryPage";


import ProtectedRoute
    from "./ProtectedRoute";


import ClassResultSheetPage
    from "../pages/results/ClassResultSheetPage";


import DetailedClassResultSheetPage
    from "../pages/results/DetailedClassResultSheetPage";


import GradingScalesPage
    from "../pages/settings/GradingScalesPage";


import PublicLayout
    from "@/layouts/PublicLayout";


import Home
    from "@/pages/public/Home";


import About
    from "@/pages/public/About";


import Contact
    from "@/pages/public/Contact";


import Academics
    from "@/pages/public/Academics";


import Admissions
    from "@/pages/public/Admissions";


import WebsiteManagement
    from "@/pages/dashboard/WebsiteManagement";


import Gallery
    from "@/pages/public/Gallery";


import News
    from "@/pages/public/News";


import NewsDetails
    from "@/pages/public/NewsDetails";


import Events
    from "@/pages/public/Events";


import EventDetails
    from "@/pages/public/EventDetails";


import ParentDashboardPage
    from "../pages/parents/ParentDashboardPage";


import ParentResultsPage
    from "../pages/parents/ParentResultsPage";


import ParentAttendancePage
    from "@/pages/parents/ParentAttendancePage";


import ChangePasswordPage
    from "@/pages/ChangePasswordPage";


import FeeManagementPage
    from "@/pages/admin/FeeManagementPage";


import ParentPaymentsPage
    from "@/pages/parents/ParentPaymentsPage";


import TeacherStudentsPage
    from "../pages/teachers/TeacherStudentsPage";


import AdministratorsPage
    from "@/pages/admin/AdministratorsPage";


import ROLES
    from "@/constants/roles";

import StudentPromotionPage
    from "../pages/students/StudentPromotionPage";
import StudentPromotionHistoryPage from "@/pages/students/StudentPromotionHistoryPage";
import ParentFinancialOverviewPage from "../pages/admin/ParentFinancialOverviewPage";
import ParentFinancialDetailsPage from "../pages/admin/ParentFinancialDetailsPage";




function AppRouter() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =========================================
                    LOGIN
                ========================================= */}

                <Route
                    path="/"
                    element={
                        <LoginPage />
                    }
                />


                {/* =========================================
                    PUBLIC WEBSITE
                ========================================= */}

                <Route
                    path="/website"
                    element={
                        <PublicLayout />
                    }
                >

                    <Route
                        index
                        element={
                            <Home />
                        }
                    />

                    <Route
                        path="about"
                        element={
                            <About />
                        }
                    />

                    <Route
                        path="contact"
                        element={
                            <Contact />
                        }
                    />

                    <Route
                        path="academics"
                        element={
                            <Academics />
                        }
                    />

                    <Route
                        path="admissions"
                        element={
                            <Admissions />
                        }
                    />

                    <Route
                        path="gallery"
                        element={
                            <Gallery />
                        }
                    />

                    <Route
                        path="news"
                        element={
                            <News />
                        }
                    />

                    <Route
                        path="news/:slug"
                        element={
                            <NewsDetails />
                        }
                    />

                    <Route
                        path="events"
                        element={
                            <Events />
                        }
                    />

                    <Route
                        path="events/:slug"
                        element={
                            <EventDetails />
                        }
                    />

                </Route>


                {/* =========================================
                    PROTECTED DASHBOARD
                ========================================= */}

                <Route
                    element={

                        <ProtectedRoute>

                            <DashboardLayout />

                        </ProtectedRoute>

                    }
                >


                    {/* =====================================
                        ADMIN DASHBOARD

                        All Admin types
                    ===================================== */}

                    <Route
                        path="/dashboard"
                        element={

                            <ProtectedRoute
                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}
                            >

                                <DashboardPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        ADMINISTRATORS

                        PROPRIETOR ONLY
                    ===================================== */}

                    <Route
                        path="/administrators"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor"
                                ]}

                            >

                                <AdministratorsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        STUDENTS

                        PROPRIETOR
                        PRINCIPAL
                        VICE PRINCIPAL
                    ===================================== */}

                    <Route
                        path="/students"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <StudentsPage />

                            </ProtectedRoute>

                        }
                    />

                    <Route
                        path="/student-promotion"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal"
                                ]}

                            >

                                <StudentPromotionPage />

                            </ProtectedRoute>

                        }
                    />
                    <Route
                        path="/promotion-history"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal"
                                ]}

                            >

                                <StudentPromotionHistoryPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        CREATE STUDENT
                    ===================================== */}

                    <Route
                        path="/students/new"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <StudentFormPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        EDIT STUDENT
                    ===================================== */}

                    <Route
                        path="/students/:id/edit"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <StudentFormPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        STUDENT PROFILE
                    ===================================== */}

                    <Route
                        path="/students/:id"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <StudentProfilePage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        TEACHERS

                        PROPRIETOR
                        PRINCIPAL
                        VICE PRINCIPAL
                    ===================================== */}

                    <Route
                        path="/teachers"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <TeachersPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        PARENTS

                        PROPRIETOR
                        PRINCIPAL
                        VICE PRINCIPAL
                    ===================================== */}

                    <Route
                        path="/parents"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <ParentsPage />

                            </ProtectedRoute>

                        }
                    />
                    <Route
                        path="/parent-overview"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <ParentFinancialOverviewPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        CREATE PARENT
                    ===================================== */}

                    <Route
                        path="/parents/new"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <CreateParentPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        CLASS SUBJECTS
                    ===================================== */}

                    <Route
                        path="/class-subjects"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <ClassSubjectsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        ATTENDANCE

                        Admin academic staff + Teacher
                    ===================================== */}

                    <Route
                        path="/attendance"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN,
                                    ROLES.TEACHER
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <AttendancePage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        RESULTS

                        Admin academic staff + Teacher
                    ===================================== */}

                    <Route
                        path="/results"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN,
                                    ROLES.TEACHER
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <ResultEntryPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        CLASS RESULT SHEET
                    ===================================== */}

                    <Route
                        path="/results/class-sheet"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <ClassResultSheetPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        DETAILED CLASS RESULT SHEET
                    ===================================== */}

                    <Route
                        path="/results/detailed-class-sheet"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <DetailedClassResultSheetPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        TIMETABLE

                        PROPRIETOR
                        PRINCIPAL
                        VICE PRINCIPAL
                    ===================================== */}

                    <Route
                        path="/timetable"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal"
                                ]}

                            >

                                <TimetablePage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        ANNOUNCEMENTS

                        All Admin types
                    ===================================== */}

                    <Route
                        path="/announcements"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal",
                                    "vice_principal",
                                    "bursar"
                                ]}

                            >

                                <AnnouncementsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        PAYMENTS

                        PROPRIETOR + BURSAR
                    ===================================== */}

                    <Route
                        path="/payments"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "bursar"
                                ]}

                            >

                                <PaymentsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        PAYMENT REPORTS

                        PROPRIETOR + BURSAR
                    ===================================== */}

                    <Route
                        path="/payments/reports"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "bursar"
                                ]}

                            >

                                <PaymentReportsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        FEE MANAGEMENT

                        PROPRIETOR + BURSAR
                    ===================================== */}

                    <Route
                        path="/admin/fees"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "bursar"
                                ]}

                            >

                                <FeeManagementPage />

                            </ProtectedRoute>

                        }
                    />

                        {/* =====================================
                            PARENT FINANCIAL DETAILS
                        ===================================== */}

                    <Route
                        path="/parents/financial/:parentId"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "bursar"
                                ]}

                            >

                                <ParentFinancialDetailsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        WEBSITE MANAGEMENT

                        PROPRIETOR + PRINCIPAL
                    ===================================== */}

                    <Route
                        path="/dashboard/website"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor",
                                    "principal"
                                ]}

                            >

                                <WebsiteManagement />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        SETTINGS

                        PROPRIETOR ONLY
                    ===================================== */}

                    <Route
                        path="/settings"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor"
                                ]}

                            >

                                <SettingsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        GRADING SCALES

                        PROPRIETOR ONLY
                    ===================================== */}

                    <Route
                        path="/settings/grading-scales"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN
                                ]}

                                allowedAdminTypes={[
                                    "proprietor"
                                ]}

                            >

                                <GradingScalesPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        CHANGE PASSWORD

                        ALL AUTHENTICATED USERS
                    ===================================== */}

                    <Route
                        path="/change-password"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.ADMIN,
                                    ROLES.TEACHER,
                                    ROLES.PARENT
                                ]}

                            >

                                <ChangePasswordPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        TEACHER DASHBOARD
                    ===================================== */}

                    <Route
                        path="/teacher-dashboard"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.TEACHER
                                ]}

                            >

                                <TeacherDashboardPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        TEACHER STUDENTS
                    ===================================== */}

                    <Route
                        path="/teacher-students"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.TEACHER
                                ]}

                            >

                                <TeacherStudentsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        PARENT DASHBOARD
                    ===================================== */}

                    <Route
                        path="/parent-dashboard"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.PARENT
                                ]}

                            >

                                <ParentDashboardPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        PARENT RESULTS
                    ===================================== */}

                    <Route
                        path="/parent-results"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.PARENT
                                ]}

                            >

                                <ParentResultsPage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        PARENT ATTENDANCE
                    ===================================== */}

                    <Route
                        path="/parent-attendance"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.PARENT
                                ]}

                            >

                                <ParentAttendancePage />

                            </ProtectedRoute>

                        }
                    />


                    {/* =====================================
                        PARENT PAYMENTS
                    ===================================== */}

                    <Route
                        path="/parent/payments"
                        element={

                            <ProtectedRoute

                                allowedRoles={[
                                    ROLES.PARENT
                                ]}

                            >

                                <ParentPaymentsPage />

                            </ProtectedRoute>

                        }
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}


export default AppRouter;