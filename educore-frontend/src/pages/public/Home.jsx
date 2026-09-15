import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getPublishedGallery } from "@/api/galleryApi";
import { useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

import Loading from "@/components/common/Loading";

function Home() {
    const {
        data: page,
        isLoading,
        isError
    } = useWebsitePage("home");

    const { data: settings } = useSchoolSettings();

    const [gallery, setGallery] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const primaryColor = settings?.primary_color || "#1D4ED8";
    const schoolName = settings?.school_name || "Our School";

    useEffect(() => {
        let mounted = true;

        getPublishedGallery()
            .then((items) => {
                if (mounted) {
                    setGallery(Array.isArray(items) ? items.slice(0, 4) : []);
                }
            })
            .catch(() => {
                if (mounted) setGallery([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const sections = (page?.sections || []).filter(
        section => section.is_active !== false
    );

    const getSection = key =>
        sections.find(section => section.section_key === key);

    const hero = getSection("hero") || {};
    const welcome = getSection("welcome") || {};
    const schoolLevels = getSection("school_levels") || {};
    const whyChoose = getSection("why_choose") || {};
    const schoolLife = getSection("school_life") || {};
    const admissionsCta = getSection("admissions_cta") || {};
    const promise = getSection("promise") || {};

    const carouselSlides = gallery.length
        ? gallery
        : hero.image_url
            ? [{
                id: "hero-fallback",
                image_url: hero.image_url,
                title: hero.section_title || schoolName
            }]
            : [];

    useEffect(() => {
        setCurrentSlide(0);
    }, [carouselSlides.length]);

    useEffect(() => {
        if (carouselSlides.length < 2) return undefined;

        const timer = window.setInterval(() => {
            setCurrentSlide(previous =>
                (previous + 1) % carouselSlides.length
            );
        }, 5000);

        return () => window.clearInterval(timer);
    }, [carouselSlides.length]);

    const goToSlide = index => {
        setCurrentSlide(
            (index + carouselSlides.length) % carouselSlides.length
        );
    };

    const legacyLevelKeys = [
        "primary",
        "junior_secondary",
        "senior_secondary"
    ];

    const schoolLevelSections = sections.filter(section =>
        section.section_key?.startsWith("school_level_") ||
        legacyLevelKeys.includes(section.section_key)
    );

    const legacyFeatureKeys = [
        "quality_education",
        "caring_environment",
        "critical_thinking",
        "character_development"
    ];

    const featureSections = sections.filter(section =>
        section.section_key?.startsWith("why_choose_") ||
        legacyFeatureKeys.includes(section.section_key)
    );

    const fallbackLevels = [
        {
            id: "fallback-level-1",
            section_title: "Academic Level",
            section_content:
                "Use this section to introduce one of your school's academic levels or programmes."
        },
        {
            id: "fallback-level-2",
            section_title: "Learning Programme",
            section_content:
                "Describe the learners, programme structure, or educational stage offered by your school."
        },
        {
            id: "fallback-level-3",
            section_title: "Special Programme",
            section_content:
                "Use this space to highlight another academic programme, learning pathway, or school offering."
        }
    ];

    const fallbackFeatures = [
        {
            id: "fallback-feature-1",
            section_icon: "✓",
            section_title: "Quality Education",
            section_content:
                "Describe what quality education means at your school and how you deliver it."
        },
        {
            id: "fallback-feature-2",
            section_icon: "♥",
            section_title: "Supportive Learning",
            section_content:
                "Describe the learning environment, support systems, and care provided to learners."
        },
        {
            id: "fallback-feature-3",
            section_icon: "◆",
            section_title: "Student Development",
            section_content:
                "Explain how your school supports academic, personal, social, or practical development."
        },
        {
            id: "fallback-feature-4",
            section_icon: "★",
            section_title: "School Values",
            section_content:
                "Use this space to describe the values and qualities your school seeks to develop."
        }
    ];

    const displayLevels = schoolLevelSections.length
        ? schoolLevelSections
        : fallbackLevels;
    const displayFeatures = featureSections.length
        ? featureSections
        : fallbackFeatures;

    const hasPageError = isError || !page;

    if (isLoading) {
        return <Loading message="Loading website..." />;
    }

    const activeSlide = carouselSlides[currentSlide];

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-white">
            {hasPageError && (
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-center text-xs text-slate-500 sm:text-sm">
                    Website content is using editable fallback text. Update the Home page in Website Management to replace it with your school content.
                </div>
            )}

            <section className="relative overflow-hidden">
                <div className="grid lg:min-h-[650px] lg:grid-cols-2">
                    <div className="flex items-center bg-slate-950 px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-20 xl:px-20">
                        <div className="mx-auto w-full max-w-xl">
                            <div className="mb-7 flex min-w-0 items-center gap-3 sm:mb-8">
                                {settings?.school_logo ? (
                                    <img
                                        src={settings.school_logo}
                                        alt={`${schoolName} logo`}
                                        className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1 shadow-lg sm:h-14 sm:w-14"
                                    />
                                ) : (
                                    <div
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-extrabold shadow-lg sm:h-14 sm:w-14 sm:text-xl"
                                        style={{ color: primaryColor }}
                                    >
                                        {schoolName.slice(0, 2).toUpperCase()}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="truncate text-base font-bold sm:text-lg">
                                        {schoolName}
                                    </p>
                                    {settings?.school_level && (
                                        <p className="truncate text-xs text-slate-400">
                                            {settings.school_level}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <p
                                className="mb-4 text-xs font-bold uppercase tracking-[0.18em] sm:mb-5 sm:text-sm sm:tracking-[0.25em]"
                                style={{ color: primaryColor }}
                            >
                                {hero.section_subtitle || "Welcome to Our School"}
                            </p>

                            <h1 className="break-words text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                                {hero.section_title || "Excellence in Education"}
                            </h1>

                            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
                                {hero.section_content ||
                                    "Tell visitors about your school, its educational approach, and what makes your school a place where learners can grow and thrive."}
                            </p>

                            <div className="mt-7 sm:mt-8">
                                {hero.button_text && hero.button_url ? (
                                    <Link
                                        to={hero.button_url}
                                        className="inline-flex w-full rounded-lg px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {hero.button_text}
                                    </Link>
                                ) : (
                                    <Link
                                        to="/about"
                                        className="inline-flex w-full rounded-lg px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Explore Our School
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative min-h-[420px] overflow-hidden bg-slate-900 sm:min-h-[500px] lg:min-h-full">
                        {activeSlide?.image_url ? (
                            <div className="absolute inset-0">
                                {carouselSlides.map((slide, index) => (
                                    <img
                                        key={slide.id || slide.image_url || index}
                                        src={slide.image_url}
                                        alt={slide.title || `${schoolName} school`}
                                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                                            index === currentSlide
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                className="absolute inset-0"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <div className="flex h-full items-center justify-center p-8 text-center text-white/80">
                                    <p className="max-w-sm text-sm leading-6 sm:text-base">
                                        Add up to four published images in Website Management → Gallery to create the Home page carousel.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/25" />

                        {carouselSlides.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Previous slide"
                                    onClick={() => goToSlide(currentSlide - 1)}
                                    className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-xl text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/80"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    aria-label="Next slide"
                                    onClick={() => goToSlide(currentSlide + 1)}
                                    className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-xl text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/80"
                                >
                                    ›
                                </button>

                                <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
                                    {carouselSlides.map((slide, index) => (
                                        <button
                                            key={slide.id || index}
                                            type="button"
                                            aria-label={`Go to slide ${index + 1}`}
                                            aria-current={index === currentSlide}
                                            onClick={() => goToSlide(index)}
                                            className={`h-2.5 rounded-full transition-all ${
                                                index === currentSlide
                                                    ? "w-7 bg-white"
                                                    : "w-2.5 bg-white/55 hover:bg-white/80"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="absolute bottom-5 left-4 right-4 z-10 rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur sm:bottom-8 sm:left-auto sm:right-8 sm:w-80 sm:p-5">
                            <p
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {promise.section_subtitle || "Our Commitment"}
                            </p>
                            <p className="mt-2 text-base font-bold leading-6 text-slate-900 sm:text-lg">
                                {promise.section_title || "Shape this section around your school's promise"}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {promise.section_content ||
                                    "Use this space to describe the commitment your school makes to learners, parents, and the wider community."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
                        {welcome.image_url && (
                            <div className="relative">
                                <img
                                    src={welcome.image_url}
                                    alt={welcome.section_title || `${schoolName} campus`}
                                    className="h-72 w-full rounded-2xl object-cover shadow-xl sm:h-[450px] sm:rounded-3xl"
                                />
                            </div>
                        )}

                        <div className={!welcome.image_url ? "lg:col-span-2" : ""}>
                            <p
                                className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                                style={{ color: primaryColor }}
                            >
                                {welcome.section_subtitle || "Welcome"}
                            </p>
                            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-4 sm:text-4xl">
                                {welcome.section_title || "Tell visitors about your school"}
                            </h2>
                            <p className="mt-5 text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base sm:leading-8">
                                {welcome.section_content ||
                                    "Use this section to introduce your school, explain your educational philosophy, and share the information you want parents and visitors to know first."}
                            </p>

                            <Link
                                to={welcome.button_text && welcome.button_url ? welcome.button_url : "/about"}
                                className="mt-6 inline-flex items-center text-sm font-bold sm:mt-7"
                                style={{ color: primaryColor }}
                            >
                                {welcome.button_text || "Learn More About Our School"}
                                <span className="ml-2">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <p
                            className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                            style={{ color: primaryColor }}
                        >
                            {schoolLevels.section_subtitle || "Academic Programmes"}
                        </p>
                        <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-4xl">
                            {schoolLevels.section_title || "Explore Our Learning Levels"}
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                            {schoolLevels.section_content ||
                                "Use these cards to introduce the academic levels or programmes offered by your school. Add, edit, or remove them from Website Management."}
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
                        {displayLevels.map(level => (
                            <article
                                key={level.id || level.section_key}
                                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                {level.image_url ? (
                                    <img
                                        src={level.image_url}
                                        alt={level.section_title || "School programme"}
                                        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-56"
                                    />
                                ) : (
                                    <div
                                        className="flex h-28 items-center justify-center text-xs font-semibold sm:h-32"
                                        style={{
                                            backgroundColor: `${primaryColor}12`,
                                            color: primaryColor
                                        }}
                                    >
                                        Optional image
                                    </div>
                                )}
                                <div className="p-5 sm:p-6">
                                    {level.section_subtitle && (
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: primaryColor }}
                                        >
                                            {level.section_subtitle}
                                        </p>
                                    )}
                                    <h3 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                                        {level.section_title || "Academic Programme"}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {level.section_content || "Describe this academic level or programme here."}
                                    </p>
                                    {level.button_text && level.button_url && (
                                        <Link
                                            to={level.button_url}
                                            className="mt-5 inline-flex text-sm font-semibold"
                                            style={{ color: primaryColor }}
                                        >
                                            {level.button_text} →
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
                        <div>
                            <p
                                className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                                style={{ color: primaryColor }}
                            >
                                {whyChoose.section_subtitle || "Why Choose Us"}
                            </p>
                            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-4xl">
                                {whyChoose.section_title || "What makes your school special?"}
                            </h2>
                            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                                {whyChoose.section_content ||
                                    "Use this section to explain the qualities, approach, facilities, values, or experiences that make your school different."}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                            {displayFeatures.map(feature => (
                                <div
                                    key={feature.id || feature.section_key}
                                    className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div
                                        className="flex h-11 w-11 items-center justify-center rounded-xl text-xl sm:h-12 sm:w-12 sm:text-2xl"
                                        style={{
                                            backgroundColor: `${primaryColor}15`,
                                            color: primaryColor
                                        }}
                                    >
                                        {feature.section_icon || "•"}
                                    </div>
                                    <h3 className="mt-4 font-bold text-slate-900 sm:mt-5">
                                        {feature.section_title || "School Feature"}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {feature.section_content || "Describe this feature of your school here."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {(schoolLife.image_url || schoolLife.section_title || schoolLife.section_content) && (
                <section className="px-5 pb-14 sm:px-8 sm:pb-20 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-2xl bg-slate-900 sm:rounded-3xl">
                            {schoolLife.image_url ? (
                                <img
                                    src={schoolLife.image_url}
                                    alt={schoolLife.section_title || "School life"}
                                    className="h-[360px] w-full object-cover sm:h-[450px]"
                                />
                            ) : (
                                <div
                                    className="h-[300px] w-full sm:h-[380px]"
                                    style={{ backgroundColor: primaryColor }}
                                />
                            )}
                            <div className="absolute inset-0 bg-slate-950/55" />
                            <div className="absolute inset-0 flex items-center justify-center px-5 text-center sm:px-6">
                                <div className="w-full max-w-2xl text-white">
                                    <p
                                        className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                                        style={{ color: primaryColor }}
                                    >
                                        {schoolLife.section_subtitle || "School Life"}
                                    </p>
                                    <h2 className="mt-3 text-2xl font-extrabold sm:mt-4 sm:text-5xl">
                                        {schoolLife.section_title || "Showcase life at your school"}
                                    </h2>
                                    <p className="mt-4 text-sm leading-7 text-white/80 sm:mt-5 sm:text-base">
                                        {schoolLife.section_content ||
                                            "Use this section to share the activities, experiences, facilities, and community life that visitors should know about."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section
                className="px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-16"
                style={{ backgroundColor: primaryColor }}
            >
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70 sm:text-sm sm:tracking-[0.2em]">
                        {admissionsCta.section_subtitle || "Admissions"}
                    </p>
                    <h2 className="mt-3 text-2xl font-extrabold sm:mt-4 sm:text-5xl">
                        {admissionsCta.section_title || "Tell families how to begin"}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:mt-5 sm:text-base">
                        {admissionsCta.section_content ||
                            "Use this call-to-action to guide prospective families to your admission information, application process, or enquiry channel."}
                    </p>
                    <div className="mt-7 sm:mt-8">
                        <Link
                            to={admissionsCta.button_text && admissionsCta.button_url ? admissionsCta.button_url : "/admissions"}
                            className="inline-flex w-full rounded-lg bg-white px-7 py-3.5 text-center text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                            style={{ color: primaryColor }}
                        >
                            {admissionsCta.button_text || "View Admissions"}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
