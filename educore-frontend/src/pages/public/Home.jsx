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
    const [isCarouselPaused, setIsCarouselPaused] = useState(false);

    const primaryColor = settings?.primary_color || "#1D4ED8";
    const secondaryColor = settings?.secondary_color || "#D9B351";
    const schoolName = settings?.school_name || "Our School";

    useEffect(() => {
        const pageRoot = document.querySelector(".public-site");
        if (!pageRoot || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

        const revealTargets = pageRoot.querySelectorAll(
            "main > section, main section .grid > *"
        );

        if (!("IntersectionObserver" in window)) return undefined;

        revealTargets.forEach((element) => {
            element.setAttribute("data-scroll-reveal", "pending");
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.setAttribute("data-scroll-reveal", "visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });

        revealTargets.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, []);

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
        if (carouselSlides.length < 2 || isCarouselPaused) return undefined;

        const timer = window.setInterval(() => {
            setCurrentSlide(previous =>
                (previous + 1) % carouselSlides.length
            );
        }, 5000);

        return () => window.clearInterval(timer);
    }, [carouselSlides.length, isCarouselPaused]);

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
        <div className="public-site w-full max-w-full overflow-x-hidden bg-white">
            {hasPageError && (
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-center text-xs text-slate-500 sm:text-sm">
                    Website content is using editable fallback text. Update the Home page in Website Management to replace it with your school content.
                </div>
            )}

            <section
                className="relative isolate h-[90vh] min-h-0 overflow-hidden bg-slate-950 text-white"
            >
                {activeSlide?.image_url ? (
                    <div className="absolute inset-0 z-0">
                        {carouselSlides.map((slide, index) => (
                            <img
                                key={slide.id || slide.image_url || index}
                                src={slide.image_url}
                                alt={slide.title || `${schoolName} school`}
                                aria-hidden={index !== currentSlide}
                                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
                                    index === currentSlide ? "opacity-100" : "opacity-0"
                                }`}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, #0f172a 82%)` }}
                    />
                )}

                <div className="absolute inset-0 z-10 bg-slate-950/10" />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/40 via-slate-950/20 to-slate-950/5" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/20 via-slate-950/0 to-slate-950/5" />

                <div className="relative z-20 mx-auto flex min-h-[70vh] w-full max-w-[1600px] flex-col justify-center sm:min-h-0 sm:h-full px-5 pb-28 pt-20 sm:px-8 sm:pb-32 sm:pt-24 lg:px-16 xl:px-24">
                    <div className="max-w-3xl">
                        <div className="mb-8 flex min-w-0 items-center gap-3 sm:mb-10">
                            {settings?.school_logo ? (
                                <img
                                    src={settings.school_logo}
                                    alt={`${schoolName} logo`}
                                    className="h-12 w-12 shrink-0 rounded-xl border border-white/20 bg-white object-contain p-1 shadow-lg sm:h-14 sm:w-14"
                                />
                            ) : (
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white text-lg font-extrabold shadow-lg sm:h-14 sm:w-14 sm:text-xl"
                                    style={{ color: primaryColor }}
                                >
                                    {schoolName.slice(0, 2).toUpperCase()}
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="break-words text-sm font-bold leading-tight sm:text-lg">{schoolName}</p>
                                {settings?.school_level && (
                                    <p className="mt-1 text-xs text-white/70 sm:text-sm">{settings.school_level}</p>
                                )}
                            </div>
                        </div>

                        <p
                            className="mb-4 text-xs font-bold uppercase tracking-[0.2em] sm:mb-5 sm:text-sm sm:tracking-[0.28em]"
                            style={{ color: secondaryColor }}
                        >
                            {hero.section_subtitle || "Welcome to Our School"}
                        </p>

                        <h1 className="max-w-3xl break-words text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                            {hero.section_title || "Excellence in Education"}
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:mt-7 sm:text-lg sm:leading-8 lg:text-xl">
                            {hero.section_content ||
                                "Tell visitors about your school, its educational approach, and what makes your school a place where learners can grow and thrive."}
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
                            <Link
                                to={hero.button_text && hero.button_url ? hero.button_url : "/about"}
                                className="inline-flex min-h-12 items-center justify-center rounded-xl px-7 py-3.5 text-center text-sm font-bold shadow-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
                                style={{ backgroundColor: secondaryColor, color: primaryColor }}
                            >
                                {hero.button_text || "Explore Our School"}
                                <span className="ml-2" aria-hidden="true">→</span>
                            </Link>
                            <Link
                                to="/admissions"
                                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-7 py-3.5 text-center text-sm font-bold text-white backdrop-blur-sm transition duration-300 hover:bg-white/20 sm:w-auto"
                            >
                                Discover Admissions
                            </Link>
                        </div>
                    </div>

                    {(promise.section_title || promise.section_content) && (
                        <div className="mt-10 max-w-xl rounded-2xl border border-white/20 bg-slate-950/45 p-5 shadow-2xl backdrop-blur-md sm:mt-12 sm:p-6">
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: secondaryColor }}>
                                {promise.section_subtitle || "Our Commitment"}
                            </p>
                            <p className="mt-2 text-lg font-bold leading-6 sm:text-xl">
                                {promise.section_title || "Committed to every learner"}
                            </p>
                            {promise.section_content && (
                                <p className="mt-2 text-sm leading-6 text-white/75">{promise.section_content}</p>
                            )}
                        </div>
                    )}
                </div>

                {carouselSlides.length > 1 && (
                    <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8 lg:left-16 lg:right-16 xl:left-24 xl:right-24">
                        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 backdrop-blur-md">
                            {carouselSlides.map((slide, index) => (
                                <button
                                    key={slide.id || slide.image_url || index}
                                    type="button"
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={index === currentSlide ? "true" : undefined}
                                    onClick={() => {
                                        goToSlide(index);
                                        setIsCarouselPaused(true);
                                    }}
                                    className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                                        index === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/90"
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Previous slide"
                                onClick={() => {
                                    goToSlide(currentSlide - 1);
                                    setIsCarouselPaused(true);
                                }}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-2xl text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            ><span aria-hidden="true">‹</span></button>
                            <button
                                type="button"
                                aria-label="Next slide"
                                onClick={() => {
                                    goToSlide(currentSlide + 1);
                                    setIsCarouselPaused(true);
                                }}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-2xl text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            ><span aria-hidden="true">›</span></button>
                            <button
                                type="button"
                                aria-label={isCarouselPaused ? "Resume automatic slides" : "Pause automatic slides"}
                                onClick={() => setIsCarouselPaused(paused => !paused)}
                                className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 bg-black/35 px-3 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-4"
                            >{isCarouselPaused ? "Play" : "Pause"}</button>
                        </div>
                    </div>
                )}

                {carouselSlides.length === 0 && (
                    <p className="absolute bottom-5 right-5 z-20 max-w-xs text-right text-xs text-white/65 sm:bottom-8 sm:right-8">
                        Add published photos in Website Management → Gallery to create your school photo carousel.
                    </p>
                )}
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
                                style={{ color: secondaryColor }}
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

                    <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                        {displayLevels.map(level => (
                            <article
                                key={level.id || level.section_key}
                                className="group min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                {level.image_url ? (
                                    <img
                                        src={level.image_url}
                                        alt={level.section_title || "School programme"}
                                        className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-52 lg:h-48"
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
                                <div className="min-w-0 p-5 sm:p-6">
                                    {level.section_subtitle && (
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: primaryColor }}
                                        >
                                            {level.section_subtitle}
                                        </p>
                                    )}
                                    <h3 className="mt-2 break-words text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                                        {level.section_title || "Academic Programme"}
                                    </h3>
                                    <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                                        {level.section_content || "Describe this academic level or programme here."}
                                    </p>
                                    {level.button_text && level.button_url && (
                                        <Link
                                            to={level.button_url}
                                            className="mt-5 inline-flex text-sm font-semibold"
                                            style={{ color: secondaryColor }}
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
                                style={{ color: secondaryColor }}
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


        </div>
    );
}

export default Home;
