import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ContactMessagesPage from "../pages/dashboard/ContactMessagesPage";
import { useAuth } from "@/context/AuthContext";
import { useSchoolTheme } from "@/context/SchoolThemeContext";

function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();
    const { theme } = useSchoolTheme();
    const isContactMessagesPage = location.pathname === "/contact-messages";
    const canViewContactMessages = user?.role_name?.trim()?.toLowerCase() === "admin" &&
        ["proprietor", "principal"].includes(user?.admin_type?.trim()?.toLowerCase());

    return (
        <div style={{ backgroundColor: theme.primarySoft }} className="min-h-screen text-slate-900">
            {sidebarOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden" onClick={() => setSidebarOpen(false)}/>}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
            <main style={{ backgroundColor: theme.primarySoft }} className="min-w-0 lg:ml-[254px]">
                <Navbar onMenuClick={() => setSidebarOpen(true)}/>
                <section className="mx-auto w-full max-w-[1800px] p-4 sm:p-5 lg:p-7">
                    {isContactMessagesPage && canViewContactMessages ? <ContactMessagesPage/> : children || <Outlet/>}
                </section>
            </main>
        </div>
    );
}
export default DashboardLayout;
