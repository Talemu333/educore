import { Link } from "react-router-dom";
import { useWebsitePage } from "../../hooks/useWebsite";

function About() {
    const { data: page, isLoading, isError } = useWebsitePage("about");

    if (isLoading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--school-primary)]" />
                    <p className="mt-4 text-sm text-slate-500">Loading About page...</p>
                </div>
            </div>
        );
    }

    if (isError || !page) {
        return (
            <div className="flex min-h-[500px] items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Unable to load this page</h1>
                    <p className="mt-3 text-slate-600">
                        We could not load the About page at the moment. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    const sections = (page.sections || []).filter(
        (section) => section.is_active !== false
    );

    const getSection = (key) =>
        sections.find((section) => section.section_key === key);

    const renderContent = (content, className = "") => {
        if (!content) return null;

        const paragraphs = content
            .split(/\n\s*\n/)
            .filter(Boolean);

        return (
            <div className={className}>
                {paragraphs.map((paragraph, index) => (
                    <p key={index} className="mb-4 text-justify last:mb-0">
                        {paragraph.trim()}
                    </p>
                ))}
            </div>
        );
    };

    const hero = getSection("hero");
    const whoWeAre = getSection("who_we_are");
    const mission = getSection("mission");
    const vision = getSection("vision");
    const coreValues = getSection("core_values");
    const valueSections = [
        getSection("excellence"),
        getSection("integrity"),
        getSection("respect"),
        getSection("curiosity")
    ].filter(Boolean);
    const leadershipMessage = getSection("principal_message");
    const ourApproach = getSection("our_approach");
    const approachItems = [
        { section: getSection("understand"), number: "1" },
        { section: getSection("explore"), number: "2" },
        { section: getSection("apply"), number: "3" }
    ].filter(({ section }) => section);
    const aboutCta = getSection("about_cta");

    const fallback = {
        heroSubtitle: "About Our School",
        heroTitle: "Learn more about our school",
        heroContent:
            "Use this section to introduce your school, its history, educational philosophy and the community it serves.",
        whoSubtitle: "Who We Are",
        whoTitle: "Tell your school's story",
        whoContent:
            "Describe your school's history, values, educational approach and what makes the school a meaningful place for learners and families.",
        missionSubtitle: "Our Mission",
        missionTitle: "Our mission",
        missionContent:
            "Use this section to explain the purpose of your school and what it is committed to achieving for its learners and community.",
        visionSubtitle: "Our Vision",
        visionTitle: "Our vision",
        visionContent:
            "Use this section to describe the future your school is working towards and the impact it hopes to make.",
        valuesSubtitle: "What We Stand For",
        valuesTitle: "Our core values",
        valuesContent:
            "Describe the principles and values that guide your school community.",
        leadershipSubtitle: "A Message from School Leadership",
        leadershipTitle: "Leadership message",
        leadershipContent:
            "Use this section for a welcome message from your school leader or another person you would like to introduce to visitors.",
        approachSubtitle: "Our Approach",
        approachTitle: "How we support learning",
        approachContent:
            "Describe the approach, methods or principles your school uses to support learners.",
        ctaTitle: "Want to learn more?",
        ctaContent:
            "Use this section to encourage visitors to contact the school, explore admissions or take another relevant next step."
    };

    const valueIcons = {
        excellence: "⭐",
        integrity: "🛡️",
        respect: "🤝",
        curiosity: "💡"
    };

    return (
        <div className="bg-white">
            {hero && (
                <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white sm:px-10 sm:py-24 lg:px-16 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--school-primary-light)]">
                                {hero.section_subtitle || fallback.heroSubtitle}
                            </p>
                            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                {hero.section_title || fallback.heroTitle}
                            </h1>
                            <div className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                                {renderContent(hero.section_content || fallback.heroContent)}
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--school-primary)]/20" />
                    <div className="absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-[var(--school-primary)]/10" />
                </section>
            )}

            {whoWeAre && (
                <section className="px-6 py-20 sm:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div>
                                {whoWeAre.image_url ? (
                                    <div className="overflow-hidden rounded-3xl shadow-xl">
                                        <img
                                            src={whoWeAre.image_url}
                                            alt={whoWeAre.section_title || "About our school"}
                                            className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[480px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-[280px] items-center justify-center rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-500 sm:h-[360px] lg:h-[480px]">
                                        Add an image for this section from Website Management.
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--school-primary)]">
                                    {whoWeAre.section_subtitle || fallback.whoSubtitle}
                                </p>
                                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                    {whoWeAre.section_title || fallback.whoTitle}
                                </h2>
                                <div className="mt-6 leading-8 text-slate-600">
                                    {renderContent(whoWeAre.section_content || fallback.whoContent)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {(mission || vision) && (
                <section className="bg-slate-50 px-6 py-20 sm:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-6 md:grid-cols-2">
                            {mission && (
                                <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--school-primary)] text-2xl text-white">
                                        🎯
                                    </div>
                                    <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[var(--school-primary)]">
                                        {mission.section_subtitle || fallback.missionSubtitle}
                                    </p>
                                    <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
                                        {mission.section_title || fallback.missionTitle}
                                    </h2>
                                    <div className="mt-5 leading-7 text-slate-600">
                                        {renderContent(mission.section_content || fallback.missionContent)}
                                    </div>
                                </div>
                            )}

                            {vision && (
                                <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm sm:p-10">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--school-primary)] text-2xl">
                                        🌍
                                    </div>
                                    <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[var(--school-primary-light)]">
                                        {vision.section_subtitle || fallback.visionSubtitle}
                                    </p>
                                    <h2 className="mt-3 text-2xl font-extrabold">
                                        {vision.section_title || fallback.visionTitle}
                                    </h2>
                                    <div className="mt-5 leading-7 text-slate-300">
                                        {renderContent(vision.section_content || fallback.visionContent)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {coreValues && (
                <section className="px-6 py-20 sm:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--school-primary)]">
                                {coreValues.section_subtitle || fallback.valuesSubtitle}
                            </p>
                            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                                {coreValues.section_title || fallback.valuesTitle}
                            </h2>
                            <div className="mt-4 leading-7 text-slate-600">
                                {renderContent(coreValues.section_content || fallback.valuesContent)}
                            </div>
                        </div>

                        {valueSections.length > 0 && (
                            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {valueSections.map((value) => (
                                    <div key={value.id || value.section_key} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[var(--school-primary-soft)] text-2xl">
                                            {value.image_url ? (
                                                <img src={value.image_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                valueIcons[value.section_key] || "✦"
                                            )}
                                        </div>
                                        <h3 className="mt-5 text-lg font-bold">
                                            {value.section_title || "Add a value name"}
                                        </h3>
                                        <div className="mt-2 text-sm leading-6 text-slate-600">
                                            {renderContent(value.section_content || "Describe what this value means in your school community.")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {leadershipMessage && (
                <section className="bg-slate-50 px-6 py-20 sm:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                            <div>
                                {leadershipMessage.image_url ? (
                                    <div className="overflow-hidden rounded-3xl shadow-xl">
                                        <img
                                            src={leadershipMessage.image_url}
                                            alt={leadershipMessage.section_title || "School leadership"}
                                            className="mx-auto h-[300px] w-full max-w-md object-cover sm:h-[360px] lg:h-[420px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-[300px] items-center justify-center rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm sm:h-[360px] lg:h-[420px]">
                                        Add a leadership image here if your school wants to display one.
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--school-primary)]">
                                    {leadershipMessage.section_subtitle || fallback.leadershipSubtitle}
                                </p>
                                <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                                    {leadershipMessage.section_title || fallback.leadershipTitle}
                                </h2>
                                <div className="mt-6 leading-8 text-slate-600">
                                    {renderContent(leadershipMessage.section_content || fallback.leadershipContent)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {(ourApproach || approachItems.length > 0) && (
                <section className="px-6 py-20 sm:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--school-primary)]">
                                {ourApproach?.section_subtitle || fallback.approachSubtitle}
                            </p>
                            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                                {ourApproach?.section_title || fallback.approachTitle}
                            </h2>
                            <div className="mt-4 leading-7 text-slate-600">
                                {renderContent(ourApproach?.section_content || fallback.approachContent)}
                            </div>
                        </div>

                        {approachItems.length > 0 && (
                            <div className="mt-12 grid gap-6 md:grid-cols-3">
                                {approachItems.map(({ section, number }) => (
                                    <div key={section.id || section.section_key} className="rounded-2xl border bg-white p-7 shadow-sm">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--school-primary)] font-bold text-white">
                                            {number}
                                        </div>
                                        <h3 className="mt-5 text-xl font-bold text-slate-900">
                                            {section.section_title || `Step ${number}`}
                                        </h3>
                                        <div className="mt-3 leading-7 text-slate-600">
                                            {renderContent(section.section_content || "Describe this part of your school's learning approach.")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {aboutCta && (
                <section className="bg-slate-950 px-6 py-20 text-white sm:px-10 lg:px-16">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-3xl font-extrabold sm:text-4xl">
                            {aboutCta.section_title || fallback.ctaTitle}
                        </h2>
                        <div className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
                            {renderContent(aboutCta.section_content || fallback.ctaContent)}
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            {aboutCta.button_text && aboutCta.button_url ? (
                                <Link
                                    to={aboutCta.button_url}
                                    className="rounded-xl bg-[var(--school-primary)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
                                >
                                    {aboutCta.button_text}
                                </Link>
                            ) : (
                                <Link
                                    to="/contact"
                                    className="rounded-xl bg-[var(--school-primary)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
                                >
                                    Contact the School
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default About;
