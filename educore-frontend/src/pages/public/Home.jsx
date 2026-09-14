import { Link } from "react-router-dom";

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

    const primaryColor =
        settings?.primary_color ||
        "#1D4ED8";

    if (isLoading) {
        return <Loading message="Loading website..." />;
    }

    if (isError || !page) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="w-full max-w-xl text-center">
                    <h1 className="break-words text-3xl font-bold text-slate-900 sm:text-4xl">
                        {settings?.school_name || "School"}
                    </h1>
                </div>
            </div>
        );
    }

    const sections = (page.sections || []).filter(
        section => section.is_active !== false
    );

    const getSection = key =>
        sections.find(section => section.section_key === key);

    const hero = getSection("hero");
    const welcome = getSection("welcome");
    const schoolLevels = getSection("school_levels");
    const whyChoose = getSection("why_choose");
    const schoolLife = getSection("school_life");
    const admissionsCta = getSection("admissions_cta");
    const promise = getSection("promise");

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

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-white">

            {hero && (
                <section className="relative overflow-hidden">
                    <div className="grid lg:min-h-[650px] lg:grid-cols-2">

                        <div className="flex items-center bg-slate-950 px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-20 xl:px-20">
                            <div className="mx-auto w-full max-w-xl">

                                <div className="mb-7 flex min-w-0 items-center gap-3 sm:mb-8">
                                    {settings?.school_logo ? (
                                        <img
                                            src={settings.school_logo}
                                            alt={settings.school_name || "School logo"}
                                            className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1 shadow-lg sm:h-14 sm:w-14"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-extrabold shadow-lg sm:h-14 sm:w-14 sm:text-xl"
                                            style={{ color: primaryColor }}
                                        >
                                            {(settings?.school_name || "S")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <p className="truncate text-base font-bold sm:text-lg">
                                            {settings?.school_name || "School"}
                                        </p>
                                        {settings?.school_level && (
                                            <p className="truncate text-xs text-slate-400">
                                                {settings.school_level}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {hero.section_subtitle && (
                                    <p
                                        className="mb-4 text-xs font-bold uppercase tracking-[0.18em] sm:mb-5 sm:text-sm sm:tracking-[0.25em]"
                                        style={{ color: primaryColor }}
                                    >
                                        {hero.section_subtitle}
                                    </p>
                                )}

                                {hero.section_title && (
                                    <h1 className="break-words text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                                        {hero.section_title}
                                    </h1>
                                )}

                                {hero.section_content && (
                                    <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
                                        {hero.section_content}
                                    </p>
                                )}

                                {hero.button_text && hero.button_url && (
                                    <div className="mt-7 sm:mt-8">
                                        <Link
                                            to={hero.button_url}
                                            className="inline-flex w-full rounded-lg px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {hero.button_text}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-full">
                            {hero.image_url ? (
                                <img
                                    src={hero.image_url}
                                    alt={hero.section_title || "School"}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <div
                                    className="absolute inset-0"
                                    style={{ backgroundColor: primaryColor }}
                                />
                            )}

                            <div className="absolute inset-0 bg-slate-950/20" />

                            {promise && (promise.section_title || promise.section_content) && (
                                <div className="absolute bottom-5 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur sm:bottom-8 sm:left-auto sm:right-8 sm:w-80 sm:p-5">
                                    {promise.section_subtitle && (
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: primaryColor }}
                                        >
                                            {promise.section_subtitle}
                                        </p>
                                    )}
                                    {promise.section_title && (
                                        <p className="mt-2 text-base font-bold leading-6 text-slate-900 sm:text-lg">
                                            {promise.section_title}
                                        </p>
                                    )}
                                    {promise.section_content && (
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {promise.section_content}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {welcome && (welcome.section_title || welcome.section_content || welcome.image_url) && (
                <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
                            {welcome.image_url && (
                                <div className="relative">
                                    <img
                                        src={welcome.image_url}
                                        alt={welcome.section_title || "School"}
                                        className="h-72 w-full rounded-2xl object-cover shadow-xl sm:h-[450px] sm:rounded-3xl"
                                    />
                                </div>
                            )}

                            <div className={!welcome.image_url ? "lg:col-span-2" : ""}>
                                {welcome.section_subtitle && (
                                    <p
                                        className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                                        style={{ color: primaryColor }}
                                    >
                                        {welcome.section_subtitle}
                                    </p>
                                )}

                                {welcome.section_title && (
                                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-4 sm:text-4xl">
                                        {welcome.section_title}
                                    </h2>
                                )}

                                {welcome.section_content && (
                                    <p className="mt-5 text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base sm:leading-8">
                                        {welcome.section_content}
                                    </p>
                                )}

                                {welcome.button_text && welcome.button_url && (
                                    <Link
                                        to={welcome.button_url}
                                        className="mt-6 inline-flex items-center text-sm font-bold sm:mt-7"
                                        style={{ color: primaryColor }}
                                    >
                                        {welcome.button_text}
                                        <span className="ml-2">→</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {schoolLevels && schoolLevelSections.length > 0 && (
                <section className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        {(schoolLevels.section_title || schoolLevels.section_content) && (
                            <div className="mx-auto max-w-2xl text-center">
                                {schoolLevels.section_subtitle && (
                                    <p
                                        className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                                        style={{ color: primaryColor }}
                                    >
                                        {schoolLevels.section_subtitle}
                                    </p>
                                )}
                                {schoolLevels.section_title && (
                                    <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-4xl">
                                        {schoolLevels.section_title}
                                    </h2>
                                )}
                                {schoolLevels.section_content && (
                                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                        {schoolLevels.section_content}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
                            {schoolLevelSections.map(level => (
                                <article
                                    key={level.id}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {level.image_url && (
                                        <img
                                            src={level.image_url}
                                            alt={level.section_title || "School programme"}
                                            className="h-48 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-56"
                                        />
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
                                        {level.section_title && (
                                            <h3 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                                                {level.section_title}
                                            </h3>
                                        )}
                                        {level.section_content && (
                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                {level.section_content}
                                            </p>
                                        )}
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
            )}

            {whyChoose && featureSections.length > 0 && (
                <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
                            <div>
                                {whyChoose.section_subtitle && (
                                    <p
                                        className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                                        style={{ color: primaryColor }}
                                    >
                                        {whyChoose.section_subtitle}
                                    </p>
                                )}
                                {whyChoose.section_title && (
                                    <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-4xl">
                                        {whyChoose.section_title}
                                    </h2>
                                )}
                                {whyChoose.section_content && (
                                    <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                                        {whyChoose.section_content}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                                {featureSections.map(feature => (
                                    <div
                                        key={feature.id}
                                        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
                                    >
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl sm:h-12 sm:w-12 sm:text-2xl"
                                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                        >
                                            {feature.section_icon || "•"}
                                        </div>
                                        {feature.section_title && (
                                            <h3 className="mt-4 font-bold text-slate-900 sm:mt-5">
                                                {feature.section_title}
                                            </h3>
                                        )}
                                        {feature.section_content && (
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {feature.section_content}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {schoolLife && (schoolLife.image_url || schoolLife.section_title || schoolLife.section_content) && (
                <section className="px-5 pb-14 sm:px-8 sm:pb-20 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-2xl bg-slate-900 sm:rounded-3xl">
                            {schoolLife.image_url && (
                                <img
                                    src={schoolLife.image_url}
                                    alt={schoolLife.section_title || "School life"}
                                    className="h-[360px] w-full object-cover sm:h-[450px]"
                                />
                            )}
                            <div className="absolute inset-0 bg-slate-950/55" />
                            <div className="absolute inset-0 flex items-center justify-center px-5 text-center sm:px-6">
                                <div className="w-full max-w-2xl text-white">
                                    {schoolLife.section_subtitle && (
                                        <p
                                            className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
                                            style={{ color: primaryColor }}
                                        >
                                            {schoolLife.section_subtitle}
                                        </p>
                                    )}
                                    {schoolLife.section_title && (
                                        <h2 className="mt-3 text-2xl font-extrabold sm:mt-4 sm:text-5xl">
                                            {schoolLife.section_title}
                                        </h2>
                                    )}
                                    {schoolLife.section_content && (
                                        <p className="mt-4 text-sm leading-7 text-white/80 sm:mt-5 sm:text-base">
                                            {schoolLife.section_content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {admissionsCta && (admissionsCta.section_title || admissionsCta.section_content || admissionsCta.button_text) && (
                <section
                    className="px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-16"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="mx-auto max-w-4xl text-center">
                        {admissionsCta.section_subtitle && (
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70 sm:text-sm sm:tracking-[0.2em]">
                                {admissionsCta.section_subtitle}
                            </p>
                        )}
                        {admissionsCta.section_title && (
                            <h2 className="mt-3 text-2xl font-extrabold sm:mt-4 sm:text-5xl">
                                {admissionsCta.section_title}
                            </h2>
                        )}
                        {admissionsCta.section_content && (
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:mt-5 sm:text-base">
                                {admissionsCta.section_content}
                            </p>
                        )}
                        {admissionsCta.button_text && admissionsCta.button_url && (
                            <div className="mt-7 sm:mt-8">
                                <Link
                                    to={admissionsCta.button_url}
                                    className="inline-flex w-full rounded-lg bg-white px-7 py-3.5 text-center text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                                    style={{ color: primaryColor }}
                                >
                                    {admissionsCta.button_text}
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </div>
    );
}


export default Home;
