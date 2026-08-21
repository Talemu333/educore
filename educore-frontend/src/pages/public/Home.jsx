import { Link } from "react-router-dom";

import { useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

import Loading from "@/components/common/Loading";


function Home() {

    /*
    =========================================
    LOAD HOME PAGE
    =========================================
    */

    const {
        data: page,
        isLoading,
        isError
    } = useWebsitePage("home");


    /*
    =========================================
    LOAD SCHOOL SETTINGS
    =========================================
    */

    const {
        data: settings
    } = useSchoolSettings();


    /*
    =========================================
    PRIMARY COLOR
    =========================================
    */

    const primaryColor =
        settings?.primary_color ||
        "#1D4ED8";


    /*
    =========================================
    LOADING STATE
    =========================================
    */

    if (isLoading) {

        return (
            <Loading
                message="Loading website..."
            />
        );

    }


    /*
    =========================================
    ERROR STATE
    =========================================
    */

    if (isError || !page) {

        return (

            <div
                className="
                    flex
                    min-h-[70vh]
                    items-center
                    justify-center
                    px-4
                    sm:px-6
                "
            >

                <div className="w-full max-w-xl text-center">

                    <h1
                        className="
                            break-words
                            text-3xl
                            font-bold
                            text-slate-900
                            sm:text-4xl
                        "
                    >

                        {settings?.school_name || "EduCore"}

                    </h1>


                    <p className="mt-4 text-sm text-slate-600 sm:text-base">

                        Welcome to our school website.

                    </p>

                </div>

            </div>

        );

    }


    /*
    =========================================
    SECTIONS
    =========================================
    */

    const sections =
        page.sections || [];


    /*
    =========================================
    FIND SECTION BY KEY
    =========================================
    */

    const getSection = (key) => {

        return sections.find(
            section =>
                section.section_key === key
        );

    };


    /*
    =========================================
    HOME SECTIONS
    =========================================
    */

    const hero =
        getSection("hero");

    const welcome =
        getSection("welcome");

    const schoolLevels =
        getSection("school_levels");

    const primary =
        getSection("primary");

    const juniorSecondary =
        getSection("junior_secondary");

    const seniorSecondary =
        getSection("senior_secondary");

    const whyChoose =
        getSection("why_choose");

    const qualityEducation =
        getSection("quality_education");

    const caringEnvironment =
        getSection("caring_environment");

    const criticalThinking =
        getSection("critical_thinking");

    const characterDevelopment =
        getSection("character_development");

    const schoolLife =
        getSection("school_life");

    const admissionsCta =
        getSection("admissions_cta");


    /*
    =========================================
    WHY CHOOSE FEATURES
    =========================================
    */

    const features = [

        qualityEducation,

        caringEnvironment,

        criticalThinking,

        characterDevelopment

    ].filter(Boolean);


    /*
    =========================================
    SCHOOL LEVELS
    =========================================
    */

    const schoolLevelSections = [

        primary,

        juniorSecondary,

        seniorSecondary

    ].filter(Boolean);


    /*
    =========================================
    RENDER
    =========================================
    */

    return (

        <div
            className="
                w-full
                max-w-full
                overflow-x-hidden
                bg-white
            "
        >


            {/* =========================================
                HERO
            ========================================= */}

            {hero && (

                <section className="relative overflow-hidden">

                    <div
                        className="
                            grid
                            min-h-0
                            lg:min-h-[650px]
                            lg:grid-cols-2
                        "
                    >


                        {/* =================================
                            LEFT CONTENT
                        ================================= */}

                        <div
                            className="
                                flex
                                items-center
                                bg-slate-950
                                px-5
                                py-14
                                text-white
                                sm:px-8
                                sm:py-20
                                lg:px-12
                                lg:py-20
                                xl:px-20
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    w-full
                                    max-w-xl
                                "
                            >


                                {/* SCHOOL LOGO */}

                                <div
                                    className="
                                        mb-7
                                        flex
                                        min-w-0
                                        items-center
                                        gap-3
                                        sm:mb-8
                                    "
                                >

                                    {settings?.school_logo ? (

                                        <img
                                            src={
                                                settings.school_logo
                                            }
                                            alt={
                                                settings?.school_name ||
                                                "School logo"
                                            }
                                            className="
                                                h-12
                                                w-12
                                                shrink-0
                                                rounded-xl
                                                bg-white
                                                object-contain
                                                p-1
                                                shadow-lg
                                                sm:h-14
                                                sm:w-14
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-white
                                                text-lg
                                                font-extrabold
                                                text-blue-700
                                                shadow-lg
                                                sm:h-14
                                                sm:w-14
                                                sm:text-xl
                                            "
                                        >

                                            EC

                                        </div>

                                    )}


                                    <div className="min-w-0">

                                        <p
                                            className="
                                                truncate
                                                text-base
                                                font-bold
                                                sm:text-lg
                                            "
                                        >

                                            {
                                                settings?.school_name ||
                                                "EduCore"
                                            }

                                        </p>


                                        <p
                                            className="
                                                truncate
                                                text-xs
                                                text-slate-400
                                            "
                                        >

                                            {
                                                settings?.school_level ||
                                                "Primary & Secondary School"
                                            }

                                        </p>

                                    </div>

                                </div>


                                {/* EYEBROW */}

                                {hero.section_subtitle && (

                                    <p
                                        className="
                                            mb-4
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            sm:mb-5
                                            sm:text-sm
                                            sm:tracking-[0.25em]
                                        "
                                        style={{
                                            color: "#60A5FA"
                                        }}
                                    >

                                        {
                                            hero.section_subtitle
                                        }

                                    </p>

                                )}


                                {/* TITLE */}

                                <h1
                                    className="
                                        break-words
                                        text-3xl
                                        font-extrabold
                                        leading-[1.1]
                                        tracking-tight
                                        sm:text-5xl
                                        lg:text-6xl
                                    "
                                >

                                    {
                                        hero.section_title
                                    }

                                </h1>


                                {/* DESCRIPTION */}

                                {hero.section_content && (

                                    <p
                                        className="
                                            mt-5
                                            max-w-lg
                                            text-sm
                                            leading-7
                                            text-slate-300
                                            sm:mt-6
                                            sm:text-lg
                                            sm:leading-8
                                        "
                                    >

                                        {
                                            hero.section_content
                                        }

                                    </p>

                                )}


                                {/* BUTTONS */}

                                <div
                                    className="
                                        mt-7
                                        flex
                                        flex-col
                                        gap-3
                                        sm:mt-8
                                        sm:flex-row
                                    "
                                >


                                    {hero.button_text &&
                                        hero.button_url && (

                                            <Link
                                                to={
                                                    hero.button_url
                                                }
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    px-6
                                                    py-3.5
                                                    text-center
                                                    text-sm
                                                    font-bold
                                                    text-white
                                                    shadow-lg
                                                    transition
                                                    hover:-translate-y-0.5
                                                    hover:shadow-xl
                                                    sm:w-auto
                                                "
                                                style={{
                                                    backgroundColor:
                                                        primaryColor
                                                }}
                                            >

                                                {
                                                    hero.button_text
                                                }

                                            </Link>

                                        )}


                                    <Link
                                        to="/website/about"
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-white/30
                                            px-6
                                            py-3.5
                                            text-center
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-white/10
                                            sm:w-auto
                                        "
                                    >

                                        Discover Our School

                                    </Link>

                                </div>


                                {/* TRUST INDICATORS */}

                                <div
                                    className="
                                        mt-8
                                        grid
                                        grid-cols-3
                                        gap-3
                                        border-t
                                        border-white/10
                                        pt-5
                                        sm:mt-10
                                        sm:gap-6
                                        sm:pt-6
                                    "
                                >


                                    <div className="min-w-0">

                                        <p
                                            className="
                                                truncate
                                                text-base
                                                font-bold
                                                sm:text-2xl
                                            "
                                        >
                                            Excellence
                                        </p>

                                        <p
                                            className="
                                                text-[10px]
                                                text-slate-400
                                                sm:text-xs
                                            "
                                        >
                                            In Education
                                        </p>

                                    </div>


                                    <div className="min-w-0">

                                        <p
                                            className="
                                                truncate
                                                text-base
                                                font-bold
                                                sm:text-2xl
                                            "
                                        >
                                            Primary
                                        </p>

                                        <p
                                            className="
                                                text-[10px]
                                                text-slate-400
                                                sm:text-xs
                                            "
                                        >
                                            School
                                        </p>

                                    </div>


                                    <div className="min-w-0">

                                        <p
                                            className="
                                                truncate
                                                text-base
                                                font-bold
                                                sm:text-2xl
                                            "
                                        >
                                            Secondary
                                        </p>

                                        <p
                                            className="
                                                text-[10px]
                                                text-slate-400
                                                sm:text-xs
                                            "
                                        >
                                            School
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================
                            RIGHT IMAGE
                        ================================= */}

                        <div
                            className="
                                relative
                                min-h-[420px]
                                sm:min-h-[500px]
                                lg:min-h-full
                            "
                        >

                            {hero.image_url ? (

                                <img
                                    src={
                                        hero.image_url
                                    }
                                    alt={
                                        hero.section_title ||
                                        "Students learning"
                                    }
                                    className="
                                        absolute
                                        inset-0
                                        h-full
                                        w-full
                                        object-cover
                                    "
                                />

                            ) : (

                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundColor:
                                            primaryColor
                                    }}
                                />

                            )}


                            {/* IMAGE OVERLAY */}

                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-blue-950/20
                                "
                            />


                            {/* FLOATING CARD */}

                            <div
                                className="
                                    absolute
                                    bottom-5
                                    left-4
                                    right-4
                                    rounded-2xl
                                    bg-white/95
                                    p-4
                                    shadow-2xl
                                    backdrop-blur
                                    sm:bottom-8
                                    sm:left-auto
                                    sm:right-8
                                    sm:w-80
                                    sm:p-5
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                    "
                                    style={{
                                        color:
                                            primaryColor
                                    }}
                                >

                                    Our Promise

                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-base
                                        font-bold
                                        leading-6
                                        text-slate-900
                                        sm:text-lg
                                    "
                                >

                                    Every child deserves the opportunity to discover their potential.

                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        leading-6
                                        text-slate-500
                                    "
                                >

                                    We partner with families to help every learner grow academically, socially and personally.

                                </p>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                WELCOME
            ========================================= */}

            {welcome && (

                <section
                    className="
                        px-5
                        py-14
                        sm:px-8
                        sm:py-20
                        lg:px-16
                    "
                >

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                        "
                    >

                        <div
                            className="
                                grid
                                gap-8
                                lg:grid-cols-2
                                lg:items-center
                                lg:gap-12
                            "
                        >


                            {/* IMAGE */}

                            <div className="relative">

                                {welcome.image_url && (

                                    <img
                                        src={
                                            welcome.image_url
                                        }
                                        alt={
                                            welcome.section_title ||
                                            "Students studying"
                                        }
                                        className="
                                            h-72
                                            w-full
                                            rounded-2xl
                                            object-cover
                                            shadow-xl
                                            sm:h-[450px]
                                            sm:rounded-3xl
                                        "
                                    />

                                )}

                            </div>


                            {/* CONTENT */}

                            <div>

                                {welcome.section_subtitle && (

                                    <p
                                        className="
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            sm:text-sm
                                            sm:tracking-[0.2em]
                                        "
                                        style={{
                                            color:
                                                primaryColor
                                        }}
                                    >

                                        {
                                            welcome.section_subtitle
                                        }

                                    </p>

                                )}


                                <h2
                                    className="
                                        mt-3
                                        text-2xl
                                        font-extrabold
                                        tracking-tight
                                        text-slate-900
                                        sm:mt-4
                                        sm:text-4xl
                                    "
                                >

                                    {
                                        welcome.section_title
                                    }

                                </h2>


                                {welcome.section_content && (

                                    <p
                                        className="
                                            mt-5
                                            text-sm
                                            leading-7
                                            text-slate-600
                                            sm:mt-6
                                            sm:text-base
                                            sm:leading-8
                                        "
                                    >

                                        {
                                            welcome.section_content
                                        }

                                    </p>

                                )}


                                {welcome.button_text &&
                                    welcome.button_url && (

                                        <Link
                                            to={
                                                welcome.button_url
                                            }
                                            className="
                                                mt-6
                                                inline-flex
                                                items-center
                                                text-sm
                                                font-bold
                                                sm:mt-7
                                            "
                                            style={{
                                                color:
                                                    primaryColor
                                            }}
                                        >

                                            {
                                                welcome.button_text
                                            }

                                            <span className="ml-2">
                                                →
                                            </span>

                                        </Link>

                                    )}

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                SCHOOL LEVELS
            ========================================= */}

            {schoolLevels && (

                <section
                    className="
                        bg-slate-50
                        px-5
                        py-14
                        sm:px-8
                        sm:py-20
                        lg:px-16
                    "
                >

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                        "
                    >


                        <div
                            className="
                                mx-auto
                                max-w-2xl
                                text-center
                            "
                        >

                            {schoolLevels.section_subtitle && (

                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.18em]
                                        sm:text-sm
                                        sm:tracking-[0.2em]
                                    "
                                    style={{
                                        color:
                                            primaryColor
                                    }}
                                >

                                    {
                                        schoolLevels.section_subtitle
                                    }

                                </p>

                            )}


                            <h2
                                className="
                                    mt-3
                                    text-2xl
                                    font-extrabold
                                    text-slate-900
                                    sm:text-4xl
                                "
                            >

                                {
                                    schoolLevels.section_title
                                }

                            </h2>


                            {schoolLevels.section_content && (

                                <p
                                    className="
                                        mt-4
                                        text-sm
                                        leading-7
                                        text-slate-600
                                        sm:text-base
                                    "
                                >

                                    {
                                        schoolLevels.section_content
                                    }

                                </p>

                            )}

                        </div>


                        <div
                            className="
                                mt-8
                                grid
                                gap-5
                                sm:mt-12
                                md:grid-cols-3
                            "
                        >


                            {schoolLevelSections.map(

                                level => (

                                    <article
                                        key={
                                            level.id
                                        }
                                        className="
                                            group
                                            overflow-hidden
                                            rounded-2xl
                                            bg-white
                                            shadow-sm
                                            transition
                                            duration-300
                                            hover:-translate-y-1
                                            hover:shadow-xl
                                        "
                                    >


                                        {level.image_url && (

                                            <img
                                                src={
                                                    level.image_url
                                                }
                                                alt={
                                                    level.section_title ||
                                                    "School programme"
                                                }
                                                className="
                                                    h-48
                                                    w-full
                                                    object-cover
                                                    transition
                                                    duration-500
                                                    group-hover:scale-105
                                                    sm:h-56
                                                "
                                            />

                                        )}


                                        <div className="p-5 sm:p-6">


                                            {level.section_subtitle && (

                                                <p
                                                    className="
                                                        text-xs
                                                        font-bold
                                                        uppercase
                                                        tracking-wider
                                                    "
                                                    style={{
                                                        color:
                                                            primaryColor
                                                    }}
                                                >

                                                    {
                                                        level.section_subtitle
                                                    }

                                                </p>

                                            )}


                                            <h3
                                                className="
                                                    mt-2
                                                    text-lg
                                                    font-bold
                                                    text-slate-900
                                                    sm:text-xl
                                                "
                                            >

                                                {
                                                    level.section_title
                                                }

                                            </h3>


                                            {level.section_content && (

                                                <p
                                                    className="
                                                        mt-3
                                                        text-sm
                                                        leading-6
                                                        text-slate-600
                                                    "
                                                >

                                                    {
                                                        level.section_content
                                                    }

                                                </p>

                                            )}


                                            {level.button_text &&
                                                level.button_url && (

                                                    <Link
                                                        to={
                                                            level.button_url
                                                        }
                                                        className="
                                                            mt-5
                                                            inline-flex
                                                            text-sm
                                                            font-semibold
                                                        "
                                                        style={{
                                                            color:
                                                                primaryColor
                                                        }}
                                                    >

                                                        {
                                                            level.button_text
                                                        }

                                                        {" →"}

                                                    </Link>

                                                )}

                                        </div>

                                    </article>

                                )

                            )}

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                WHY CHOOSE US
            ========================================= */}

            {whyChoose && (

                <section
                    className="
                        px-5
                        py-14
                        sm:px-8
                        sm:py-20
                        lg:px-16
                    "
                >

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                        "
                    >

                        <div
                            className="
                                grid
                                gap-8
                                lg:grid-cols-2
                                lg:items-center
                                lg:gap-12
                            "
                        >


                            <div>

                                {whyChoose.section_subtitle && (

                                    <p
                                        className="
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            sm:text-sm
                                            sm:tracking-[0.2em]
                                        "
                                        style={{
                                            color:
                                                primaryColor
                                        }}
                                    >

                                        {
                                            whyChoose.section_subtitle
                                        }

                                    </p>

                                )}


                                <h2
                                    className="
                                        mt-3
                                        text-2xl
                                        font-extrabold
                                        text-slate-900
                                        sm:text-4xl
                                    "
                                >

                                    {
                                        whyChoose.section_title
                                    }

                                </h2>


                                {whyChoose.section_content && (

                                    <p
                                        className="
                                            mt-5
                                            text-sm
                                            leading-7
                                            text-slate-600
                                            sm:text-base
                                        "
                                    >

                                        {
                                            whyChoose.section_content
                                        }

                                    </p>

                                )}

                            </div>


                            <div
                                className="
                                    grid
                                    gap-4
                                    sm:grid-cols-2
                                    sm:gap-5
                                "
                            >


                                {features.map(

                                    (feature, index) => (

                                        <div
                                            key={
                                                feature.id
                                            }
                                            className="
                                                rounded-2xl
                                                border
                                                bg-white
                                                p-5
                                                shadow-sm
                                                sm:p-6
                                            "
                                        >


                                            <div
                                                className="
                                                    flex
                                                    h-11
                                                    w-11
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    text-xl
                                                    sm:h-12
                                                    sm:w-12
                                                    sm:text-2xl
                                                "
                                                style={{
                                                    backgroundColor:
                                                        `${primaryColor}15`
                                                }}
                                            >

                                                {
                                                    [
                                                        "📚",
                                                        "❤️",
                                                        "🧠",
                                                        "🌱"
                                                    ][index]
                                                }

                                            </div>


                                            <h3
                                                className="
                                                    mt-4
                                                    font-bold
                                                    text-slate-900
                                                    sm:mt-5
                                                "
                                            >

                                                {
                                                    feature.section_title
                                                }

                                            </h3>


                                            {feature.section_content && (

                                                <p
                                                    className="
                                                        mt-2
                                                        text-sm
                                                        leading-6
                                                        text-slate-600
                                                    "
                                                >

                                                    {
                                                        feature.section_content
                                                    }

                                                </p>

                                            )}

                                        </div>

                                    )

                                )}

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                SCHOOL LIFE
            ========================================= */}

            {schoolLife && (

                <section
                    className="
                        px-5
                        pb-14
                        sm:px-8
                        sm:pb-20
                        lg:px-16
                    "
                >

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                        "
                    >

                        <div
                            className="
                                relative
                                overflow-hidden
                                rounded-2xl
                                sm:rounded-3xl
                            "
                        >


                            {schoolLife.image_url && (

                                <img
                                    src={
                                        schoolLife.image_url
                                    }
                                    alt={
                                        schoolLife.section_title ||
                                        "School life"
                                    }
                                    className="
                                        h-[360px]
                                        w-full
                                        object-cover
                                        sm:h-[450px]
                                    "
                                />

                            )}


                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-slate-950/55
                                "
                            />


                            <div
                                className="
                                    absolute
                                    inset-0
                                    flex
                                    items-center
                                    justify-center
                                    px-5
                                    text-center
                                    sm:px-6
                                "
                            >

                                <div
                                    className="
                                        w-full
                                        max-w-2xl
                                        text-white
                                    "
                                >


                                    {schoolLife.section_subtitle && (

                                        <p
                                            className="
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-[0.18em]
                                                sm:text-sm
                                                sm:tracking-[0.2em]
                                            "
                                            style={{
                                                color:
                                                    "#93C5FD"
                                            }}
                                        >

                                            {
                                                schoolLife.section_subtitle
                                            }

                                        </p>

                                    )}


                                    <h2
                                        className="
                                            mt-3
                                            text-2xl
                                            font-extrabold
                                            sm:mt-4
                                            sm:text-5xl
                                        "
                                    >

                                        {
                                            schoolLife.section_title
                                        }

                                    </h2>


                                    {schoolLife.section_content && (

                                        <p
                                            className="
                                                mt-4
                                                text-sm
                                                leading-7
                                                text-white/80
                                                sm:mt-5
                                                sm:text-base
                                            "
                                        >

                                            {
                                                schoolLife.section_content
                                            }

                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                ADMISSIONS CTA
            ========================================= */}

            {admissionsCta && (

                <section
                    className="
                        px-5
                        py-14
                        text-white
                        sm:px-8
                        sm:py-20
                        lg:px-16
                    "
                    style={{
                        backgroundColor:
                            primaryColor
                    }}
                >

                    <div
                        className="
                            mx-auto
                            max-w-4xl
                            text-center
                        "
                    >


                        {admissionsCta.section_subtitle && (

                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-white/70
                                    sm:text-sm
                                    sm:tracking-[0.2em]
                                "
                            >

                                {
                                    admissionsCta.section_subtitle
                                }

                            </p>

                        )}


                        <h2
                            className="
                                mt-3
                                text-2xl
                                font-extrabold
                                sm:mt-4
                                sm:text-5xl
                            "
                        >

                            {
                                admissionsCta.section_title
                            }

                        </h2>


                        {admissionsCta.section_content && (

                            <p
                                className="
                                    mx-auto
                                    mt-4
                                    max-w-2xl
                                    text-sm
                                    leading-7
                                    text-white/80
                                    sm:mt-5
                                    sm:text-base
                                "
                            >

                                {
                                    admissionsCta.section_content
                                }

                            </p>

                        )}


                        <div
                            className="
                                mt-7
                                flex
                                flex-col
                                justify-center
                                gap-3
                                sm:mt-8
                                sm:flex-row
                            "
                        >


                            {admissionsCta.button_text &&
                                admissionsCta.button_url && (

                                    <Link
                                        to={
                                            admissionsCta.button_url
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            bg-white
                                            px-7
                                            py-3.5
                                            text-center
                                            text-sm
                                            font-bold
                                            transition
                                            hover:-translate-y-0.5
                                            hover:shadow-lg
                                            sm:w-auto
                                        "
                                        style={{
                                            color:
                                                primaryColor
                                        }}
                                    >

                                        {
                                            admissionsCta.button_text
                                        }

                                    </Link>

                                )}


                            <Link
                                to="/website/contact"
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-white/50
                                    px-7
                                    py-3.5
                                    text-center
                                    text-sm
                                    font-semibold
                                    transition
                                    hover:bg-white/10
                                    sm:w-auto
                                "
                            >

                                Talk to Us

                            </Link>

                        </div>

                    </div>

                </section>

            )}

        </div>

    );

}


export default Home;