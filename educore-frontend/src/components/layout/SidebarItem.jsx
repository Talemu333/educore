import {
    useState
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

    const hasChildren =
        children && children.length > 0;

    const handleLogout = async () => {
        await logoutUser();
        onClose?.();
        navigate("/", { replace: true });
    };

    if (title === "Logout") {
        return (
            <button
                type="button"
                onClick={handleLogout}
                className="
                    flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                    text-left text-sm font-medium text-slate-400
                    transition-all duration-150
                    hover:bg-red-500/10 hover:text-red-300
                "
            >
                <Icon size={18} strokeWidth={1.9} />
                <span>{title}</span>
            </button>
        );
    }

    const isChildActive =
        hasChildren &&
        children.some(child =>
            location.pathname === child.path
        );

    const [
        isOpen,
        setIsOpen
    ] = useState(isChildActive);

    if (hasChildren) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex w-full items-center justify-between gap-3 rounded-xl
                        px-3 py-2.5 text-sm font-medium transition-all duration-150
                        ${
                            isChildActive
                                ? "bg-blue-500/15 text-blue-300"
                                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                        }
                    `}
                >
                    <span className="flex items-center gap-3">
                        <Icon size={18} strokeWidth={1.9} />
                        <span>{title}</span>
                    </span>

                    {isOpen ? (
                        <ChevronDown size={16} />
                    ) : (
                        <ChevronRight size={16} />
                    )}
                </button>

                {isOpen && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                        {children.map(child => (
                            <NavLink
                                key={child.path}
                                to={child.path}
                                end
                                onClick={() => onClose?.()}
                                className={({ isActive }) => `
                                    block rounded-lg px-3 py-2 text-sm transition-colors
                                    ${
                                        isActive
                                            ? "bg-blue-500/10 font-semibold text-blue-300"
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
            onClick={() => onClose?.()}
            className={({ isActive }) => `
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                font-medium transition-all duration-150
                ${
                    isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-950/30"
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
