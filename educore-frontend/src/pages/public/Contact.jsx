import { useState } from "react";
import { Link } from "react-router-dom";

import { useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import { submitContactMessage } from "@/api/contactMessageApi";

const INITIAL_FORM = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};

function Contact() {
    const { data: settings } = useSchoolSettings();
    const { data: page, isLoading, isError } = useWebsitePage("contact");
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState({ type: "", message: "" });

    const primaryColor = settings?.primary_color || "#1D4ED8";
    const sections = page?.sections || [];
    const getSection = (key) =>
        sections.find((section) => section.section_key === key && section.is_active !== false);

    const hero = getSection("hero");
    const contactInformation = getSection("contact_information");
    const address = getSection("address");
    const phone = getSection("phone");
    const email = getSection("email");
    const officeHours = getSection("office_hours");
    const contactForm = getSection("contact_form");
    const visit = getSection("visit");
    const contactCta = getSection("contact_cta");

    const schoolName = settings?.school_name || "Our School";
    const schoolAddress = settings?.address || settings?.school_address || "";
    const schoolPhone = settings?.phone || settings?.phone_number || settings?.school_phone || "";
    const schoolEmail = settings?.email || settings?.email_address || settings?.school_email || "";

    const addressValue = address?.section_content || schoolAddress;
    const phoneValue = phone?.section_content || schoolPhone;
    const emailValue = email?.section_content || schoolEmail;
    const hasAddress = Boolean(addressValue?.trim());
    const hasPhone = Boolean(phoneValue?.trim());
    const hasEmail = Boolean(emailValue?.trim());

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        if (submitState.message) setSubmitState({ type: "", message: "" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitState({ type: "", message: "" });
        try {
            const response = await submitContactMessage(formData);
            setSubmitState({
                type: "success",
                message: response?.message || "Your message has been sent successfully. We will get back to you shortly.",
            });
            setFormData(INITIAL_FORM);
        } catch (error) {
            setSubmitState({
                type: "error",
                message: error?.response?.data?.message || "We could not send your message right now. Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContactItem = ({ icon, section, fallbackTitle, value, href, emptyText }) => {
        if (!value) {
            return (
                <div className="flex gap-4 rounded-2xl border border-dashed bg-slate-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: primaryColor }}>
                        <span>{icon}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{section?.section_title || fallbackTitle}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{emptyText}</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: primaryColor }}>
                    <span>{icon}</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">{section?.section_title || fallbackTitle}</h3>
                    {href ? (
                        <a href={href} className="mt-1 block text-sm leading-6 text-slate-600 hover:underline">{value}</a>
                    ) : (
                        <p className="mt-1 text-sm leading-6 text-slate-600">{value}</p>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200" style={{ borderTopColor: primaryColor }} />
                    <p className="mt-4 text-sm text-slate-500">Loading contact page...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white px-6">
                <div className="max-w-xl text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Contact Our School</h2>
                    <p className="mt-3 text-slate-600">Use this page to provide your school address, phone number, email address and other contact information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28">
                <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-20" style={{ backgroundColor: primaryColor }} />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-blue-500/10" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: `${primaryColor}cc` }}>
                            {hero?.section_subtitle || "Contact Us"}
                        </p>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            {hero?.section_title || "We are here to help."}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            {hero?.section_content || "Use this section to introduce how visitors can contact your school and what they can expect when they reach out."}
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a href="#contact-form" className="rounded-lg bg-white px-6 py-3.5 text-center text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl" style={{ color: primaryColor }}>
                                {hero?.button_text || "Send Us a Message"}
                            </a>
                            <Link to="../admissions" className="rounded-lg border border-white/50 px-6 py-3.5 text-center text-sm font-semibold transition hover:bg-white/10">
                                {hero?.button_text_2 || "Explore Admissions"}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact-form" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                {contactInformation?.section_subtitle || "Contact Information"}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {contactInformation?.section_title || "Get in touch with our school."}
                            </h2>
                            <div className="mt-5 space-y-4 leading-7 text-slate-600">
                                {contactInformation?.section_content ? contactInformation.section_content.split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>) : (
                                    <>
                                        <p>Use this section to explain how parents, students and other visitors can reach your school.</p>
                                        <p>Add your official contact details in School Settings or Website Management so they appear here.</p>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 space-y-6">
                                {renderContactItem({ icon: "⌖", section: address, fallbackTitle: "Address", value: addressValue, emptyText: "Add your school address in School Settings or Website Management." })}
                                {renderContactItem({ icon: "☎", section: phone, fallbackTitle: "Phone", value: phoneValue, href: hasPhone ? `tel:${phoneValue}` : undefined, emptyText: "Add your school phone number in School Settings or Website Management." })}
                                {renderContactItem({ icon: "✉", section: email, fallbackTitle: "Email", value: emailValue, href: hasEmail ? `mailto:${emailValue}` : undefined, emptyText: "Add your school email address in School Settings or Website Management." })}
                                {renderContactItem({ icon: "◷", section: officeHours, fallbackTitle: "Office Hours", value: officeHours?.section_content || "", emptyText: "Add your school's office hours in Website Management." })}
                            </div>

                            <div className="mt-8">
                                <Link to="../admissions" className="inline-flex items-center font-semibold transition hover:gap-2" style={{ color: primaryColor }}>
                                    {contactInformation?.button_text || "Learn about admissions"}<span className="ml-2">→</span>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border bg-slate-50 p-6 sm:p-8 lg:col-span-3">
                            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                {contactForm?.section_subtitle || "Send a Message"}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{contactForm?.section_title || "How can we help?"}</h2>
                            <p className="mt-3 leading-7 text-slate-600">
                                {contactForm?.section_content || "Complete the form below and send your enquiry to the school."}
                            </p>
                            {submitState.message && (
                                <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${submitState.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`} role="alert">
                                    {submitState.message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                        <input id="name" name="name" type="text" required maxLength={150} value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2" style={{ "--tw-ring-color": `${primaryColor}33` }} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                        <input id="email" name="email" type="email" required maxLength={150} value={formData.email} onChange={handleChange} placeholder="you@example.com" className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2" style={{ "--tw-ring-color": `${primaryColor}33` }} />
                                    </div>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                                        <input id="phone" name="phone" type="tel" maxLength={40} value={formData.phone} onChange={handleChange} placeholder="+234..." className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none" />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                        <input id="subject" name="subject" type="text" required maxLength={200} value={formData.subject} onChange={handleChange} placeholder="How can we help?" className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <textarea id="message" name="message" required maxLength={5000} rows={6} value={formData.message} onChange={handleChange} placeholder="Write your message here..." className="mt-2 w-full resize-none rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2" style={{ "--tw-ring-color": `${primaryColor}33` }} />
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: primaryColor }}>
                                    {isSubmitting ? "Sending Message..." : contactForm?.button_text || "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border bg-slate-100">
                    <div className="grid lg:grid-cols-2">
                        <div className="flex min-h-[320px] items-center justify-center bg-slate-200 p-10">
                            <div className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lg" style={{ backgroundColor: primaryColor }}>⌖</div>
                                <h3 className="mt-5 text-xl font-bold">{address?.section_subtitle || "Your School Location"}</h3>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                                    {hasAddress ? addressValue : "Add your school address in School Settings or Website Management to display it here."}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center p-8 sm:p-10">
                            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>{visit?.section_subtitle || "Plan Your Visit"}</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-900">{visit?.section_title || "Plan a visit to our school."}</h2>
                            <p className="mt-4 leading-7 text-slate-600">
                                {visit?.section_content || "Use this section to tell visitors how they can arrange a visit, who they should contact and what they can expect."}
                            </p>
                            <div className="mt-7">
                                <Link to={visit?.button_url || "../admissions"} className="inline-flex rounded-lg px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5" style={{ backgroundColor: primaryColor }}>
                                    {visit?.button_text || "Explore Admissions"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-xl sm:px-12 sm:py-16" style={{ backgroundColor: primaryColor }}>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">{contactCta?.section_subtitle || "Need More Information?"}</p>
                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{contactCta?.section_title || "Have more questions?"}</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                        {contactCta?.section_content || "Use this area for a final contact message, additional guidance or a call to action for visitors."}
                    </p>
                    {(hasPhone || hasEmail) && (
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            {hasPhone && <a href={`tel:${phoneValue}`} className="rounded-lg bg-white px-6 py-3.5 font-bold transition hover:-translate-y-0.5 hover:shadow-lg" style={{ color: primaryColor }}>{contactCta?.button_text || "Call Us"}</a>}
                            {hasEmail && <a href={`mailto:${emailValue}`} className="rounded-lg border border-white/60 px-6 py-3.5 font-semibold transition hover:bg-white/10">{contactCta?.button_text_2 || "Email Us"}</a>}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Contact;
