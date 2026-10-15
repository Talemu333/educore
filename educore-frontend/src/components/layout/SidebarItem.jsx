import {
    useState,
    useEffect
} from "react";

import {
    useAuth
} from "@/context/AuthContext";

import {
    useNavigate,
    NavLink,
    useLocation
} from "react-router-dom";

import {
    ChevronDown,
    ChevronRight
} from "lucide-react";


function preserveSidebarScroll() {
    const nav = document.querySelector(".school-sidebar nav");
    if (nav) {
        sessionStorage.setItem("schoolSidebarScrollTop", String(nav.scrollTop));
    }
}


function SidebarItem({
    icon: Icon,
    title,
    path,
    children,
    onClose
}) {

    const location = useLocation();
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const hasChildren =
        children && children.length > 0;

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            await logoutUser();
            onClose?.();
            navigate("/login", { replace: true });
        } catch (error) {
            setIsLoggingOut(false);
            console.error("Logout failed:", error);
        }
    };

    if (title === "Logout") {
        return (
            <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`
                    flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                    text-left text-sm font-medium text-slate-400
                    transition-all duration-150
                    ${
                        isLoggingOut
                            ? "cursor-not-allowed opacity-60"
                            : "hover:bg-red-500/10 hover:text-red-300"
                    }
                `}
            >
                <Icon size={18} strokeWidth={1.9} />
                <span>{isLoggingOut ? "Logging out..." : title}</span>
            </button>
        );
    }

    const isChildActive =
        hasChildren &&
        children.some(child =>
            location.pathname === child.path ||
            (child.path !== "/" && location.pathname.startsWith(child.path + "/"))
        );

    const [
        isOpen,
        setIsOpen
    ] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) setIsOpen(true);
    }, [isChildActive, location.pathname]);

    if (hasChildren) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex w-full min-h-11 items-center justify-between gap-2 rounded-xl
                        px-2.5 py-2 text-xs leading-4 font-medium transition-all duration-150
                        ${
                            isChildActive
                                ? "school-sidebar-group-active"
                                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                        }
                    `}
                >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                        <Icon className="shrink-0" size={17} strokeWidth={1.9} />
                        <span className="min-w-0 flex-1 whitespace-nowrap text-left text-[12px] tracking-tight">{title}</span>
                    </span>

                    {isOpen ? (
                        <ChevronDown className="shrink-0" size={16} />
                    ) : (
                        <ChevronRight className="shrink-0" size={16} />
                    )}
                </button>

                {isOpen && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                        {children.map(child => (
                            <NavLink
                                key={child.path}
                                to={child.path}
                                end
                                onClick={() => {
                                    preserveSidebarScroll();
                                    onClose?.();
                                }}
                                className={({ isActive }) => `
                                    block rounded-lg px-3 py-2 text-sm transition-colors
                                    ${
                                        isActive
                                            ? "school-sidebar-child-active"
                                            : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                                    }
                                `}
                            >
                                {child.title}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <NavLink
            to={path}
            end
            onClick={() => {
                preserveSidebarScroll();
                onClose?.();
            }}
            className={({ isActive }) => `
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                font-medium transition-all duration-150
                ${
                    isActive
                        ? "school-sidebar-active"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }
            `}
        >
            <Icon size={18} strokeWidth={1.9} />
            <span>{title}</span>
        </NavLink>
    );
}


export default SidebarItem;