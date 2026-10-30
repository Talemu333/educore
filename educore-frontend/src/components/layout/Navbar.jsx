import { useState } from "react";
import { Bell, Menu, Search, ChevronDown, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function Navbar({ onMenuClick }) {
    const location = useLocation();
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [imageFailed, setImageFailed] = useState(false);
    const handleLogout = async () => {
        await logoutUser();
        navigate("/login", { replace: true });
    };
    const displayName = user?.full_name || user?.name || "User";
    const roleLabel = user?.admin_type?.replace(/_/g, " ") || user?.role_name || "Account";
    const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

    return (
        <header className="sticky top-0 z-30 flex h-[78px] items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-6">
            <button type="button" onClick={onMenuClick} aria-label="Open navigation menu" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"><Menu size={22}/></button>
            <div className="min-w-0">
                <p className="text-sm font-bold text-blue-950">School Dashboard</p>
                <p className="text-[10px] text-slate-500">Management overview</p>
            </div>
            <div className="ml-auto hidden w-full max-w-[250px] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 md:flex">
                <Search size={17} className="shrink-0 text-slate-400"/><input aria-label="Search" placeholder="Search anything..." className="w-full border-0 bg-transparent p-0 text-xs outline-none focus:ring-0"/>
            </div>
            <button type="button" aria-label="Notifications" className="relative ml-1 rounded-xl p-2.5 text-blue-950 hover:bg-blue-50"><Bell size={21}/><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"/></button>
            <div className="ml-1 flex min-w-0 items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-blue-900">{user?.profile_image_url && !imageFailed ? <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" onError={() => setImageFailed(true)}/> : initials}</div>
                <div className="hidden min-w-0 sm:block"><p className="max-w-36 truncate text-xs font-bold text-blue-950">{displayName}</p><p className="max-w-36 truncate text-[10px] capitalize text-slate-500">{roleLabel}</p></div>
                <ChevronDown size={16} className="hidden shrink-0 text-blue-900 sm:block"/>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out" className="ml-1 inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200">
                <LogOut size={16}/>
                <span className="hidden sm:inline">Log out</span>
            </button>
        </header>
    );
}
export default Navbar;
