import {
    Menu
} from "lucide-react";


function Navbar({
    onMenuClick
}) {

    return (

        <header
            className="
                sticky
                top-0
                z-30
                flex
                items-center
                gap-3
                bg-white
                px-4
                py-4
                shadow
                sm:px-5
                md:px-6
                lg:px-8
            "
        >


            {/* MOBILE MENU BUTTON */}

            <button

                type="button"

                onClick={onMenuClick}

                className="
                    rounded-md
                    p-2
                    transition-colors
                    hover:bg-gray-100
                    lg:hidden
                "

                aria-label="Open menu"

            >

                <Menu className="h-6 w-6" />

            </button>



            {/* PAGE TITLE */}

            <h2 className="truncate text-lg font-semibold sm:text-xl">

                Dashboard

            </h2>


        </header>

    );

}


export default Navbar;