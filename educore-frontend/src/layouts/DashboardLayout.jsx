import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default DashboardLayout;
