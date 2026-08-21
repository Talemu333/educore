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

    const location =
        useLocation();


    const navigate =
        useNavigate();


    const {
        logoutUser
    } = useAuth();



    /*
    =====================================
    CHECK CHILDREN
    =====================================
    */

    const hasChildren =
        children &&
        children.length > 0;



    /*
    =====================================
    LOGOUT
    =====================================
    */

    const handleLogout =
        async () => {

            await logoutUser();


            /*
            Close mobile sidebar
            before navigating.
            */

            onClose?.();


            navigate(
                "/",
                {
                    replace: true
                }
            );

        };



    /*
    =====================================
    LOGOUT ITEM
    =====================================
    */

    if (
        title === "Logout"
    ) {

        return (

            <button

                type="button"

                onClick={
                    handleLogout
                }

                className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-4
                    py-3
                    text-left
                    text-white
                    transition-colors
                    hover:bg-blue-600
                "

            >

                <Icon size={20} />


                <span>

                    {title}

                </span>

            </button>

        );

    }



    /*
    =====================================
    CHECK ACTIVE CHILD
    =====================================
    */

    const isChildActive =

        hasChildren &&

        children.some(

            child =>
                location.pathname ===
                child.path

        );



    /*
    =====================================
    EXPANDED STATE
    =====================================
    */

    const [

        isOpen,

        setIsOpen

    ] = useState(

        isChildActive

    );



    /*
    =====================================
    EXPANDABLE MENU
    =====================================
    */

    if (
        hasChildren
    ) {

        return (

            <div>

                <button

                    type="button"

                    onClick={() =>

                        setIsOpen(
                            !isOpen
                        )

                    }

                    className={`

                        flex
                        w-full
                        items-center
                        justify-between
                        gap-3
                        rounded-lg
                        px-4
                        py-3
                        transition-colors

                        ${

                            isChildActive

                                ? "bg-blue-600 font-semibold"

                                : "text-white hover:bg-blue-600"

                        }

                    `}

                >

                    <div className="flex items-center gap-3">

                        <Icon size={20} />


                        <span>

                            {title}

                        </span>

                    </div>


                    {

                        isOpen

                            ? (

                                <ChevronDown size={18} />

                            )

                            : (

                                <ChevronRight size={18} />

                            )

                    }

                </button>



                {

                    isOpen && (

                        <div className="ml-5 mt-1 space-y-1 border-l border-blue-500 pl-3">

                            {

                                children.map(

                                    child => (

                                        <NavLink

                                            key={
                                                child.path
                                            }

                                            to={
                                                child.path
                                            }

                                            end


                                            /*
                                            Close the
                                            mobile sidebar
                                            after navigation.
                                            */

                                            onClick={
                                                () =>
                                                    onClose?.()
                                            }


                                            className={(
                                                {
                                                    isActive
                                                }
                                            ) => `

                                                block
                                                rounded-md
                                                px-3
                                                py-2
                                                text-sm
                                                transition-colors

                                                ${

                                                    isActive

                                                        ? "bg-white text-blue-700 font-semibold"

                                                        : "text-blue-100 hover:bg-blue-600 hover:text-white"

                                                }

                                            `}

                                        >

                                            {
                                                child.title
                                            }

                                        </NavLink>

                                    )

                                )

                            }

                        </div>

                    )

                }

            </div>

        );

    }



    /*
    =====================================
    NORMAL MENU ITEM
    =====================================
    */

    return (

        <NavLink

            to={path}


            /*
            Close mobile sidebar
            when a page is selected.
            */

            onClick={
                () =>
                    onClose?.()
            }


            className={

                (
                    {
                        isActive
                    }
                ) => `

                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-4
                    py-3
                    transition-colors

                    ${

                        isActive

                            ? "bg-white text-blue-700 font-semibold"

                            : "text-white hover:bg-blue-600"

                    }

                `

            }

        >

            <Icon size={20} />


            <span>

                {title}

            </span>

        </NavLink>

    );

}


export default SidebarItem;