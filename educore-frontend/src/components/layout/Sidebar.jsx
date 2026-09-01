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


    /*
    Super Admin has a dedicated platform
    entry point. The existing school menu
    remains unchanged for school users.
    */
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


    return (

        <aside
            className={`
                fixed
                inset-y-0
                left-0
                z-50
                flex
                w-64
                flex-col
                bg-blue-700
                text-white
                shadow-xl
                transition-transform
                duration-300
                lg:static
                lg:z-auto
                lg:translate-x-0
                lg:shadow-none
                ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
            `}
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-blue-600
                    p-6
                "
            >

                <h1 className="text-2xl font-bold">
                    EDUCORE
                </h1>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-2 transition-colors hover:bg-blue-600 lg:hidden"
                    aria-label="Close menu"
                >
                    <X className="h-5 w-5" />
                </button>

            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto p-4">

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

            </nav>

        </aside>

    );

}

export default Sidebar;
