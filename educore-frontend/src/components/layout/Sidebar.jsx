import {
    X,
    Settings
} from "lucide-react";

import sidebarMenu
    from "../../constants/sidebarMenu";

import SidebarItem
    from "./SidebarItem";

import {
    useAuth
} from "@/context/AuthContext";


function Sidebar({
    isOpen,
    onClose
}) {

    const {
        user
    } = useAuth();

    const role =
        user?.role_name;

    const adminType =
        user?.admin_type;


    const canAccess = (
        item
    ) => {

        if (
            item.roles &&
            !item.roles.includes(role)
        ) {
            return false;
        }

        if (
            role === "Admin" &&
            item.adminTypes &&
            !item.adminTypes.includes(
                adminType?.toLowerCase()
            )
        ) {
            return false;
        }

        return true;

    };


    const filteredMenu =
        role === "Super Admin"
            ? [
                {
                    title: "School Management",
                    icon: Settings,
                    path: "/settings"
                }
            ]
            : sidebarMenu
                .filter(canAccess)
                .map(item => {

                    if (!item.children) {
                        return item;
                    }

                    const children =
                        item.children.filter(
                            canAccess
                        );

                    if (children.length === 0) {
                        return null;
                    }

                    return {
                        ...item,
                        children
                    };
                })
                .filter(Boolean);


    const displayName =
        user?.full_name ||
        user?.name ||
        "User";

    const initials =
        displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase() || "U";


    return (

        <aside
            className={`
                fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col
                border-r border-slate-800 bg-slate-950 text-slate-100
                shadow-2xl transition-transform duration-300
                lg:static lg:z-auto lg:translate-x-0 lg:shadow-none
                ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
            `}
        >

            <div className="border-b border-slate-800 px-5 py-5">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white shadow-lg shadow-blue-950/30">
                            EC
                        </div>

                        <div>
                            <h1 className="text-base font-extrabold tracking-wide text-white">
                                EDUCORE
                            </h1>
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                                School Management
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
                        aria-label="Close navigation menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-900/80 p-3 ring-1 ring-inset ring-slate-800">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">
                            {displayName}
                        </p>
                        <p className="truncate text-xs capitalize text-slate-400">
                            {adminType?.replace(/_/g, " ") || role || "Account"}
                        </p>
                    </div>
                </div>

            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">

                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Main Menu
                </p>

                <div className="space-y-1">
                    {filteredMenu.map(item => (
                        <SidebarItem
                            key={
                                item.path ||
                                item.title
                            }
                            {...item}
                            onClose={onClose}
                        />
                    ))}
                </div>

            </nav>

            <div className="border-t border-slate-800 px-4 py-3">
                <p className="text-center text-[10px] font-medium text-slate-500">
                    EduCore • School Administration
                </p>
            </div>

        </aside>

    );

}

export default Sidebar;
