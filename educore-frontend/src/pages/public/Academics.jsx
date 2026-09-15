import { Link } from "react-router-dom";
import { useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

function Academics() {
    const { data: page, isLoading, isError } = useWebsitePage("academics");
    const { data: settings } = useSchoolSettings();
    const primaryColor = settings?.primary_color || "#1D4ED8";

    const sections = (page?.sections || []).filter(
        (section) => section.is_active !== false
    );

    const getSection = (key) =>
        sections.find((section) => section.section_key === key);

    const hero = getSection("hero");
    const introduction = getSection("introduction");
    const programmes = getSection("programmes");
    const curriculum = getSection("curriculum");
    const learningApproach = getSection("learning_approach");
    const studentCentred = getSection("student_centred");
    const practicalExperiences = getSection("practical_experiences");
    const continuousAssessment = getSection("continuous_assessment");
    const academicExcellence = getSection("academic_excellence");
    const cta = getSection("academics_cta");

    const legacyProgrammeKeys = [
        "primary",
        "junior_secondary",
        "senior_secondary",
    ];

    const programmeSections = sections.filter(
        (section) =>
            section.section_key?.startsWith("programme_") ||
            section.section_key?.startsWith("academic_programme_") ||
            section.section_key?.startsWith("school_level_") ||
            legacyProgrammeKeys.includes(section.section_key)
    );

    const legacySubjectKeys = [
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

    const subjectSections = sections.filter(
        (section) =>
            section.section_key?.startsWith("subject_") ||
            section.section_key?.startsWith("academic_subject_") ||
            legacySubjectKeys.includes(section.section_key)
    );

    const renderParagraphs = (content) => {
        if (!content) return null;
        return content
            .split("\n")
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => <p key={index}>{paragraph}</p>);
    };

    const fallback = {
        heroSubtitle: "Academic Programmes",
        heroTitle: "Learning for Growth and Development",
        heroContent:
            "Use this section to introduce your school's academic programmes, curriculum and approach to learning.",
        heroButton: "Explore Programmes",
        introSubtitle: "Our Academics",
        introTitle: "A Learning Experience Designed for Your School",
        introContent:
            "Use this section to describe the academic experience your school provides, including the subjects, programmes and learning opportunities available to students.",
        programmesSubtitle: "Programmes",
        programmesTitle: "Our Academic Programmes",
        programmesContent:
            "Add your school's academic levels or programmes here. Each programme can be described and updated from Website Management.",
        curriculumSubtitle: "Curriculum",
        curriculumTitle: "Subjects and Areas of Study",
        curriculumContent:
            "Use this section to present the subjects or areas of study offered by your school. Add only the subjects that apply to your school.",
        approachSubtitle: "Learning Approach",
        approachTitle: "How Learning Happens",
        approachContent:
            "Describe the teaching methods, learning experiences and academic practices that are relevant to your school.",
        excellenceSubtitle: "Academic Focus",
        excellenceTitle: "Your Academic Priorities",
        excellenceContent:
            "Use this space to explain the academic goals or priorities your school wants families and learners to understand.",
        ctaSubtitle: "Learn More",
        ctaTitle: "Explore Your School's Academic Offering",
        ctaContent:
            "Update this section with a useful next step for parents, students or visitors who want to learn more about your academic programmes.",
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="text-center">
                    <div
                        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200"
                        style={{ borderTopColor: primaryColor }}
                    />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading academics page...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white px-6">
                <div className="w-full max-w-xl text-center">
                    <p
                        className="text-xs font-bold uppercase tracking-[0.2em]"
                        style={{ color: primaryColor }}
                    >
                        {fallback.heroSubtitle}
                    </p>
                    <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-5xl">
                        {fallback.heroTitle}
                    </h1>
                    <p className="mt-5 leading-7 text-slate-600">
                        {fallback.heroContent}
                    </p>
                </div>
            </div>
        );
    }

    const heroSubtitle = hero?.section_subtitle || fallback.heroSubtitle;
    const heroTitle = hero?.section_title || fallback.heroTitle;
    const heroContent = hero?.section_content || fallback.heroContent;
    const heroButtonText = hero?.button_text || fallback.heroButton;

    return (
        <div className="bg-white">
            <section className="relative overflow-hidden bg-slate-950 text-white">
                {hero?.image_url && (
                    <div className="absolute inset-0">
                        <img
                            src={hero.image_url}
                            alt={heroTitle}
                            className="h-full w-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-slate-950/70" />
                    </div>
                )}
                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="max-w-3xl">
                        <p
                            className="text-sm font-bold uppercase tracking-[0.2em]"
                            style={{ color: primaryColor }}
                        >
                            {heroSubtitle}
                        </p>
                        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            {heroTitle}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                            {heroContent}
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            {hero?.button_url ? (
                                <Link
                                    to={hero.button_url}
                                    className="rounded-lg bg-white px-6 py-3.5 text-center text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                                    style={{ color: primaryColor }}
                                >
                                    {heroButtonText}
                                </Link>
                            ) : (
                                <a
                                    href="#programmes"
                                    className="rounded-lg bg-white px-6 py-3.5 text-center text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                                    style={{ color: primaryColor }}
                                >
                                    {heroButtonText}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {introduction?.section_subtitle || fallback.introSubtitle}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {introduction?.section_title || fallback.introTitle}
                            </h2>
                            <div className="mt-5 space-y-4 leading-8 text-slate-600">
                                {renderParagraphs(
                                    introduction?.section_content || fallback.introContent
                                )}
                            </div>
                            {introduction?.button_text && introduction?.button_url && (
                                <Link
                                    to={introduction.button_url}
                                    className="mt-7 inline-flex items-center font-semibold"
                                    style={{ color: primaryColor }}
                                >
                                    {introduction.button_text}
                                    <span className="ml-2">→</span>
                                </Link>
                            )}
                        </div>
                        {introduction?.image_url ? (
                            <img
                                src={introduction.image_url}
                                alt={introduction.section_title || fallback.introTitle}
                                className="h-[420px] w-full rounded-3xl object-cover shadow-xl"
                            />
                        ) : (
                            <div
                                className="flex min-h-[300px] items-center justify-center rounded-3xl p-8 text-center"
                                style={{ backgroundColor: `${primaryColor}10` }}
                            >
                                <p className="max-w-sm text-sm leading-7 text-slate-600">
                                    Add an optional academic image from Website Management if your school wants one displayed here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section
                id="programmes"
                className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                        >
                            {programmes?.section_subtitle || fallback.programmesSubtitle}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {programmes?.section_title || fallback.programmesTitle}
                        </h2>
                        <p className="mt-5 leading-7 text-slate-600">
                            {programmes?.section_content || fallback.programmesContent}
                        </p>
                    </div>

                    {programmeSections.length > 0 ? (
                        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                            {programmeSections.map((programme) => (
                                <article
                                    key={programme.id || programme.section_key}
                                    className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {programme.image_url && (
                                        <div className="h-56 overflow-hidden">
                                            <img
                                                src={programme.image_url}
                                                alt={programme.section_title || "Academic programme"}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="p-7">
                                        {programme.section_subtitle && (
                                            <span
                                                className="text-xs font-bold uppercase tracking-wider"
                                                style={{ color: primaryColor }}
                                            >
                                                {programme.section_subtitle}
                                            </span>
                                        )}
                                        <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                            {programme.section_title || "Academic Programme"}
                                        </h3>
                                        <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                                            {renderParagraphs(
                                                programme.section_content ||
                                                    "Describe this academic programme, the learners it serves and any important information parents should know."
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 rounded-2xl border border-dashed bg-white p-8 text-center">
                            <h3 className="text-lg font-bold text-slate-900">
                                Add Your Academic Programmes
                            </h3>
                            <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                                Use Website Management to add the academic levels or programmes offered by your school. You are not required to use any particular programme.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {curriculum?.section_subtitle || fallback.curriculumSubtitle}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {curriculum?.section_title || fallback.curriculumTitle}
                            </h2>
                            <div className="mt-5 space-y-4 leading-7 text-slate-600">
                                {renderParagraphs(
                                    curriculum?.section_content || fallback.curriculumContent
                                )}
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {subjectSections.length > 0 ? (
                                subjectSections.map((subject) => (
                                    <div
                                        key={subject.id || subject.section_key}
                                        className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm"
                                    >
                                        <div
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {subject.section_icon || "✓"}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">
                                            {subject.section_title || "Subject area"}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="sm:col-span-2 rounded-2xl border border-dashed p-8 text-center">
                                    <p className="text-sm leading-7 text-slate-600">
                                        Add the subjects or areas of study relevant to your school from Website Management. The page does not require a fixed subject list.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        {learningApproach?.image_url && (
                            <div className="overflow-hidden rounded-3xl">
                                <img
                                    src={learningApproach.image_url}
                                    alt={learningApproach.section_title || fallback.approachTitle}
                                    className="h-[420px] w-full object-cover"
                                />
                            </div>
                        )}
                        <div className={!learningApproach?.image_url ? "lg:col-span-2" : ""}>
                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {learningApproach?.section_subtitle || fallback.approachSubtitle}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                {learningApproach?.section_title || fallback.approachTitle}
                            </h2>
                            <p className="mt-5 leading-8 text-slate-300">
                                {learningApproach?.section_content || fallback.approachContent}
                            </p>

                            <div className="mt-8 space-y-5">
                                {[
                                    studentCentred,
                                    practicalExperiences,
                                    continuousAssessment,
                                ].map((item, index) => (
                                    <div key={item?.id || index} className="flex gap-4">
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">
                                                {item?.section_title ||
                                                    [
                                                        "Describe a key learning practice",
                                                        "Describe practical learning opportunities",
                                                        "Describe how learning is assessed",
                                                    ][index]}
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                {item?.section_content ||
                                                    "Use Website Management to replace this placeholder with information that reflects your school's approach."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div
                        className="rounded-3xl p-8 sm:p-12 lg:p-16"
                        style={{ backgroundColor: `${primaryColor}10` }}
                    >
                        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                            <div>
                                <p
                                    className="text-sm font-bold uppercase tracking-wider"
                                    style={{ color: primaryColor }}
                                >
                                    {academicExcellence?.section_subtitle || fallback.excellenceSubtitle}
                                </p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    {academicExcellence?.section_title || fallback.excellenceTitle}
                                </h2>
                                <p className="mt-5 max-w-2xl leading-7 text-slate-600">
                                    {academicExcellence?.section_content || fallback.excellenceContent}
                                </p>
                            </div>
                            {academicExcellence?.button_text && academicExcellence?.button_url && (
                                <Link
                                    to={academicExcellence.button_url}
                                    className="inline-flex justify-center rounded-lg px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {academicExcellence.button_text}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                <div
                    className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-xl sm:px-12"
                    style={{ backgroundColor: primaryColor }}
                >
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                        {cta?.section_subtitle || fallback.ctaSubtitle}
                    </p>
                    <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                        {cta?.section_title || fallback.ctaTitle}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                        {cta?.section_content || fallback.ctaContent}
                    </p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        {cta?.button_text && cta?.button_url && (
                            <Link
                                to={cta.button_url}
                                className="rounded-lg bg-white px-6 py-3 font-semibold transition hover:opacity-90"
                                style={{ color: primaryColor }}
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
        </div>
    );
}

export default Academics;
