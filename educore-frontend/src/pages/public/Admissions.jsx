import { Link } from "react-router-dom";
import { useWebsitePage } from "@/hooks/useWebsite";

function Admissions() {
    const primaryColor = "#1D4ED8";

    const {
        data: page,
        isLoading,
        isError,
    } = useWebsitePage("admissions");

    const sections = page?.sections || [];

    /*
    |--------------------------------------------------------------------------
    | GET SECTION
    |--------------------------------------------------------------------------
    */

    const getSection = (key) =>
        sections.find(
            (section) =>
                section.section_key === key &&
                section.is_active !== false
        );

    /*
    |--------------------------------------------------------------------------
    | MAIN SECTIONS
    |--------------------------------------------------------------------------
    */

    const hero = getSection("hero");

    const introduction = getSection("introduction");

    const primary = getSection("primary");

    const secondary = getSection("secondary");

    const admissionProcess = getSection("admission_process");

    const requirements = getSection("requirements");

    const requirementsNotice = getSection(
        "requirements_notice"
    );

    const whyChooseUs = getSection("why_choose_us");

    const faq = getSection("faq");

    const cta = getSection("admissions_cta");

    /*
    |--------------------------------------------------------------------------
    | ADMISSION PROCESS STEPS
    |--------------------------------------------------------------------------
    */

    const admissionSteps = sections
        .filter(
            (section) =>
                section.section_key?.startsWith(
                    "admission_step_"
                ) &&
                section.is_active !== false
        )
        .sort((a, b) => {
            const aNumber = parseInt(
                a.section_key.replace(
                    "admission_step_",
                    ""
                ),
                10
            );

            const bNumber = parseInt(
                b.section_key.replace(
                    "admission_step_",
                    ""
                ),
                10
            );

            return aNumber - bNumber;
        });

    /*
    |--------------------------------------------------------------------------
    | REQUIREMENTS
    |--------------------------------------------------------------------------
    */

    const requirementSections = sections
        .filter(
            (section) =>
                section.section_key?.startsWith(
                    "requirement_"
                ) &&
                section.is_active !== false
        )
        .sort((a, b) => {
            const aNumber = parseInt(
                a.section_key.replace(
                    "requirement_",
                    ""
                ),
                10
            );

            const bNumber = parseInt(
                b.section_key.replace(
                    "requirement_",
                    ""
                ),
                10
            );

            return aNumber - bNumber;
        });

    /*
    |--------------------------------------------------------------------------
    | WHY CHOOSE US
    |--------------------------------------------------------------------------
    */

    const whyChooseKeys = [
        "strong_academics",
        "character_development",
        "supportive_teachers",
        "safe_environment",
    ];

    const whyChooseSections = whyChooseKeys
        .map((key) => getSection(key))
        .filter(Boolean);

    /*
    |--------------------------------------------------------------------------
    | FAQ
    |--------------------------------------------------------------------------
    */

    const faqSections = sections
        .filter(
            (section) =>
                section.section_key?.startsWith("faq_") &&
                section.is_active !== false
        )
        .sort((a, b) => {
            const aNumber = parseInt(
                a.section_key.replace("faq_", ""),
                10
            );

            const bNumber = parseInt(
                b.section_key.replace("faq_", ""),
                10
            );

            return aNumber - bNumber;
        });

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="text-center">

                    <div
                        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200"
                        style={{
                            borderTopColor: primaryColor,
                        }}
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading admissions page...
                    </p>

                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white px-6">
                <div className="text-center">

                    <h2 className="text-2xl font-bold text-slate-900">
                        Unable to load admissions page
                    </h2>

                    <p className="mt-3 text-slate-600">
                        Please try again later.
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">

            {/* =========================================================
                HERO
            ========================================================= */}

            <section className="relative overflow-hidden bg-slate-950 text-white">

                <div className="absolute inset-0">

                    <img
                        src={
                            hero?.image_url ||
                            "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=2000&q=80"
                        }
                        alt={
                            hero?.section_subtitle ||
                            "Student in a school environment"
                        }
                        className="h-full w-full object-cover opacity-30"
                    />

                    <div className="absolute inset-0 bg-slate-950/75" />

                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">

                    <div className="max-w-3xl">

                        <p
                            className="text-sm font-bold uppercase tracking-[0.2em]"
                            style={{
                                color: "#93C5FD",
                            }}
                        >
                            {hero?.section_subtitle ||
                                "Admissions"}
                        </p>

                        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            {hero?.section_title ||
                                "Begin your child's journey with us."}
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                            {hero?.section_content ||
                                "We welcome families who are looking for a school where children can receive a strong education, develop character and grow in confidence."}
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <a
                                href={
                                    hero?.button_url ||
                                    "#application"
                                }
                                className="rounded-lg bg-white px-6 py-3.5 text-center text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                                style={{
                                    color: primaryColor,
                                }}
                            >
                                {hero?.button_text ||
                                    "Start Application"}
                            </a>

                            <Link
                                to="/website/contact"
                                className="rounded-lg border border-white/50 px-6 py-3.5 text-center text-sm font-semibold transition hover:bg-white/10"
                            >
                                Speak With Us
                            </Link>

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================================================
                INTRODUCTION
            ========================================================= */}

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                <div className="mx-auto max-w-7xl">

                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

                        <div>

                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{
                                    color: primaryColor,
                                }}
                            >
                                {introduction?.section_subtitle ||
                                    "Welcome"}
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {introduction?.section_title ||
                                    "Choosing the right school matters"}
                            </h2>

                            <div className="mt-5 space-y-4 leading-8 text-slate-600">

                                {introduction?.section_content ? (
                                    introduction.section_content
                                        .split("\n")
                                        .filter(Boolean)
                                        .map(
                                            (
                                                paragraph,
                                                index
                                            ) => (
                                                <p key={index}>
                                                    {paragraph}
                                                </p>
                                            )
                                        )
                                ) : (
                                    <>
                                        <p>
                                            Choosing a school is one of
                                            the most important decisions
                                            a parent or guardian can
                                            make. Our goal is to provide
                                            a supportive environment
                                            where every learner can
                                            develop academically,
                                            socially and personally.
                                        </p>

                                        <p>
                                            From the first enquiry
                                            through enrolment, our
                                            admissions team is available
                                            to guide families through
                                            the process and answer their
                                            questions.
                                        </p>
                                    </>
                                )}

                            </div>

                            {/* PRIMARY / SECONDARY */}

                            <div className="mt-7 grid gap-4 sm:grid-cols-2">

                                {primary && (
                                    <div className="rounded-xl bg-blue-50 p-5">

                                        <p
                                            className="text-2xl font-extrabold"
                                            style={{
                                                color: primaryColor,
                                            }}
                                        >
                                            {primary.section_title}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {primary.section_content}
                                        </p>

                                    </div>
                                )}

                                {secondary && (
                                    <div className="rounded-xl bg-blue-50 p-5">

                                        <p
                                            className="text-2xl font-extrabold"
                                            style={{
                                                color: primaryColor,
                                            }}
                                        >
                                            {secondary.section_title}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {secondary.section_content}
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                        <div className="overflow-hidden rounded-3xl">

                            <img
                                src={
                                    introduction?.image_url ||
                                    "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80"
                                }
                                alt="Teacher with school children"
                                className="h-[460px] w-full object-cover shadow-xl"
                            />

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================================================
                ADMISSION PROCESS
            ========================================================= */}

            <section
                id="application"
                className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
            >

                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{
                                color: primaryColor,
                            }}
                        >
                            {admissionProcess?.section_subtitle ||
                                "How It Works"}
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {admissionProcess?.section_title ||
                                "Our admission process"}
                        </h2>

                        <p className="mt-5 leading-7 text-slate-600">
                            {admissionProcess?.section_content ||
                                "We have designed our admission process to make joining our school as clear and straightforward as possible."}
                        </p>

                    </div>

                    <div className="relative mt-14">

                        <div
                            className="absolute left-0 right-0 top-7 hidden h-px lg:block"
                            style={{
                                backgroundColor: "#BFDBFE",
                            }}
                        />

                        <div className="grid gap-8 lg:grid-cols-5">

                            {admissionSteps.map(
                                (step) => (
                                    <div
                                        key={
                                            step.id ||
                                            step.section_key
                                        }
                                        className="relative"
                                    >

                                        <div className="flex items-center gap-4 lg:block">

                                            <div
                                                className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
                                                style={{
                                                    backgroundColor:
                                                        primaryColor,
                                                }}
                                            >
                                                {step.section_subtitle ||
                                                    ""}
                                            </div>

                                            <div className="mt-0 lg:mt-6">

                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {step.section_title}
                                                </h3>

                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {step.section_content}
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================================================
                REQUIREMENTS
            ========================================================= */}

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                <div className="mx-auto max-w-7xl">

                    <div className="grid gap-12 lg:grid-cols-2">

                        <div>

                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{
                                    color: primaryColor,
                                }}
                            >
                                {requirements?.section_subtitle ||
                                    "Requirements"}
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {requirements?.section_title ||
                                    "What you may need"}
                            </h2>

                            <p className="mt-5 leading-7 text-slate-600">
                                {requirements?.section_content ||
                                    "The following documents may be required during the admission and enrolment process."}
                            </p>

                            <div className="mt-8 space-y-3">

                                {requirementSections.map(
                                    (requirement) => (
                                        <div
                                            key={
                                                requirement.id ||
                                                requirement.section_key
                                            }
                                            className="flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm"
                                        >

                                            <div
                                                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                                style={{
                                                    backgroundColor:
                                                        primaryColor,
                                                }}
                                            >
                                                ✓
                                            </div>

                                            <p className="text-sm leading-6 text-slate-700">
                                                {
                                                    requirement.section_title
                                                }
                                            </p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                        <div>

                            <div className="overflow-hidden rounded-3xl">

                                <img
                                    src={
                                        requirementsNotice?.image_url ||
                                        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80"
                                    }
                                    alt="Teacher supporting students"
                                    className="h-[330px] w-full object-cover"
                                />

                            </div>

                            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">

                                <div className="flex gap-4">

                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    >
                                        i
                                    </div>

                                    <div>

                                        <h3 className="font-bold text-slate-900">
                                            {requirementsNotice?.section_title ||
                                                "Important information"}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {requirementsNotice?.section_content ||
                                                "Admission requirements may vary depending on the class and level of entry. Please contact the school for the most current requirements."}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================================================
                WHY CHOOSE US
            ========================================================= */}

            <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">

                <div className="mx-auto max-w-7xl">

                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

                        <div>

                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{
                                    color: "#93C5FD",
                                }}
                            >
                                {whyChooseUs?.section_subtitle ||
                                    "Why Choose Us"}
                            </p>

                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                {whyChooseUs?.section_title ||
                                    "More than a place to learn"}
                            </h2>

                            <p className="mt-5 leading-8 text-slate-300">
                                {whyChooseUs?.section_content ||
                                    "We want every child who joins our school to feel known, supported and challenged to become the best version of themselves."}
                            </p>

                            <div className="mt-8 grid gap-5 sm:grid-cols-2">

                                {whyChooseSections.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.id ||
                                                item.section_key
                                            }
                                            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                                        >

                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                                                style={{
                                                    backgroundColor:
                                                        primaryColor,
                                                }}
                                            >
                                                ✓
                                            </div>

                                            <h3 className="mt-4 font-bold">
                                                {
                                                    item.section_title
                                                }
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {
                                                    item.section_content
                                                }
                                            </p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                        <div className="overflow-hidden rounded-3xl">

                            <img
                                src={
                                    whyChooseUs?.image_url ||
                                    "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80"
                                }
                                alt="Students learning together"
                                className="h-[520px] w-full object-cover"
                            />

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================================================
                FAQ
            ========================================================= */}

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                <div className="mx-auto max-w-4xl">

                    <div className="text-center">

                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{
                                color: primaryColor,
                            }}
                        >
                            {faq?.section_subtitle ||
                                "Frequently Asked Questions"}
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {faq?.section_title ||
                                "Questions parents often ask"}
                        </h2>

                        {faq?.section_content && (
                            <p className="mt-5 text-slate-600">
                                {faq.section_content}
                            </p>
                        )}

                    </div>

                    <div className="mt-10 space-y-4">

                        {faqSections.map(
                            (item) => (
                                <details
                                    key={
                                        item.id ||
                                        item.section_key
                                    }
                                    className="group rounded-2xl border bg-white p-5 shadow-sm"
                                >

                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">

                                        <span>
                                            {item.section_title}
                                        </span>

                                        <span
                                            className="text-xl transition-transform group-open:rotate-45"
                                            style={{
                                                color: primaryColor,
                                            }}
                                        >
                                            +
                                        </span>

                                    </summary>

                                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                                        {item.section_content}
                                    </p>

                                </details>
                            )
                        )}

                    </div>

                </div>

            </section>

            {/* =========================================================
                APPLICATION CTA
            ========================================================= */}

            <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">

                <div
                    className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-xl sm:px-12 sm:py-16"
                    style={{
                        backgroundColor:
                            primaryColor,
                    }}
                >

                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                        {cta?.section_subtitle ||
                            "Take the next step"}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                        {cta?.section_title ||
                            "Ready to join our school community?"}
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                        {cta?.section_content ||
                            "Contact our admissions team to learn more about available places, admission requirements and the next steps for your child."}
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                        <a
                            href={
                                cta?.button_url ||
                                "#application"
                            }
                            className="rounded-lg bg-white px-6 py-3.5 font-bold transition hover:-translate-y-0.5 hover:shadow-lg"
                            style={{
                                color: primaryColor,
                            }}
                        >
                            {cta?.button_text ||
                                "Start Application"}
                        </a>

                        <Link
                            to="/website/contact"
                            className="rounded-lg border border-white/60 px-6 py-3.5 font-semibold transition hover:bg-white/10"
                        >
                            Contact Us
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Admissions;