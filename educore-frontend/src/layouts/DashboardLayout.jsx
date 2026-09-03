import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ContactMessagesPage from "../pages/dashboard/ContactMessagesPage";
import { useAuth } from "@/context/AuthContext";

function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    const isContactMessagesPage =
        location.pathname === "/contact-messages";

    const canViewContactMessages =
        user?.role_name?.trim()?.toLowerCase() === "admin" &&
        ["proprietor", "principal"].includes(
            user?.admin_type?.trim()?.toLowerCase()
        );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="min-w-0 lg:ml-[272px]">
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <section className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 md:p-6 lg:p-8">
                    {isContactMessagesPage && canViewContactMessages ? (
                        <ContactMessagesPage />
                    ) : (
                        children || <Outlet />
                    )}
                </section>
            </main>
        </div>
    );
}

export default DashboardLayout;
