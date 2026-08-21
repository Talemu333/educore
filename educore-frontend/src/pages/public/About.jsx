import { Link } from "react-router-dom";
import { useWebsitePage } from "../../hooks/useWebsite";

function About() {

    const primaryColor = "#1D4ED8";

    const {
        data: page,
        isLoading,
        isError
    } = useWebsitePage("about");


    /*
    =========================================
    LOADING
    =========================================
    */

    if (isLoading) {

        return (

            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div
                        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading About page...
                    </p>

                </div>

            </div>

        );

    }


    /*
    =========================================
    ERROR
    =========================================
    */

    if (isError || !page) {

        return (

            <div className="flex min-h-[500px] items-center justify-center px-6">

                <div className="max-w-md text-center">

                    <h1 className="text-2xl font-bold text-slate-900">
                        Unable to load this page
                    </h1>

                    <p className="mt-3 text-slate-600">
                        We could not load the About page at the moment.
                        Please try again later.
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
        page?.sections || [];


    /*
    =========================================
    FIND SECTION
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
    SECTION CONTENT
    =========================================
    */

    const renderContent = (
        content,
        className = ""
    ) => {

        if (!content) {
            return null;
        }

        /*
        Allow multiple paragraphs.

        In the dashboard you can enter:

        Paragraph one.

        Paragraph two.

        Paragraph three.

        React will automatically separate them.
        */

        const paragraphs =
            content
                .split(/\n\s*\n/)
                .filter(Boolean);


        return (

            <div className={className}>

                {paragraphs.map(
                    (paragraph, index) => (

                        <p
                            key={index}
                            className="mb-4 text-justify last:mb-0"
                        >

                            {paragraph.trim()}

                        </p>

                    )
                )}

            </div>

        );

    };


    /*
    =========================================
    SECTION VARIABLES
    =========================================
    */

    const hero =
        getSection("hero");

    const whoWeAre =
        getSection("who_we_are");

    const mission =
        getSection("mission");

    const vision =
        getSection("vision");

    const coreValues =
        getSection("core_values");

    const excellence =
        getSection("excellence");

    const integrity =
        getSection("integrity");

    const respect =
        getSection("respect");

    const curiosity =
        getSection("curiosity");

    const principalMessage =
        getSection("principal_message");

    const ourApproach =
        getSection("our_approach");

    const understand =
        getSection("understand");

    const explore =
        getSection("explore");

    const apply =
        getSection("apply");

    const aboutCta =
        getSection("about_cta");


    /*
    =========================================
    CORE VALUE ICONS
    =========================================
    */

    const valueIcons = {

        excellence: "⭐",

        integrity: "🛡️",

        respect: "🤝",

        curiosity: "💡"

    };


    /*
    =========================================
    APPROACH NUMBERS
    =========================================
    */

    const approachItems = [

        {
            section: understand,
            number: "1"
        },

        {
            section: explore,
            number: "2"
        },

        {
            section: apply,
            number: "3"
        }

    ];


    return (

        <div className="bg-white">


            {/* =========================================
                PAGE HERO
            ========================================= */}

            {hero && hero.is_active !== false && (

                <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white sm:px-10 sm:py-24 lg:px-16 lg:py-28">

                    <div className="mx-auto max-w-7xl">

                        <div className="max-w-3xl">

                            <p
                                className="text-sm font-bold uppercase tracking-[0.25em]"
                                style={{
                                    color: "#60A5FA"
                                }}
                            >
                                {hero.section_subtitle ||
                                    "About EduCore"}
                            </p>


                            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">

                                {hero.section_title}

                            </h1>


                            {hero.section_content && (

                                <div className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">

                                    {renderContent(
                                        hero.section_content
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* Decorative shapes */}

                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20" />

                    <div className="absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-blue-500/10" />

                </section>

            )}


            {/* =========================================
                WHO WE ARE
            ========================================= */}

            {whoWeAre && whoWeAre.is_active !== false && (

                <section className="px-6 py-20 sm:px-10 lg:px-16">

                    <div className="mx-auto max-w-7xl">

                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">


                            {/* IMAGE */}

                            <div className="relative">

                                {whoWeAre.image_url && (

                                    <div className="overflow-hidden rounded-3xl shadow-xl">

                                        <img
                                            src={whoWeAre.image_url}
                                            alt={
                                                whoWeAre.section_title ||
                                                "About our school"
                                            }
                                            className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[480px]"
                                        />

                                    </div>

                                )}


                                {/* FLOATING STAT */}

                                <div className="absolute bottom-3 right-3 rounded-2xl bg-white p-4 shadow-xl sm:-bottom-6 sm:-right-6 sm:p-6">

                                    <p
                                        className="text-2xl font-extrabold sm:text-3xl"
                                        style={{
                                            color: primaryColor
                                        }}
                                    >
                                        15+
                                    </p>

                                    <p className="mt-1 max-w-[150px] text-xs font-semibold text-slate-700 sm:text-sm">

                                        Years of educational excellence

                                    </p>

                                </div>

                            </div>


                            {/* CONTENT */}

                            <div>

                                <p
                                    className="text-sm font-bold uppercase tracking-[0.2em]"
                                    style={{
                                        color: primaryColor
                                    }}
                                >
                                    {whoWeAre.section_subtitle ||
                                        "Who We Are"}
                                </p>


                                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">

                                    {whoWeAre.section_title}

                                </h2>


                                <div className="mt-6 leading-8 text-slate-600">

                                    {renderContent(
                                        whoWeAre.section_content
                                    )}

                                </div>


                                {/* HIGHLIGHTS */}

                                <div className="mt-8 grid gap-4 sm:grid-cols-2">

                                    <div className="rounded-xl border bg-slate-50 p-4">

                                        <p className="font-bold text-slate-900">
                                            Child-Centred
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">

                                            Every learner matters and receives
                                            appropriate guidance and support.

                                        </p>

                                    </div>


                                    <div className="rounded-xl border bg-slate-50 p-4">

                                        <p className="font-bold text-slate-900">
                                            Future-Focused
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">

                                            We equip students with knowledge
                                            and skills for tomorrow's world.

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                MISSION / VISION
            ========================================= */}

            {(mission || vision) && (

                <section className="bg-slate-50 px-6 py-20 sm:px-10 lg:px-16">

                    <div className="mx-auto max-w-7xl">

                        <div className="grid gap-6 md:grid-cols-2">


                            {/* MISSION */}

                            {mission && mission.is_active !== false && (

                                <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">

                                    <div
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white"
                                        style={{
                                            backgroundColor: primaryColor
                                        }}
                                    >
                                        🎯
                                    </div>


                                    <p
                                        className="mt-7 text-sm font-bold uppercase tracking-[0.2em]"
                                        style={{
                                            color: primaryColor
                                        }}
                                    >
                                        {mission.section_subtitle ||
                                            "Our Mission"}
                                    </p>


                                    <h2 className="mt-3 text-2xl font-extrabold text-slate-900">

                                        {mission.section_title}

                                    </h2>


                                    <div className="mt-5 leading-7 text-slate-600">

                                        {renderContent(
                                            mission.section_content
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* VISION */}

                            {vision && vision.is_active !== false && (

                                <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm sm:p-10">

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-2xl">

                                        🌍

                                    </div>


                                    <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">

                                        {vision.section_subtitle ||
                                            "Our Vision"}

                                    </p>


                                    <h2 className="mt-3 text-2xl font-extrabold">

                                        {vision.section_title}

                                    </h2>


                                    <div className="mt-5 leading-7 text-slate-300">

                                        {renderContent(
                                            vision.section_content
                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                CORE VALUES
            ========================================= */}

            {coreValues && coreValues.is_active !== false && (

                <section className="px-6 py-20 sm:px-10 lg:px-16">

                    <div className="mx-auto max-w-7xl">


                        <div className="mx-auto max-w-2xl text-center">

                            <p
                                className="text-sm font-bold uppercase tracking-[0.2em]"
                                style={{
                                    color: primaryColor
                                }}
                            >
                                {coreValues.section_subtitle ||
                                    "What We Stand For"}
                            </p>


                            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">

                                {coreValues.section_title}

                            </h2>


                            {coreValues.section_content && (

                                <div className="mt-4 leading-7 text-slate-600">

                                    {renderContent(
                                        coreValues.section_content
                                    )}

                                </div>

                            )}

                        </div>


                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


                            {[

                                excellence,
                                integrity,
                                respect,
                                curiosity

                            ].map(
                                (value) => {

                                    if (
                                        !value ||
                                        value.is_active === false
                                    ) {
                                        return null;
                                    }

                                    return (

                                        <div
                                            key={value.id}
                                            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                        >

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">

                                                {
                                                    valueIcons[
                                                        value.section_key
                                                    ]
                                                }

                                            </div>


                                            <h3 className="mt-5 text-lg font-bold">

                                                {value.section_title}

                                            </h3>


                                            <div className="mt-2 text-sm leading-6 text-slate-600">

                                                {renderContent(
                                                    value.section_content
                                                )}

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                PRINCIPAL'S MESSAGE
            ========================================= */}

            {principalMessage &&
                principalMessage.is_active !== false && (

                    <section className="bg-slate-50 px-6 py-20 sm:px-10 lg:px-16">

                        <div className="mx-auto max-w-7xl">

                            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">


                                {/* PRINCIPAL IMAGE */}

                                <div>

                                    {principalMessage.image_url && (

                                        <div className="overflow-hidden rounded-3xl shadow-xl">

                                            <img
                                                src={
                                                    principalMessage.image_url
                                                }
                                                alt={
                                                    principalMessage.section_title ||
                                                    "School principal"
                                                }
                                                className="mx-auto h-[300px] w-full max-w-md object-cover sm:h-[360px] lg:h-[420px]"
                                            />

                                        </div>

                                    )}

                                </div>


                                {/* MESSAGE */}

                                <div>

                                    <p
                                        className="text-sm font-bold uppercase tracking-[0.2em]"
                                        style={{
                                            color: primaryColor
                                        }}
                                    >
                                        {principalMessage.section_subtitle ||
                                            "From the Principal"}
                                    </p>


                                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">

                                        {principalMessage.section_title}

                                    </h2>


                                    <div className="mt-6 leading-8 text-slate-600">

                                        {renderContent(
                                            principalMessage.section_content
                                        )}

                                    </div>


                                    <div className="mt-7">

                                        <p className="font-bold text-slate-900">

                                            Dr. Daniel Adeyemi

                                        </p>

                                        <p className="text-sm text-slate-500">

                                            Principal, EduCore Schools

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                )}


            {/* =========================================
                OUR APPROACH
            ========================================= */}

            {ourApproach &&
                ourApproach.is_active !== false && (

                    <section className="px-6 py-20 sm:px-10 lg:px-16">

                        <div className="mx-auto max-w-7xl">

                            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">


                                <div>

                                    <p
                                        className="text-sm font-bold uppercase tracking-[0.2em]"
                                        style={{
                                            color: primaryColor
                                        }}
                                    >
                                        {ourApproach.section_subtitle ||
                                            "Our Approach"}
                                    </p>


                                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">

                                        {ourApproach.section_title}

                                    </h2>


                                    {ourApproach.section_content && (

                                        <div className="mt-5 leading-8 text-slate-600">

                                            {renderContent(
                                                ourApproach.section_content
                                            )}

                                        </div>

                                    )}


                                    <div className="mt-8 space-y-5">

                                        {approachItems.map(
                                            ({ section, number }) => {

                                                if (
                                                    !section ||
                                                    section.is_active === false
                                                ) {
                                                    return null;
                                                }

                                                return (

                                                    <div
                                                        key={section.id}
                                                        className="flex gap-4"
                                                    >

                                                        <div
                                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                                            style={{
                                                                backgroundColor:
                                                                    primaryColor
                                                            }}
                                                        >
                                                            {number}
                                                        </div>


                                                        <div>

                                                            <h3 className="font-bold">

                                                                {
                                                                    section.section_title
                                                                }

                                                            </h3>


                                                            <div className="mt-1 text-sm leading-6 text-slate-600">

                                                                {renderContent(
                                                                    section.section_content
                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                </div>


                                {/* IMAGE */}

                                <div className="relative overflow-hidden rounded-3xl shadow-xl">

                                    {ourApproach.image_url && (

                                        <img
                                            src={
                                                ourApproach.image_url
                                            }
                                            alt={
                                                ourApproach.section_title ||
                                                "Students collaborating"
                                            }
                                            className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[480px]"
                                        />

                                    )}

                                </div>

                            </div>

                        </div>

                    </section>

                )}


            {/* =========================================
                CTA
            ========================================= */}

            {aboutCta &&
                aboutCta.is_active !== false && (

                    <section
                        className="px-6 py-20 text-white sm:px-10 lg:px-16"
                        style={{
                            backgroundColor: primaryColor
                        }}
                    >

                        <div className="mx-auto max-w-4xl text-center">

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">

                                {aboutCta.section_subtitle ||
                                    "Join Our Community"}

                            </p>


                            <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">

                                {aboutCta.section_title}

                            </h2>


                            {aboutCta.section_content && (

                                <div className="mx-auto mt-5 max-w-2xl leading-7 text-white/80">

                                    {renderContent(
                                        aboutCta.section_content
                                    )}

                                </div>

                            )}


                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                                <Link
                                    to={
                                        aboutCta.button_url ||
                                        "/website/admissions"
                                    }
                                    className="rounded-lg bg-white px-7 py-3.5 font-bold transition hover:-translate-y-0.5 hover:shadow-lg"
                                    style={{
                                        color: primaryColor
                                    }}
                                >
                                    {
                                        aboutCta.button_text ||
                                        "Apply for Admission"
                                    }
                                </Link>


                                <Link
                                    to="/website/contact"
                                    className="rounded-lg border border-white/50 px-7 py-3.5 font-semibold transition hover:bg-white/10"
                                >
                                    Contact Us
                                </Link>

                            </div>

                        </div>

                    </section>

                )}

        </div>

    );

}

export default About;