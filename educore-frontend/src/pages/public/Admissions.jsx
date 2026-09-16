import { Link } from "react-router-dom";
import { useWebsitePage } from "@/hooks/useWebsite";

function Admissions() {
    const primaryColor = "var(--school-primary, #1D4ED8)";

    const { data: page, isLoading, isError } = useWebsitePage("admissions");
    const sections = page?.sections || [];

    const getSection = (key) =>
        sections.find(
            (section) =>
                section.section_key === key && section.is_active !== false
        );

    const hero = getSection("hero");
    const introduction = getSection("introduction");
    const admissionProcess = getSection("admission_process");
    const requirements = getSection("requirements");
    const requirementsNotice = getSection("requirements_notice");
    const whyChooseUs = getSection("why_choose_us");
    const faq = getSection("faq");
    const cta = getSection("admissions_cta");

    const programmeSections = ["primary", "secondary"]
        .map((key) => getSection(key))
        .filter(Boolean);

    const admissionSteps = sections
        .filter(
            (section) =>
                section.section_key?.startsWith("admission_step_") &&
                section.is_active !== false
        )
        .sort((a, b) =>
            parseInt(a.section_key.replace("admission_step_", ""), 10) -
            parseInt(b.section_key.replace("admission_step_", ""), 10)
        );

    const requirementSections = sections
        .filter(
            (section) =>
                section.section_key?.startsWith("requirement_") &&
                section.is_active !== false
        )
        .sort((a, b) =>
            parseInt(a.section_key.replace("requirement_", ""), 10) -
            parseInt(b.section_key.replace("requirement_", ""), 10)
        );

    const whyChooseKeys = [
        "strong_academics",
        "character_development",
        "supportive_teachers",
        "safe_environment",
    ];

    const whyChooseSections = whyChooseKeys
        .map((key) => getSection(key))
        .filter(Boolean);

    const faqSections = sections
        .filter(
            (section) =>
                section.section_key?.startsWith("faq_") &&
                section.is_active !== false
        )
        .sort((a, b) =>
            parseInt(a.section_key.replace("faq_", ""), 10) -
            parseInt(b.section_key.replace("faq_", ""), 10)
        );

    const renderParagraphs = (content, fallback) => {
        const text = content || fallback;
        return text
            .split("\n")
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => <p key={index}>{paragraph}</p>);
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
                        Loading admissions page...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white px-6">
                <div className="max-w-xl text-center">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Admissions information
                    </h2>
                    <p className="mt-3 text-slate-600">
                        This page can be used to provide information about your school’s admission process, requirements and how prospective families can get in touch.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* HERO */}
            <section className="relative overflow-hidden bg-slate-950 text-white">
                {hero?.image_url && (
                    <div className="absolute inset-0">
                        <img
                            src={hero.image_url}
                            alt={hero.section_title || "Admissions"}
                            className="h-full w-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-slate-950/75" />
                    </div>
                )}

                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="max-w-3xl">
                        <p
                            className="text-sm font-bold uppercase tracking-[0.2em]"
                            style={{ color: primaryColor }}
                        >
                            {hero?.section_subtitle || "Admissions"}
                        </p>
                        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            {hero?.section_title || "Admissions at Our School"}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                            {hero?.section_content ||
                                "Use this section to introduce your school’s admission opportunities, who can apply and what prospective families should know."}
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href={hero?.button_url || "#application"}
                                className="rounded-lg bg-white px-6 py-3.5 text-center text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                                style={{ color: primaryColor }}
                            >
                                {hero?.button_text || "View Admission Information"}
                            </a>
                            <Link
                                to="/website/contact"
                                className="rounded-lg border border-white/50 px-6 py-3.5 text-center text-sm font-semibold transition hover:bg-white/10"
                            >
                                Contact the School
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* INTRODUCTION */}
            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {introduction?.section_subtitle || "Welcome"}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {introduction?.section_title ||
                                    "Information for prospective families"}
                            </h2>
                            <div className="mt-5 space-y-4 leading-8 text-slate-600">
                                {renderParagraphs(
                                    introduction?.section_content,
                                    "Use this section to explain your school’s admission opportunities, the type of learner you welcome and any information families should know before making an enquiry.\nSchools can replace this text from Website Management."
                                )}
                            </div>

                            {programmeSections.length > 0 && (
                                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                    {programmeSections.map((programme) => (
                                        <div
                                            key={programme.id || programme.section_key}
                                            className="rounded-xl bg-slate-50 p-5"
                                        >
                                            <p
                                                className="text-xl font-extrabold"
                                                style={{ color: primaryColor }}
                                            >
                                                {programme.section_title}
                                            </p>
                                            {programme.section_content && (
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {programme.section_content}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {introduction?.image_url && (
                            <div className="overflow-hidden rounded-3xl">
                                <img
                                    src={introduction.image_url}
                                    alt={introduction.section_title || "Admissions information"}
                                    className="h-[460px] w-full object-cover shadow-xl"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ADMISSION PROCESS */}
            <section
                id="application"
                className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                        >
                            {admissionProcess?.section_subtitle || "Admission Process"}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {admissionProcess?.section_title || "How to apply"}
                        </h2>
                        <p className="mt-5 leading-7 text-slate-600">
                            {admissionProcess?.section_content ||
                                "Use this section to describe the steps a prospective family should follow from first enquiry to admission."}
                        </p>
                    </div>

                    {admissionSteps.length > 0 ? (
                        <div className="mt-14 grid gap-8 lg:grid-cols-5">
                            {admissionSteps.map((step, index) => (
                                <div key={step.id || step.section_key} className="relative">
                                    <div className="flex items-start gap-4 lg:block">
                                        <div
                                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {step.section_subtitle || index + 1}
                                        </div>
                                        <div className="lg:mt-6">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {step.section_title || `Step ${index + 1}`}
                                            </h3>
                                            {step.section_content && (
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {step.section_content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-dashed bg-white p-8 text-center text-slate-600">
                            Add admission steps such as enquiry, application, assessment, documentation and enrolment through Website Management.
                        </div>
                    )}
                </div>
            </section>

            {/* REQUIREMENTS */}
            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-2">
                        <div>
                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {requirements?.section_subtitle || "Requirements"}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {requirements?.section_title || "Admission requirements"}
                            </h2>
                            <p className="mt-5 leading-7 text-slate-600">
                                {requirements?.section_content ||
                                    "Use this section to explain the documents, information or conditions that applicants should prepare."
                                }
                            </p>

                            {requirementSections.length > 0 ? (
                                <div className="mt-8 space-y-3">
                                    {requirementSections.map((requirement) => (
                                        <div
                                            key={requirement.id || requirement.section_key}
                                            className="flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm"
                                        >
                                            <div
                                                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                ✓
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold leading-6 text-slate-700">
                                                    {requirement.section_title}
                                                </p>
                                                {requirement.section_content && (
                                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                                        {requirement.section_content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                                    Add the documents or requirements applicants should prepare through Website Management. The school can create as many requirement items as needed.
                                </div>
                            )}
                        </div>

                        <div>
                            {requirementsNotice?.image_url && (
                                <div className="overflow-hidden rounded-3xl">
                                    <img
                                        src={requirementsNotice.image_url}
                                        alt={requirementsNotice.section_title || "Admission requirements"}
                                        className="h-[330px] w-full object-cover"
                                    />
                                </div>
                            )}

                            <div className={`${requirementsNotice?.image_url ? "mt-6 " : ""}rounded-2xl border border-slate-200 bg-slate-50 p-6`}>
                                <div className="flex gap-4">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        i
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {requirementsNotice?.section_title || "Important information"}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {requirementsNotice?.section_content ||
                                                "Use this notice to provide any important admission information, deadlines, age requirements or instructions that prospective families should know."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {whyChooseUs?.section_subtitle || "Why Choose This School"}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                {whyChooseUs?.section_title || "What makes your school a good choice?"}
                            </h2>
                            <p className="mt-5 leading-8 text-slate-300">
                                {whyChooseUs?.section_content ||
                                    "Use this section to explain the qualities, programmes, support and learning environment that families may want to know about."
                                }
                            </p>

                            {whyChooseSections.length > 0 ? (
                                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                                    {whyChooseSections.map((item) => (
                                        <div
                                            key={item.id || item.section_key}
                                            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                                        >
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                ✓
                                            </div>
                                            <h3 className="mt-4 font-bold">{item.section_title}</h3>
                                            {item.section_content && (
                                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                                    {item.section_content}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-6 text-sm leading-7 text-slate-300">
                                    Add a few school-specific strengths here through Website Management. Examples include teaching approach, learner support, facilities, programmes or community activities.
                                </div>
                            )}
                        </div>

                        {whyChooseUs?.image_url && (
                            <div className="overflow-hidden rounded-3xl">
                                <img
                                    src={whyChooseUs.image_url}
                                    alt={whyChooseUs.section_title || "School information"}
                                    className="h-[520px] w-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center">
                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                        >
                            {faq?.section_subtitle || "Frequently Asked Questions"}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {faq?.section_title || "Questions prospective families may have"}
                        </h2>
                        <p className="mt-5 text-slate-600">
                            {faq?.section_content ||
                                "Use this section to answer common questions about applications, requirements, age or class placement, fees, visits and other admission matters."
                            }
                        </p>
                    </div>

                    {faqSections.length > 0 ? (
                        <div className="mt-10 space-y-4">
                            {faqSections.map((item) => (
                                <details
                                    key={item.id || item.section_key}
                                    className="group rounded-2xl border bg-white p-5 shadow-sm"
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                                        <span>{item.section_title}</span>
                                        <span
                                            className="text-xl transition-transform group-open:rotate-45"
                                            style={{ color: primaryColor }}
                                        >
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                                        {item.section_content}
                                    </p>
                                </details>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm leading-7 text-slate-600">
                            Add frequently asked admission questions through Website Management. This section will remain useful even when no school-specific FAQs have been added yet.
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                <div
                    className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-xl sm:px-12 sm:py-16"
                    style={{ backgroundColor: primaryColor }}
                >
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                        {cta?.section_subtitle || "Next Steps"}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                        {cta?.section_title || "Ready to provide your admission information?"}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                        {cta?.section_content ||
                            "Use this area to guide prospective families toward an application, enquiry, school visit or another next step."
                        }
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <a
                            href={cta?.button_url || "#application"}
                            className="rounded-lg bg-white px-6 py-3.5 font-bold transition hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ color: primaryColor }}
                        >
                            {cta?.button_text || "View Admission Process"}
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
