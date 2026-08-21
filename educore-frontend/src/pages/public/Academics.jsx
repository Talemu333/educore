import { Link } from "react-router-dom";
import { useWebsitePage } from "@/hooks/useWebsite";

function Academics() {
    const primaryColor = "#1D4ED8";

    const {
        data: page,
        isLoading,
        isError,
    } = useWebsitePage("academics");

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
    | ACADEMICS SECTIONS
    |--------------------------------------------------------------------------
    */

    const hero = getSection("hero");

    const introduction = getSection("introduction");

    const programmes = getSection("programmes");

    const primary = getSection("primary");

    const juniorSecondary = getSection("junior_secondary");

    const seniorSecondary = getSection("senior_secondary");

    const curriculum = getSection("curriculum");

    const learningApproach = getSection("learning_approach");

    const studentCentred = getSection("student_centred");

    const practicalExperiences = getSection("practical_experiences");

    const continuousAssessment = getSection(
        "continuous_assessment"
    );

    const academicExcellence = getSection(
        "academic_excellence"
    );

    const cta = getSection("academics_cta");

    /*
    |--------------------------------------------------------------------------
    | SUBJECTS
    |--------------------------------------------------------------------------
    */

    const subjectKeys = [
        "english_language",
        "mathematics",
        "basic_science",
        "basic_technology",
        "computer_studies",
        "social_studies",
        "civic_education",
        "agricultural_science",
        "christian_religious_studies",
        "physical_health_education",
        "creative_arts",
        "business_studies",
    ];

    const subjects = subjectKeys
        .map((key) => getSection(key))
        .filter(Boolean);

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    const renderParagraphs = (content) => {
        if (!content) return null;

        return content
            .split("\n")
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
                <p key={index}>
                    {paragraph}
                </p>
            ));
    };

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
                        Loading academics page...
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
                        Unable to load academics page
                    </h2>

                    <p className="mt-3 text-slate-600">
                        Please try again later.
                    </p>

                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <div className="bg-white">

            {/* =========================================================
                HERO
            ========================================================= */}

            {hero && (
                <section className="relative overflow-hidden bg-slate-950 text-white">

                    {/* Background Image */}

                    {hero.image_url && (
                        <div className="absolute inset-0">

                            <img
                                src={hero.image_url}
                                alt={
                                    hero.section_title ||
                                    "Students learning"
                                }
                                className="h-full w-full object-cover opacity-30"
                            />

                            <div className="absolute inset-0 bg-slate-950/70" />

                        </div>
                    )}

                    <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">

                        <div className="max-w-3xl">

                            {hero.section_subtitle && (
                                <p
                                    className="text-sm font-bold uppercase tracking-[0.2em]"
                                    style={{
                                        color: "#93C5FD",
                                    }}
                                >
                                    {hero.section_subtitle}
                                </p>
                            )}

                            {hero.section_title && (
                                <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                    {hero.section_title}
                                </h1>
                            )}

                            {hero.section_content && (
                                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                                    {hero.section_content}
                                </p>
                            )}

                            {(hero.button_text || programmes) && (
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                                    {hero.button_text && hero.button_url && (
                                        <Link
                                            to={hero.button_url}
                                            className="rounded-lg bg-white px-6 py-3.5 text-center text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                                            style={{
                                                color: primaryColor,
                                            }}
                                        >
                                            {hero.button_text}
                                        </Link>
                                    )}

                                    {programmes && (
                                        <a
                                            href="#programmes"
                                            className="rounded-lg border border-white/50 px-6 py-3.5 text-center text-sm font-semibold transition hover:bg-white/10"
                                        >
                                            Explore Our Programmes
                                        </a>
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                </section>
            )}


            {/* =========================================================
                INTRODUCTION
            ========================================================= */}

            {introduction && (
                <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                    <div className="mx-auto max-w-7xl">

                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

                            <div>

                                {introduction.section_subtitle && (
                                    <p
                                        className="text-sm font-bold uppercase tracking-wider"
                                        style={{
                                            color: primaryColor,
                                        }}
                                    >
                                        {introduction.section_subtitle}
                                    </p>
                                )}

                                {introduction.section_title && (
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                        {introduction.section_title}
                                    </h2>
                                )}

                                {introduction.section_content && (
                                    <div className="mt-5 space-y-4 leading-8 text-slate-600">
                                        {renderParagraphs(
                                            introduction.section_content
                                        )}
                                    </div>
                                )}

                                {introduction.button_text &&
                                    introduction.button_url && (
                                        <div className="mt-7">

                                            <Link
                                                to={
                                                    introduction.button_url
                                                }
                                                className="inline-flex items-center font-semibold transition hover:gap-2"
                                                style={{
                                                    color: primaryColor,
                                                }}
                                            >
                                                {introduction.button_text}

                                                <span className="ml-2">
                                                    →
                                                </span>

                                            </Link>

                                        </div>
                                    )}

                            </div>


                            {introduction.image_url && (
                                <div className="relative">

                                    <img
                                        src={introduction.image_url}
                                        alt={
                                            introduction.section_title ||
                                            "Students studying together"
                                        }
                                        className="h-[420px] w-full rounded-3xl object-cover shadow-xl"
                                    />

                                    {(introduction.stat_value ||
                                        introduction.stat_label) && (
                                        <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-5 shadow-xl sm:block">

                                            {introduction.stat_value && (
                                                <p
                                                    className="text-3xl font-extrabold"
                                                    style={{
                                                        color: primaryColor,
                                                    }}
                                                >
                                                    {introduction.stat_value}
                                                </p>
                                            )}

                                            {introduction.stat_label && (
                                                <p className="mt-1 text-sm font-medium text-slate-600">
                                                    {introduction.stat_label}
                                                </p>
                                            )}

                                        </div>
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                </section>
            )}


            {/* =========================================================
                ACADEMIC PROGRAMMES
            ========================================================= */}

            {programmes && (
                <section
                    id="programmes"
                    className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
                >

                    <div className="mx-auto max-w-7xl">

                        <div className="mx-auto max-w-3xl text-center">

                            {programmes.section_subtitle && (
                                <p
                                    className="text-sm font-bold uppercase tracking-wider"
                                    style={{
                                        color: primaryColor,
                                    }}
                                >
                                    {programmes.section_subtitle}
                                </p>
                            )}

                            {programmes.section_title && (
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    {programmes.section_title}
                                </h2>
                            )}

                            {programmes.section_content && (
                                <p className="mt-5 leading-7 text-slate-600">
                                    {programmes.section_content}
                                </p>
                            )}

                        </div>


                        {(primary ||
                            juniorSecondary ||
                            seniorSecondary) && (
                            <div className="mt-12 grid gap-7 md:grid-cols-3">

                                {/* PRIMARY */}

                                {primary && (
                                    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                                        {primary.image_url && (
                                            <div className="h-56 overflow-hidden">

                                                <img
                                                    src={primary.image_url}
                                                    alt={
                                                        primary.section_title ||
                                                        "Primary school"
                                                    }
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />

                                            </div>
                                        )}

                                        <div className="p-7">

                                            {primary.section_subtitle && (
                                                <span
                                                    className="text-xs font-bold uppercase tracking-wider"
                                                    style={{
                                                        color: primaryColor,
                                                    }}
                                                >
                                                    {primary.section_subtitle}
                                                </span>
                                            )}

                                            {primary.section_title && (
                                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                                    {primary.section_title}
                                                </h3>
                                            )}

                                            {primary.section_content && (
                                                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                                                    {renderParagraphs(
                                                        primary.section_content
                                                    )}
                                                </div>
                                            )}

                                        </div>

                                    </article>
                                )}


                                {/* JUNIOR SECONDARY */}

                                {juniorSecondary && (
                                    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                                        {juniorSecondary.image_url && (
                                            <div className="h-56 overflow-hidden">

                                                <img
                                                    src={
                                                        juniorSecondary.image_url
                                                    }
                                                    alt={
                                                        juniorSecondary.section_title ||
                                                        "Junior secondary school"
                                                    }
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />

                                            </div>
                                        )}

                                        <div className="p-7">

                                            {juniorSecondary.section_subtitle && (
                                                <span
                                                    className="text-xs font-bold uppercase tracking-wider"
                                                    style={{
                                                        color: primaryColor,
                                                    }}
                                                >
                                                    {
                                                        juniorSecondary.section_subtitle
                                                    }
                                                </span>
                                            )}

                                            {juniorSecondary.section_title && (
                                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                                    {
                                                        juniorSecondary.section_title
                                                    }
                                                </h3>
                                            )}

                                            {juniorSecondary.section_content && (
                                                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                                                    {renderParagraphs(
                                                        juniorSecondary.section_content
                                                    )}
                                                </div>
                                            )}

                                        </div>

                                    </article>
                                )}


                                {/* SENIOR SECONDARY */}

                                {seniorSecondary && (
                                    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                                        {seniorSecondary.image_url && (
                                            <div className="h-56 overflow-hidden">

                                                <img
                                                    src={
                                                        seniorSecondary.image_url
                                                    }
                                                    alt={
                                                        seniorSecondary.section_title ||
                                                        "Senior secondary school"
                                                    }
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />

                                            </div>
                                        )}

                                        <div className="p-7">

                                            {seniorSecondary.section_subtitle && (
                                                <span
                                                    className="text-xs font-bold uppercase tracking-wider"
                                                    style={{
                                                        color: primaryColor,
                                                    }}
                                                >
                                                    {
                                                        seniorSecondary.section_subtitle
                                                    }
                                                </span>
                                            )}

                                            {seniorSecondary.section_title && (
                                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                                    {
                                                        seniorSecondary.section_title
                                                    }
                                                </h3>
                                            )}

                                            {seniorSecondary.section_content && (
                                                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                                                    {renderParagraphs(
                                                        seniorSecondary.section_content
                                                    )}
                                                </div>
                                            )}

                                        </div>

                                    </article>
                                )}

                            </div>
                        )}

                    </div>

                </section>
            )}


            {/* =========================================================
                SUBJECT AREAS
            ========================================================= */}

            {curriculum && (
                <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                    <div className="mx-auto max-w-7xl">

                        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

                            <div>

                                {curriculum.section_subtitle && (
                                    <p
                                        className="text-sm font-bold uppercase tracking-wider"
                                        style={{
                                            color: primaryColor,
                                        }}
                                    >
                                        {curriculum.section_subtitle}
                                    </p>
                                )}

                                {curriculum.section_title && (
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                        {curriculum.section_title}
                                    </h2>
                                )}

                                {curriculum.section_content && (
                                    <div className="mt-5 space-y-4 leading-7 text-slate-600">
                                        {renderParagraphs(
                                            curriculum.section_content
                                        )}
                                    </div>
                                )}

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">
                                {subjects.map((subject) => (
                                    <div
                                        key={subject.section_key}
                                        className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                            style={{
                                                backgroundColor: primaryColor,
                                            }}
                                        >
                                            ✓
                                        </div>

                                        <span className="text-sm font-semibold text-slate-700">
                                            {subject.section_title}
                                        </span>
                                    </div>
                                ))}
                            </div>

                        </div>

                    </div>

                </section>
            )}


            {/* =========================================================
                LEARNING APPROACH
            ========================================================= */}

            {learningApproach && (
                <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">

                    <div className="mx-auto max-w-7xl">

                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

                            {learningApproach.image_url && (
                                <div className="overflow-hidden rounded-3xl">

                                    <img
                                        src={learningApproach.image_url}
                                        alt={
                                            learningApproach.section_title ||
                                            "Learning approach"
                                        }
                                        className="h-[420px] w-full object-cover"
                                    />

                                </div>
                            )}


                            <div>

                                {learningApproach.section_subtitle && (
                                    <p
                                        className="text-sm font-bold uppercase tracking-wider"
                                        style={{
                                            color: "#93C5FD",
                                        }}
                                    >
                                        {learningApproach.section_subtitle}
                                    </p>
                                )}

                                {learningApproach.section_title && (
                                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                        {learningApproach.section_title}
                                    </h2>
                                )}

                                {learningApproach.section_content && (
                                    <p className="mt-5 leading-8 text-slate-300">
                                        {learningApproach.section_content}
                                    </p>
                                )}


                                {(studentCentred ||
                                    practicalExperiences ||
                                    continuousAssessment) && (
                                    <div className="mt-8 space-y-5">

                                        {studentCentred && (
                                            <div className="flex gap-4">

                                                <div
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                                                    style={{
                                                        backgroundColor:
                                                            primaryColor,
                                                    }}
                                                >
                                                    1
                                                </div>

                                                <div>

                                                    {studentCentred.section_title && (
                                                        <h3 className="font-bold">
                                                            {
                                                                studentCentred.section_title
                                                            }
                                                        </h3>
                                                    )}

                                                    {studentCentred.section_content && (
                                                        <p className="mt-1 text-sm leading-6 text-slate-400">
                                                            {
                                                                studentCentred.section_content
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>
                                        )}


                                        {practicalExperiences && (
                                            <div className="flex gap-4">

                                                <div
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                                                    style={{
                                                        backgroundColor:
                                                            primaryColor,
                                                    }}
                                                >
                                                    2
                                                </div>

                                                <div>

                                                    {practicalExperiences.section_title && (
                                                        <h3 className="font-bold">
                                                            {
                                                                practicalExperiences.section_title
                                                            }
                                                        </h3>
                                                    )}

                                                    {practicalExperiences.section_content && (
                                                        <p className="mt-1 text-sm leading-6 text-slate-400">
                                                            {
                                                                practicalExperiences.section_content
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>
                                        )}


                                        {continuousAssessment && (
                                            <div className="flex gap-4">

                                                <div
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                                                    style={{
                                                        backgroundColor:
                                                            primaryColor,
                                                    }}
                                                >
                                                    3
                                                </div>

                                                <div>

                                                    {continuousAssessment.section_title && (
                                                        <h3 className="font-bold">
                                                            {
                                                                continuousAssessment.section_title
                                                            }
                                                        </h3>
                                                    )}

                                                    {continuousAssessment.section_content && (
                                                        <p className="mt-1 text-sm leading-6 text-slate-400">
                                                            {
                                                                continuousAssessment.section_content
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>
                                        )}

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                </section>
            )}


            {/* =========================================================
                ACADEMIC EXCELLENCE
            ========================================================= */}

            {academicExcellence && (
                <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                    <div className="mx-auto max-w-7xl">

                        <div className="rounded-3xl bg-blue-50 p-8 sm:p-12 lg:p-16">

                            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">

                                <div>

                                    {academicExcellence.section_subtitle && (
                                        <p
                                            className="text-sm font-bold uppercase tracking-wider"
                                            style={{
                                                color: primaryColor,
                                            }}
                                        >
                                            {
                                                academicExcellence.section_subtitle
                                            }
                                        </p>
                                    )}

                                    {academicExcellence.section_title && (
                                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                            {
                                                academicExcellence.section_title
                                            }
                                        </h2>
                                    )}

                                    {academicExcellence.section_content && (
                                        <p className="mt-5 max-w-2xl leading-7 text-slate-600">
                                            {
                                                academicExcellence.section_content
                                            }
                                        </p>
                                    )}

                                </div>


                                {academicExcellence.button_text &&
                                    academicExcellence.button_url && (
                                        <Link
                                            to={
                                                academicExcellence.button_url
                                            }
                                            className="inline-flex justify-center rounded-lg px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                            style={{
                                                backgroundColor:
                                                    primaryColor,
                                            }}
                                        >
                                            {
                                                academicExcellence.button_text
                                            }
                                        </Link>
                                    )}

                            </div>

                        </div>

                    </div>

                </section>
            )}


            {/* =========================================================
                CTA
            ========================================================= */}

            {cta && (
                <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">

                    <div
                        className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-xl sm:px-12"
                        style={{
                            backgroundColor: primaryColor,
                        }}
                    >

                        {cta.section_subtitle && (
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                                {cta.section_subtitle}
                            </p>
                        )}

                        {cta.section_title && (
                            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                                {cta.section_title}
                            </h2>
                        )}

                        {cta.section_content && (
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                                {cta.section_content}
                            </p>
                        )}

                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                            {cta.button_text && cta.button_url && (
                                <Link
                                    to={cta.button_url}
                                    className="rounded-lg bg-white px-6 py-3 font-semibold transition hover:opacity-90"
                                    style={{
                                        color: primaryColor,
                                    }}
                                >
                                    {cta.button_text}
                                </Link>
                            )}

                            <Link
                                to="/website/contact"
                                className="rounded-lg border border-white/60 px-6 py-3 font-semibold transition hover:bg-white/10"
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

export default Academics;