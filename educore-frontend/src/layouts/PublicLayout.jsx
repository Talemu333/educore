import {
    useState
} from "react";

import {
    Outlet,
    Link,
    NavLink
} from "react-router-dom";

import {
    useWebsitePage
} from "@/hooks/useWebsite";

import {
    useSchoolSettings
} from "@/hooks/useSchoolSettings";


const NAVIGATION = [

    {
        label: "Home",
        path: "/website"
    },

    {
        label: "About",
        path: "/website/about"
    },

    {
        label: "Academics",
        path: "/website/academics"
    },

    {
        label: "Admissions",
        path: "/website/admissions"
    },

    {
        label: "News",
        path: "/website/news"
    },

    {
        label: "Gallery",
        path: "/website/gallery"
    },

    {
        label: "Events",
        path: "/website/events"
    },

    {
        label: "Contact",
        path: "/website/contact"
    }

];


function PublicLayout() {

    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    const {
        data: home
    } = useWebsitePage("home");


    const {
        data: settings
    } = useSchoolSettings();


    const primaryColor =
        settings?.primary_color ||
        "#1D4ED8";


    const schoolName =
        settings?.school_name ||
        "EduCore School";


    const schoolAddress =
        settings?.school_address ||
        "School address coming soon";


    const schoolPhone =
        settings?.school_phone ||
        "";


    const schoolEmail =
        settings?.school_email ||
        "";


    const closeMobileMenu = () => {

        setMobileMenuOpen(false);

    };


    return (

        <div className="min-h-screen bg-white text-slate-900">


            {/* ==================================================
                HEADER
            ================================================== */}

            <header
                className="
                    sticky
                    top-0
                    z-50
                    border-b
                    border-slate-200
                    bg-white/95
                    shadow-sm
                    backdrop-blur
                "
            >

                <div
                    className="
                        mx-auto
                        flex
                        h-[76px]
                        max-w-7xl
                        items-center
                        justify-between
                        px-4
                        sm:px-6
                        lg:px-8
                    "
                >


                    {/* ==============================
                        LOGO
                    ============================== */}

                    <Link
                        to="/website"
                        onClick={
                            closeMobileMenu
                        }
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                        "
                    >

                        {settings?.school_logo ? (

                            <img
                                src={
                                    settings.school_logo
                                }
                                alt={
                                    `${schoolName} logo`
                                }
                                className="
                                    h-11
                                    w-11
                                    shrink-0
                                    rounded-full
                                    border
                                    border-slate-200
                                    bg-white
                                    object-contain
                                    p-1
                                    shadow-sm
                                "
                            />

                        ) : (

                            /* Temporary EduCore logo */

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-sm
                                    font-extrabold
                                    text-white
                                    shadow-sm
                                "
                                style={{
                                    backgroundColor:
                                        primaryColor
                                }}
                            >

                                E

                            </div>

                        )}


                        <div className="min-w-0">

                            <p
                                className="
                                    truncate
                                    text-base
                                    font-extrabold
                                    tracking-tight
                                    text-slate-900
                                    sm:text-lg
                                "
                            >

                                {schoolName}

                            </p>


                            <p
                                className="
                                    hidden
                                    text-[11px]
                                    font-medium
                                    tracking-wide
                                    text-slate-500
                                    sm:block
                                "
                            >

                                {
                                    settings?.school_motto ||
                                    "Excellence • Character • Knowledge"
                                }

                            </p>

                        </div>

                    </Link>


                    {/* ==================================================
                        DESKTOP NAVIGATION
                    ================================================== */}

                    <nav
                        className="
                            hidden
                            items-center
                            gap-1
                            lg:flex
                        "
                    >

                        {NAVIGATION.map(
                            item => (

                                <NavLink
                                    key={
                                        item.path
                                    }
                                    to={
                                        item.path
                                    }
                                    end={
                                        item.path ===
                                        "/website"
                                    }
                                    className={( {
                                        isActive
                                    }) => `

                                        relative
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        font-semibold
                                        transition-colors

                                        ${
                                            isActive
                                                ? "text-slate-900"
                                                : "text-slate-600 hover:text-slate-900"
                                        }

                                    `}
                                >

                                    {({
                                        isActive
                                    }) => (

                                        <>

                                            {item.label}


                                            {isActive && (

                                                <span
                                                    className="
                                                        absolute
                                                        -bottom-[20px]
                                                        left-1/2
                                                        h-0.5
                                                        w-6
                                                        -translate-x-1/2
                                                        rounded-full
                                                    "
                                                    style={{
                                                        backgroundColor:
                                                            primaryColor
                                                    }}
                                                />

                                            )}

                                        </>

                                    )}

                                </NavLink>

                            )
                        )}


                        {/* ==================================================
                            SIGN IN BUTTON
                        ================================================== */}

                        <Link
                            to="/"
                            className="
                                ml-3
                                rounded-lg
                                border
                                px-4
                                py-2
                                text-sm
                                font-bold
                                transition
                                hover:-translate-y-0.5
                                hover:shadow-sm
                            "
                            style={{
                                borderColor:
                                    primaryColor,

                                color:
                                    primaryColor
                            }}
                        >

                            Sign In

                        </Link>


                        {/* ==================================================
                            APPLY BUTTON
                        ================================================== */}

                        <Link
                            to="/website/admissions"
                            className="
                                rounded-lg
                                px-5
                                py-2.5
                                text-sm
                                font-bold
                                text-white
                                shadow-sm
                                transition
                                hover:-translate-y-0.5
                                hover:shadow-md
                            "
                            style={{
                                backgroundColor:
                                    primaryColor
                            }}
                        >

                            Apply Now

                        </Link>

                    </nav>


                    {/* ==================================================
                        MOBILE BUTTON
                    ================================================== */}

                    <button
                        type="button"
                        aria-label={
                            mobileMenuOpen
                                ? "Close navigation"
                                : "Open navigation"
                        }
                        aria-expanded={
                            mobileMenuOpen
                        }
                        onClick={() =>
                            setMobileMenuOpen(
                                previous =>
                                    !previous
                            )
                        }
                        className="
                            inline-flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-700
                            transition
                            hover:bg-slate-50
                            lg:hidden
                        "
                    >

                        {mobileMenuOpen ? (

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="h-5 w-5"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                />

                            </svg>

                        ) : (

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="h-5 w-5"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />

                            </svg>

                        )}

                    </button>

                </div>


                {/* ==================================================
                    MOBILE NAVIGATION
                ================================================== */}

                {mobileMenuOpen && (

                    <div
                        className="
                            border-t
                            border-slate-200
                            bg-white
                            px-4
                            py-4
                            lg:hidden
                        "
                    >

                        <nav className="mx-auto max-w-7xl">

                            <div className="flex flex-col gap-1">

                                {NAVIGATION.map(
                                    item => (

                                        <NavLink
                                            key={
                                                item.path
                                            }
                                            to={
                                                item.path
                                            }
                                            end={
                                                item.path ===
                                                "/website"
                                            }
                                            onClick={
                                                closeMobileMenu
                                            }
                                            className={( {
                                                isActive
                                            }) => `

                                                rounded-lg
                                                px-4
                                                py-3
                                                text-sm
                                                font-semibold
                                                transition

                                                ${
                                                    isActive
                                                        ? "text-white"
                                                        : "text-slate-700 hover:bg-slate-100"
                                                }

                                            `}
                                            style={( {
                                                isActive
                                            }) =>
                                                isActive
                                                    ? {
                                                        backgroundColor:
                                                            primaryColor
                                                    }
                                                    : undefined
                                            }
                                        >

                                            {item.label}

                                        </NavLink>

                                    )
                                )}

                            </div>


                            {/* ==================================================
                                MOBILE SIGN IN
                            ================================================== */}

                            <Link
                                to="/"
                                onClick={
                                    closeMobileMenu
                                }
                                className="
                                    mt-3
                                    block
                                    rounded-lg
                                    border
                                    px-4
                                    py-3
                                    text-center
                                    text-sm
                                    font-bold
                                    transition
                                "
                                style={{
                                    borderColor:
                                        primaryColor,

                                    color:
                                        primaryColor
                                }}
                            >

                                Sign In

                            </Link>


                            {/* ==================================================
                                MOBILE CTA
                            ================================================== */}

                            <Link
                                to="/website/admissions"
                                onClick={
                                    closeMobileMenu
                                }
                                className="
                                    mt-2
                                    block
                                    rounded-lg
                                    px-4
                                    py-3
                                    text-center
                                    text-sm
                                    font-bold
                                    text-white
                                "
                                style={{
                                    backgroundColor:
                                        primaryColor
                                }}
                            >

                                Apply Now

                            </Link>

                        </nav>

                    </div>

                )}

            </header>


            {/* ==================================================
                MAIN WEBSITE CONTENT
            ================================================== */}

            <main>

                <Outlet />

            </main>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer
                className="
                    border-t
                    border-slate-800
                    bg-slate-950
                    text-white
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-7xl
                        px-4
                        py-14
                        sm:px-6
                        lg:px-8
                    "
                >

                    <div
                        className="
                            grid
                            gap-10
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >


                        {/* ==============================
                            SCHOOL
                        ============================== */}

                        <div className="lg:col-span-2">

                            <div className="flex items-center gap-3">

                                {settings?.school_logo ? (

                                    <img
                                        src={
                                            settings.school_logo
                                        }
                                        alt={
                                            `${schoolName} logo`
                                        }
                                        className="
                                            h-12
                                            w-12
                                            rounded-full
                                            bg-white
                                            object-contain
                                            p-1
                                        "
                                    />

                                ) : (

                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-full
                                            text-lg
                                            font-extrabold
                                            text-white
                                        "
                                        style={{
                                            backgroundColor:
                                                primaryColor
                                        }}
                                    >

                                        E

                                    </div>

                                )}


                                <div>

                                    <h2 className="text-lg font-bold">

                                        {schoolName}

                                    </h2>

                                    <p className="hidden text-xs text-muted-foreground sm:block">

                                        {
                                            settings?.school_motto ||
                                            "Excellence • Character • Knowledge"
                                        }

                                    </p>

                                </div>

                            </div>


                            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">

                                {schoolName} is committed
                                to providing a nurturing
                                environment where children
                                can learn, grow, discover
                                their talents and develop
                                the character and knowledge
                                needed for a successful future.

                            </p>


                            {/* SOCIAL ICONS */}

                            <div className="mt-6 flex gap-2">

                                {[
                                    "Facebook",
                                    "Instagram",
                                    "YouTube"
                                ].map(
                                    social => (

                                        <button
                                            key={
                                                social
                                            }
                                            type="button"
                                            className="
                                                flex
                                                h-9
                                                w-9
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-slate-700
                                                text-xs
                                                font-bold
                                                text-slate-400
                                                transition
                                                hover:border-slate-500
                                                hover:text-white
                                            "
                                            title={
                                                `${social} coming soon`
                                            }
                                        >

                                            {social[0]}

                                        </button>

                                    )
                                )}

                            </div>

                        </div>


                        {/* ==============================
                            QUICK LINKS
                        ============================== */}

                        <div>

                            <h3 className="font-semibold">

                                Quick Links

                            </h3>


                            <div className="mt-5 flex flex-col gap-3">

                                {NAVIGATION.map(
                                    item => (

                                        <Link
                                            key={
                                                item.path
                                            }
                                            to={
                                                item.path
                                            }
                                            className="
                                                text-sm
                                                text-slate-400
                                                transition
                                                hover:text-white
                                            "
                                        >

                                            {item.label}

                                        </Link>

                                    )
                                )}

                                {/* FOOTER SIGN IN */}

                                <Link
                                    to="/"
                                    className="
                                        text-sm
                                        font-semibold
                                        transition
                                        hover:text-white
                                    "
                                    style={{
                                        color:
                                            primaryColor
                                    }}
                                >

                                    Sign In

                                </Link>

                            </div>

                        </div>


                        {/* ==============================
                            CONTACT
                        ============================== */}

                        <div>

                            <h3 className="font-semibold">

                                Contact Us

                            </h3>


                            <div className="mt-5 space-y-4 text-sm text-slate-400">

                                <div className="flex gap-3">

                                    <span
                                        className="mt-0.5"
                                        style={{
                                            color:
                                                primaryColor
                                        }}
                                    >

                                        ●

                                    </span>

                                    <span>

                                        {schoolAddress}

                                    </span>

                                </div>


                                {schoolPhone && (

                                    <div className="flex gap-3">

                                        <span
                                            style={{
                                                color:
                                                    primaryColor
                                            }}
                                        >

                                            ●

                                        </span>

                                        <span>

                                            {schoolPhone}

                                        </span>

                                    </div>

                                )}


                                {schoolEmail && (

                                    <div className="flex gap-3">

                                        <span
                                            style={{
                                                color:
                                                    primaryColor
                                            }}
                                        >

                                            ●

                                        </span>

                                        <span className="break-all">

                                            {schoolEmail}

                                        </span>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        BOTTOM FOOTER
                    ================================================== */}

                    <div
                        className="
                            mt-12
                            flex
                            flex-col
                            gap-3
                            border-t
                            border-slate-800
                            pt-6
                            text-xs
                            text-slate-500
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <p>

                            ©{" "}
                            {new Date().getFullYear()}
                            {" "}
                            {schoolName}.
                            {" "}
                            All rights reserved.

                        </p>


                        <p>

                            Powered by{" "}

                            <span className="font-semibold text-slate-400">

                                EduCore

                            </span>

                        </p>

                    </div>

                </div>

            </footer>

        </div>

    );

}


export default PublicLayout;