import {
    Link,
    useParams
} from "react-router-dom";

import {
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Mail,
    Clock,
    Phone,
    MapPin
} from "lucide-react";

import {
    useWebsitePage
} from "@/hooks/useWebsite";

import {
    useSchoolSettings
} from "@/hooks/useSchoolSettings";

import Loading
from "@/components/common/Loading";


function WebsitePage() {

    const {
        slug
    } = useParams();


    const {
        data: page,
        isLoading,
        isError
    } = useWebsitePage(slug);


    const {
        data: settings
    } = useSchoolSettings();


    const isHome =
        slug === "home";


    /*
    =====================================
    LOADING
    =====================================
    */

    if (isLoading) {

        return (
            <Loading
                message="Loading page..."
            />
        );

    }


    /*
    =====================================
    PAGE NOT FOUND
    =====================================
    */

    if (isError || !page) {

        return (

            <div className="min-h-[60vh] px-6 py-20">

                <div className="mx-auto max-w-3xl text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">

                        !

                    </div>


                    <h1 className="mt-6 text-3xl font-bold">

                        Page Not Found

                    </h1>


                    <p className="mt-3 text-muted-foreground">

                        The page you are looking for
                        could not be found.

                    </p>


                    <Link
                        to="/website"
                        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    >

                        Back to Home

                        <ArrowRight
                            className="h-4 w-4"
                        />

                    </Link>

                </div>

            </div>

        );

    }


    /*
    =====================================
    ACTIVE SECTIONS
    =====================================
    */

    const sections =
        (page.sections || [])
            .filter(
                section =>
                    section.is_active !== false
            )
            .sort(
                (a, b) =>
                    a.display_order -
                    b.display_order
            );


    /*
    =====================================
    RENDER
    =====================================
    */

    return (

        <div className="overflow-hidden">

            {/* =====================================
                HERO
            ===================================== */}

            <section className="relative overflow-hidden bg-primary px-6 py-20 text-white sm:py-28">

                {/* Decorative background */}

                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />

                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />


                <div className="relative mx-auto max-w-7xl">

                    <div className="max-w-3xl">

                        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">

                            {settings?.school_name || "Our School"}

                        </p>


                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">

                            {page.page_title}

                        </h1>


                        <div className="mt-6 h-1.5 w-20 rounded-full bg-white" />


                        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">

                            {page.page_content?.split("\n")[0] ||
                                "Welcome to our school."}

                        </p>

                    </div>

                </div>

            </section>


            {/* =====================================
                HOME INTRODUCTION
            ===================================== */}

            {isHome && (

                <section className="border-b bg-background">

                    <div className="mx-auto max-w-4xl px-6 py-14 text-center sm:py-16">

                        <p className="text-lg leading-8 text-muted-foreground sm:text-xl">

                            {page.page_content}

                        </p>

                    </div>

                </section>

            )}


            {/* =====================================
                INTERNAL PAGE CONTENT
            ===================================== */}

            {!isHome && page.page_content && (

                <section className="bg-muted/20 px-6 py-14 sm:py-20">

                    <div className="mx-auto max-w-4xl">

                        <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-10">

                            <div className="space-y-5">

                                {page.page_content
                                    .split("\n")
                                    .map(
                                        (
                                            paragraph,
                                            index
                                        ) => (

                                            paragraph.trim() && (

                                                <p
                                                    key={index}
                                                    className="leading-8 text-muted-foreground"
                                                >

                                                    {paragraph}

                                                </p>

                                            )

                                        )
                                    )
                                }

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =====================================
                DYNAMIC SECTIONS
            ===================================== */}

            {sections.length > 0 && (

                <section className="bg-background px-6 py-16 sm:py-24">

                    <div className="mx-auto max-w-7xl">

                        <div className="space-y-20 sm:space-y-28">

                            {sections.map(
                                (
                                    section,
                                    index
                                ) => {

                                    const hasImage =
                                        Boolean(
                                            section.image_url
                                        );


                                    const reversed =
                                        index % 2 !== 0;


                                    return (

                                        <article
                                            key={
                                                section.id
                                            }
                                            className={`
                                                grid
                                                items-center
                                                gap-10
                                                lg:grid-cols-2
                                                lg:gap-16
                                            `}
                                        >

                                            {/* =================================
                                                IMAGE
                                            ================================= */}

                                            {hasImage && (

                                                <div
                                                    className={
                                                        reversed
                                                            ? "lg:order-2"
                                                            : ""
                                                    }
                                                >

                                                    <div className="group overflow-hidden rounded-2xl shadow-lg">

                                                        <img
                                                            src={
                                                                section.image_url
                                                            }
                                                            alt={
                                                                section.section_title ||
                                                                page.page_title
                                                            }
                                                            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                                                        />

                                                    </div>

                                                </div>

                                            )}


                                            {/* =================================
                                                CONTENT
                                            ================================= */}

                                            <div
                                                className={
                                                    hasImage
                                                        ? reversed
                                                            ? "lg:order-1"
                                                            : ""
                                                        : "lg:col-span-2 mx-auto max-w-4xl"
                                                }
                                            >

                                                {section.section_key && (

                                                    <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-primary">

                                                        <span className="h-px w-8 bg-primary" />

                                                        {
                                                            section.section_key
                                                        }

                                                    </div>

                                                )}


                                                {section.section_title && (

                                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">

                                                        {
                                                            section.section_title
                                                        }

                                                    </h2>

                                                )}


                                                {section.section_subtitle && (

                                                    <p className="mt-3 text-lg font-semibold text-primary">

                                                        {
                                                            section.section_subtitle
                                                        }

                                                    </p>

                                                )}


                                                {section.section_content && (

                                                    <div className="mt-5 space-y-4">

                                                        {
                                                            section.section_content
                                                                .split("\n")
                                                                .map(
                                                                    (
                                                                        paragraph,
                                                                        paragraphIndex
                                                                    ) => (

                                                                        paragraph.trim() && (

                                                                            <p
                                                                                key={
                                                                                    paragraphIndex
                                                                                }
                                                                                className="leading-8 text-muted-foreground"
                                                                            >

                                                                                {
                                                                                    paragraph
                                                                                }

                                                                            </p>

                                                                        )

                                                                    )
                                                                )
                                                        }

                                                    </div>

                                                )}


                                                {section.button_text &&
                                                section.button_url && (

                                                    <Link
                                                        to={
                                                            section.button_url
                                                        }
                                                        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                                    >

                                                        {
                                                            section.button_text
                                                        }

                                                        <ArrowRight
                                                            className="h-4 w-4"
                                                        />

                                                    </Link>

                                                )}

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    </div>

                </section>

            )}


            {/* =====================================
                CONTACT INFORMATION
            ===================================== */}

            {slug === "contact" && (

                <section className="bg-muted/30 px-6 py-16 sm:py-20">

                    <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">

                        {settings?.school_phone && (

                            <div className="rounded-2xl border bg-background p-6 shadow-sm">

                                <Phone
                                    className="h-6 w-6 text-primary"
                                />

                                <h3 className="mt-4 font-semibold">
                                    Phone
                                </h3>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {settings.school_phone}
                                </p>

                            </div>

                        )}


                        {settings?.school_email && (

                            <div className="rounded-2xl border bg-background p-6 shadow-sm">

                                <Mail
                                    className="h-6 w-6 text-primary"
                                />

                                <h3 className="mt-4 font-semibold">
                                    Email
                                </h3>

                                <p className="mt-2 break-all text-sm text-muted-foreground">
                                    {settings.school_email}
                                </p>

                            </div>

                        )}


                        {settings?.school_address && (

                            <div className="rounded-2xl border bg-background p-6 shadow-sm">

                                <MapPin
                                    className="h-6 w-6 text-primary"
                                />

                                <h3 className="mt-4 font-semibold">
                                    Address
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {settings.school_address}
                                </p>

                            </div>

                        )}

                    </div>

                </section>

            )}


            {/* =====================================
                CALL TO ACTION
            ===================================== */}

            {(slug === "home" ||
                slug === "admissions") && (

                <section className="bg-primary px-6 py-16 sm:py-20">

                    <div className="mx-auto max-w-4xl text-center">

                        <CheckCircle2
                            className="mx-auto h-10 w-10 text-white/90"
                        />


                        <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">

                            Take the Next Step

                        </h2>


                        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/75">

                            We would be delighted to welcome
                            you to our school community.

                        </p>


                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                            {slug === "home" && (

                                <Link
                                    to="/website/admissions"
                                    className="rounded-lg bg-white px-6 py-3 font-semibold text-primary transition hover:bg-white/90"
                                >

                                    Explore Admissions

                                </Link>

                            )}


                            {slug === "admissions" && (

                                <Link
                                    to="/website/contact"
                                    className="rounded-lg bg-white px-6 py-3 font-semibold text-primary transition hover:bg-white/90"
                                >

                                    Contact the School

                                </Link>

                            )}


                            <Link
                                to="/website/about"
                                className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                            >

                                Learn More About Us

                            </Link>

                        </div>

                    </div>

                </section>

            )}


            {/* =====================================
                BOTTOM NAVIGATION
            ===================================== */}

            {!isHome && (

                <section className="border-t bg-background px-6 py-10">

                    <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <Link
                            to="/website"
                            className="inline-flex items-center justify-center rounded-lg border px-5 py-3 font-medium transition hover:bg-muted"
                        >

                            ← Back to Home

                        </Link>


                        {slug === "about" && (

                            <Link
                                to="/website/academics"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
                            >

                                Explore Academics

                                <ArrowRight
                                    className="h-4 w-4"
                                />

                            </Link>

                        )}


                        {slug === "academics" && (

                            <Link
                                to="/website/admissions"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
                            >

                                Explore Admissions

                                <ArrowRight
                                    className="h-4 w-4"
                                />

                            </Link>

                        )}


                        {slug === "admissions" && (

                            <Link
                                to="/website/contact"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
                            >

                                Contact Us

                                <ArrowRight
                                    className="h-4 w-4"
                                />

                            </Link>

                        )}

                    </div>

                </section>

            )}

        </div>

    );

}


export default WebsitePage;