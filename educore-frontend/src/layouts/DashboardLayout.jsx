import { useState } from "react";

import {
    Outlet,
    useLocation,
    useNavigate
} from "react-router-dom";

import { LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";


function DashboardLayout() {

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { logoutUser } = useAuth();

    const isMainDashboard =
        location.pathname === "/dashboard";


    const handleLogout = async () => {

        await logoutUser();

        navigate("/", {
            replace: true
        });

    };


    return (

        <div className="flex min-h-screen bg-slate-50 text-slate-900">

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() =>
                    setSidebarOpen(false)
                }
            />

            <main className="min-w-0 flex-1">

                <Navbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <section className="relative mx-auto w-full max-w-[1600px] p-4 sm:p-5 md:p-6 lg:p-8">

                    {isMainDashboard && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:right-5 sm:top-5 md:right-6 md:top-6 lg:right-8 lg:top-8"
                            aria-label="Logout"
                        >
                            <LogOut
                                size={17}
                                strokeWidth={2}
                            />
                            <span>Logout</span>
                        </button>
                    )}

                    <Outlet />

                </section>

            </main>

        </div>

    );

}


export default DashboardLayout;