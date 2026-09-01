import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import TeacherDashboardPage from "../pages/dashboard/TeacherDashboardPage";
import StudentsPage from "../pages/students/StudentsPage";
import TeachersPage from "../pages/teachers/TeachersPage";
import ParentsPage from "../pages/parents/ParentsPage";
import AttendancePage from "../pages/attendance/AttendancePage";
import PaymentsPage from "../pages/payments/PaymentsPage";
import PaymentReportsPage from "@/pages/payments/PaymentReportsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import TimetablePage from "../pages/timetable/TimetablePage";
import AnnouncementsPage from "../pages/announcements/AnnouncementsPage";
import StudentFormPage from "../pages/students/StudentFormPage";
import StudentProfilePage from "../pages/students/StudentProfilePage";
import CreateParentPage from "../pages/parents/CreateParentPage";
import ClassSubjectsPage from "../pages/ClassSubjectsPage";
import ResultEntryPage from "../pages/results/ResultEntryPage";
import ProtectedRoute from "./ProtectedRoute";
import ClassResultSheetPage from "../pages/results/ClassResultSheetPage";
import DetailedClassResultSheetPage from "../pages/results/DetailedClassResultSheetPage";
import GradingScalesPage from "../pages/settings/GradingScalesPage";
import PublicLayout from "@/layouts/PublicLayout";
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import Academics from "@/pages/public/Academics";
import Admissions from "@/pages/public/Admissions";
import WebsiteManagement from "@/pages/dashboard/WebsiteManagement";
import Gallery from "@/pages/public/Gallery";
import News from "@/pages/public/News";
import NewsDetails from "@/pages/public/NewsDetails";
import Events from "@/pages/public/Events";
import EventDetails from "@/pages/public/EventDetails";
import ParentDashboardPage from "../pages/parents/ParentDashboardPage";
import ParentResultsPage from "../pages/parents/ParentResultsPage";
import ParentAttendancePage from "@/pages/parents/ParentAttendancePage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import FeeManagementPage from "@/pages/admin/FeeManagementPage";
import ExpensesPage from "@/pages/admin/ExpensesPage";
import ParentPaymentsPage from "@/pages/parents/ParentPaymentsPage";
import TeacherStudentsPage from "../pages/teachers/TeacherStudentsPage";
import AdministratorsPage from "@/pages/admin/AdministratorsPage";
import ROLES from "@/constants/roles";
import StudentPromotionPage from "../pages/students/StudentPromotionPage";
import StudentPromotionHistoryPage from "@/pages/students/StudentPromotionHistoryPage";
import ParentFinancialOverviewPage from "../pages/admin/ParentFinancialOverviewPage";
import ParentFinancialDetailsPage from "../pages/admin/ParentFinancialDetailsPage";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />

                <Route path="/website" element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="academics" element={<Academics />} />
                    <Route path="admissions" element={<Admissions />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="news" element={<News />} />
                    <Route path="news/:slug" element={<NewsDetails />} />
                    <Route path="events" element={<Events />} />
                    <Route path="events/:slug" element={<EventDetails />} />
                </Route>

                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><DashboardPage /></ProtectedRoute>} />

                    <Route path="/administrators" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor"]}><AdministratorsPage /></ProtectedRoute>} />

                    <Route path="/students" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><StudentsPage /></ProtectedRoute>} />
                    <Route path="/student-promotion" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal"]}><StudentPromotionPage /></ProtectedRoute>} />
                    <Route path="/promotion-history" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal"]}><StudentPromotionHistoryPage /></ProtectedRoute>} />
                    <Route path="/students/new" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><StudentFormPage /></ProtectedRoute>} />
                    <Route path="/students/:id/edit" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><StudentFormPage /></ProtectedRoute>} />
                    <Route path="/students/:id" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><StudentProfilePage /></ProtectedRoute>} />

                    <Route path="/teachers" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><TeachersPage /></ProtectedRoute>} />
                    <Route path="/parents" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><ParentsPage /></ProtectedRoute>} />
                    <Route path="/parent-overview" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><ParentFinancialOverviewPage /></ProtectedRoute>} />
                    <Route path="/parents/new" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><CreateParentPage /></ProtectedRoute>} />
                    <Route path="/class-subjects" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><ClassSubjectsPage /></ProtectedRoute>} />

                    <Route path="/attendance" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><AttendancePage /></ProtectedRoute>} />
                    <Route path="/results" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><ResultEntryPage /></ProtectedRoute>} />
                    <Route path="/results/class-sheet" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><ClassResultSheetPage /></ProtectedRoute>} />
                    <Route path="/results/detailed-class-sheet" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><DetailedClassResultSheetPage /></ProtectedRoute>} />

                    <Route path="/timetable" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal"]}><TimetablePage /></ProtectedRoute>} />
                    <Route path="/announcements" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal", "bursar"]}><AnnouncementsPage /></ProtectedRoute>} />

                    <Route path="/payments" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "bursar"]}><PaymentsPage /></ProtectedRoute>} />
                    <Route path="/payments/reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "bursar"]}><PaymentReportsPage /></ProtectedRoute>} />
                    <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "bursar"]}><FeeManagementPage /></ProtectedRoute>} />

                    <Route path="/expenses" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal", "vice_principal", "bursar"]}><ExpensesPage /></ProtectedRoute>} />

                    <Route path="/parents/financial/:parentId" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "bursar"]}><ParentFinancialDetailsPage /></ProtectedRoute>} />

                    <Route path="/dashboard/website" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor", "principal"]}><WebsiteManagement /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor"]}><SettingsPage /></ProtectedRoute>} />
                    <Route path="/settings/grading-scales" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} allowedAdminTypes={["proprietor"]}><GradingScalesPage /></ProtectedRoute>} />

                    <Route path="/change-password" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT]}><ChangePasswordPage /></ProtectedRoute>} />

                    <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]}><TeacherDashboardPage /></ProtectedRoute>} />
                    <Route path="/teacher-students" element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]}><TeacherStudentsPage /></ProtectedRoute>} />

                    <Route path="/parent-dashboard" element={<ProtectedRoute allowedRoles={[ROLES.PARENT]}><ParentDashboardPage /></ProtectedRoute>} />
                    <Route path="/parent-results" element={<ProtectedRoute allowedRoles={[ROLES.PARENT]}><ParentResultsPage /></ProtectedRoute>} />
                    <Route path="/parent-attendance" element={<ProtectedRoute allowedRoles={[ROLES.PARENT]}><ParentAttendancePage /></ProtectedRoute>} />
                    <Route path="/parent/payments" element={<ProtectedRoute allowedRoles={[ROLES.PARENT]}><ParentPaymentsPage /></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
