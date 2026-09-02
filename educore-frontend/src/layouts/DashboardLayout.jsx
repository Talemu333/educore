import { useState } from "react";
import { LogOut } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logoutUser } = useAuth();

    const normalizedRole = String(user?.role_name || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

    const normalizedAdminType = String(user?.admin_type || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

    const isSuperAdmin =
        normalizedRole === "superadmin" ||
        normalizedAdminType === "superadmin";

    const handleLogout = async () => {
        await logoutUser();
        navigate("/", { replace: true });
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
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

            <main className="min-w-0 flex-1">
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <section className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 md:p-6 lg:p-8">
                    {location.pathname === "/dashboard" && isSuperAdmin && (
                        <div className="mb-3 flex justify-end">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                                aria-label="Logout"
                            >
                                <LogOut size={17} strokeWidth={2} />
                                Logout
                            </button>
                        </div>
                    )}
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default DashboardLayout;
