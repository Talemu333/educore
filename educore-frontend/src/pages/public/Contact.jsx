import { useState } from "react";
import { Link } from "react-router-dom";

import { useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

function Contact() {
    /*
    |--------------------------------------------------------------------------
    | SCHOOL SETTINGS
    |--------------------------------------------------------------------------
    */

    const { data: settings } = useSchoolSettings();

    const primaryColor =
        settings?.primary_color ||
        "#1D4ED8";


    /*
    |--------------------------------------------------------------------------
    | WEBSITE PAGE
    |--------------------------------------------------------------------------
    */

    const {
        data: page,
        isLoading,
        isError,
    } = useWebsitePage("contact");


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
    | CONTACT PAGE SECTIONS
    |--------------------------------------------------------------------------
    */

    const hero =
        getSection("hero");

    const introduction =
        getSection("introduction");

    const contactInformation =
        getSection("contact_information");

    const address =
        getSection("address");

    const phone =
        getSection("phone");

    const email =
        getSection("email");

    const officeHours =
        getSection("office_hours");

    const contactForm =
        getSection("contact_form");

    const visit =
        getSection("visit");

    const contactCta =
        getSection("contact_cta");


    /*
    |--------------------------------------------------------------------------
    | FORM STATE
    |--------------------------------------------------------------------------
    */

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });


    /*
    |--------------------------------------------------------------------------
    | FORM CHANGE
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | FORM SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event) => {
        event.preventDefault();

        /*
        |--------------------------------------------------------------------------
        | TEMPORARY SUBMISSION
        |--------------------------------------------------------------------------
        |
        | We will later connect this to the backend/database.
        |
        */

        alert(
            "Thank you for contacting EduCore. We will get back to you shortly."
        );


        setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        });
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
                            borderTopColor:
                                primaryColor,
                        }}
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading contact page...
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
                        Unable to load contact page
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
    | SCHOOL CONTACT DETAILS
    |--------------------------------------------------------------------------
    |
    | These come from school_settings.
    |
    */

    const schoolAddress =
        settings?.address ||
        "15 Education Avenue, Ibadan, Oyo State, Nigeria.";

    const schoolPhone =
        settings?.phone ||
        settings?.phone_number ||
        "+234 000 000 0000";

    const schoolEmail =
        settings?.email ||
        settings?.email_address ||
        "info@educore.com";

    const schoolName =
        settings?.school_name ||
        "EduCore";


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="bg-white">


            {/* =========================================================
                HERO
            ========================================================= */}

            <section
                className="
                    relative
                    overflow-hidden
                    bg-slate-950
                    px-4
                    py-20
                    text-white
                    sm:px-6
                    sm:py-24
                    lg:px-8
                    lg:py-28
                "
            >

                {/* Decorative circle */}

                <div
                    className="
                        absolute
                        -right-32
                        -top-32
                        h-80
                        w-80
                        rounded-full
                        opacity-20
                    "
                    style={{
                        backgroundColor:
                            primaryColor,
                    }}
                />


                <div
                    className="
                        absolute
                        -bottom-40
                        -left-20
                        h-96
                        w-96
                        rounded-full
                        bg-blue-500/10
                    "
                />


                <div
                    className="
                        relative
                        mx-auto
                        max-w-7xl
                    "
                >

                    <div className="max-w-3xl">

                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-[0.2em]
                            "
                            style={{
                                color:
                                    "#93C5FD",
                            }}
                        >
                            {hero?.section_subtitle ||
                                "Get in Touch"}
                        </p>


                        <h1
                            className="
                                mt-4
                                text-4xl
                                font-extrabold
                                tracking-tight
                                sm:text-5xl
                                lg:text-6xl
                            "
                        >
                            {hero?.section_title ||
                                "We would love to hear from you."}
                        </h1>


                        <p
                            className="
                                mt-6
                                max-w-2xl
                                text-base
                                leading-8
                                text-slate-300
                                sm:text-lg
                            "
                        >
                            {hero?.section_content ||
                                "Have a question about admissions, academics, school life or anything else? Our team is ready to assist you."}
                        </p>


                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <a
                                href="#contact-form"
                                className="
                                    rounded-lg
                                    bg-white
                                    px-6
                                    py-3.5
                                    text-center
                                    text-sm
                                    font-bold
                                    shadow-lg
                                    transition
                                    hover:-translate-y-0.5
                                    hover:shadow-xl
                                "
                                style={{
                                    color:
                                        primaryColor,
                                }}
                            >
                                {hero?.button_text ||
                                    "Send Us a Message"}
                            </a>


                            <Link
                                to="/website/admissions"
                                className="
                                    rounded-lg
                                    border
                                    border-white/50
                                    px-6
                                    py-3.5
                                    text-center
                                    text-sm
                                    font-semibold
                                    transition
                                    hover:bg-white/10
                                "
                            >
                                Explore Admissions
                            </Link>

                        </div>

                    </div>

                </div>

            </section>



            {/* =========================================================
                CONTACT INFORMATION + FORM
            ========================================================= */}

            <section
                id="contact-form"
                className="
                    px-4
                    py-16
                    sm:px-6
                    sm:py-20
                    lg:px-8
                    lg:py-24
                "
            >

                <div className="mx-auto max-w-7xl">

                    <div
                        className="
                            grid
                            gap-10
                            lg:grid-cols-5
                        "
                    >


                        {/* =================================================
                            CONTACT INFORMATION
                        ================================================= */}

                        <div
                            className="
                                lg:col-span-2
                            "
                        >

                            <p
                                className="
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wider
                                "
                                style={{
                                    color:
                                        primaryColor,
                                }}
                            >
                                {contactInformation?.section_subtitle ||
                                    "Contact Information"}
                            </p>


                            <h2
                                className="
                                    mt-3
                                    text-3xl
                                    font-bold
                                    tracking-tight
                                    text-slate-900
                                    sm:text-4xl
                                "
                            >
                                {contactInformation?.section_title ||
                                    "Let's start a conversation."}
                            </h2>


                            <div
                                className="
                                    mt-5
                                    space-y-4
                                    leading-7
                                    text-slate-600
                                "
                            >

                                {contactInformation?.section_content ? (
                                    contactInformation.section_content
                                        .split("\n")
                                        .filter(Boolean)
                                        .map((paragraph, index) => (
                                            <p key={index}>
                                                {paragraph}
                                            </p>
                                        ))
                                ) : (
                                    <>
                                        <p>
                                            Whether you are a parent,
                                            student, prospective family
                                            or member of our community,
                                            we are always happy to hear
                                            from you.
                                        </p>

                                        <p>
                                            Contact us using any of the
                                            details below or send us a
                                            message through the form.
                                        </p>
                                    </>
                                )}

                            </div>


                            {/* CONTACT DETAILS */}

                            <div className="mt-8 space-y-6">


                                {/* ADDRESS */}

                                <div className="flex gap-4">

                                    <div
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            text-white
                                        "
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="
                                                    M15 10.5
                                                    a3 3 0 1 1
                                                    -6 0
                                                    3 3 0 0 1
                                                    6 0Z
                                                "
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="
                                                    M19.5 10.5
                                                    c0 7.142
                                                    -7.5 11.25
                                                    -7.5 11.25
                                                    S4.5 17.642
                                                    4.5 10.5
                                                    a7.5 7.5 0 1 1
                                                    15 0Z
                                                "
                                            />

                                        </svg>

                                    </div>


                                    <div>

                                        <h3 className="font-bold text-slate-900">
                                            {address?.section_title ||
                                                "Address"}
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            {address?.section_content ||
                                                schoolAddress}
                                        </p>

                                    </div>

                                </div>



                                {/* PHONE */}

                                <div className="flex gap-4">

                                    <div
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            text-white
                                        "
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="
                                                    M2.25 6.75
                                                    c0 8.284
                                                    6.716 15
                                                    15 15
                                                    h2.25
                                                    a2.25 2.25
                                                    0 0 0
                                                    2.25-2.25
                                                    v-1.372
                                                    c0-.516
                                                    -.351-.966
                                                    -.852-1.091
                                                    l-4.423-1.106
                                                    c-.44-.11
                                                    -.902.055
                                                    -1.08.393
                                                    l-.97 1.82
                                                    a.25.25
                                                    0 0 1
                                                    -.287.125
                                                    12.35 12.35
                                                    0 0 1
                                                    -7.253-7.253
                                                    .25.25
                                                    0 0 1
                                                    .125-.287
                                                    l1.82-.97
                                                    c.338-.178
                                                    .503-.64
                                                    .393-1.08
                                                    L8.128 4.851
                                                    A1.125 1.125
                                                    0 0 0
                                                    7.037 4H5.625
                                                    A2.25 2.25
                                                    0 0 0
                                                    3.375 6.25v.5Z
                                                "
                                            />

                                        </svg>

                                    </div>


                                    <div>

                                        <h3 className="font-bold text-slate-900">
                                            {phone?.section_title ||
                                                "Phone"}
                                        </h3>

                                        <a
                                            href={`tel:${phone?.section_content || schoolPhone}`}
                                            className="mt-1 block text-sm text-slate-600 transition hover:underline"
                                        >
                                            {phone?.section_content ||
                                                schoolPhone}
                                        </a>

                                    </div>

                                </div>



                                {/* EMAIL */}

                                <div className="flex gap-4">

                                    <div
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            text-white
                                        "
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="
                                                    M21.75 6.75
                                                    v10.5
                                                    A2.25 2.25 0 0 1
                                                    19.5 19.5
                                                    h-15
                                                    a2.25 2.25 0 0 1
                                                    -2.25-2.25V6.75
                                                    m19.5 0
                                                    A2.25 2.25 0 0 0
                                                    19.5 4.5
                                                    h-15
                                                    a2.25 2.25 0 0 0
                                                    -2.25 2.25
                                                    m19.5 0
                                                    -9.75 6.75
                                                    L2.25 6.75
                                                "
                                            />

                                        </svg>

                                    </div>


                                    <div>

                                        <h3 className="font-bold text-slate-900">
                                            {email?.section_title ||
                                                "Email"}
                                        </h3>

                                        <a
                                            href={`mailto:${email?.section_content || schoolEmail}`}
                                            className="mt-1 block text-sm text-slate-600 transition hover:underline"
                                        >
                                            {email?.section_content ||
                                                schoolEmail}
                                        </a>

                                    </div>

                                </div>



                                {/* OFFICE HOURS */}

                                <div className="flex gap-4">

                                    <div
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            text-white
                                        "
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    >
                                        ⏰
                                    </div>


                                    <div>

                                        <h3 className="font-bold text-slate-900">
                                            {officeHours?.section_title ||
                                                "Office Hours"}
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            {officeHours?.section_content ||
                                                "Monday – Friday: 8:00 AM – 4:00 PM"}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ADMISSIONS LINK */}

                            <div className="mt-8">

                                <Link
                                    to="/website/admissions"
                                    className="
                                        inline-flex
                                        items-center
                                        font-semibold
                                        transition
                                        hover:gap-2
                                    "
                                    style={{
                                        color:
                                            primaryColor,
                                    }}
                                >
                                    Learn about admissions

                                    <span className="ml-2">
                                        →
                                    </span>

                                </Link>

                            </div>

                        </div>



                        {/* =================================================
                            CONTACT FORM
                        ================================================= */}

                        <div
                            className="
                                rounded-3xl
                                border
                                bg-slate-50
                                p-6
                                sm:p-8
                                lg:col-span-3
                            "
                        >

                            <p
                                className="
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wider
                                "
                                style={{
                                    color:
                                        primaryColor,
                                }}
                            >
                                {contactForm?.section_subtitle ||
                                    "Send a Message"}
                            </p>


                            <h2
                                className="
                                    mt-3
                                    text-3xl
                                    font-bold
                                    tracking-tight
                                    text-slate-900
                                "
                            >
                                {contactForm?.section_title ||
                                    "How can we help?"}
                            </h2>


                            <p className="mt-3 leading-7 text-slate-600">
                                {contactForm?.section_content ||
                                    "Complete the form below and a member of our team will respond to you."}
                            </p>


                            <form
                                onSubmit={handleSubmit}
                                className="mt-7 space-y-5"
                            >

                                {/* NAME + EMAIL */}

                                <div
                                    className="
                                        grid
                                        gap-5
                                        sm:grid-cols-2
                                    "
                                >

                                    <div>

                                        <label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Full Name
                                        </label>

                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter your full name"
                                            className="
                                                mt-2
                                                w-full
                                                rounded-xl
                                                border
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:ring-2
                                            "
                                            style={{
                                                "--tw-ring-color":
                                                    `${primaryColor}33`,
                                            }}
                                        />

                                    </div>


                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="text-sm font-medium"
                                        >
                                            Email Address
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="you@example.com"
                                            className="
                                                mt-2
                                                w-full
                                                rounded-xl
                                                border
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:ring-2
                                            "
                                            style={{
                                                "--tw-ring-color":
                                                    `${primaryColor}33`,
                                            }}
                                        />

                                    </div>

                                </div>



                                {/* PHONE + SUBJECT */}

                                <div
                                    className="
                                        grid
                                        gap-5
                                        sm:grid-cols-2
                                    "
                                >

                                    <div>

                                        <label
                                            htmlFor="phone"
                                            className="text-sm font-medium"
                                        >
                                            Phone Number
                                        </label>

                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="+234..."
                                            className="
                                                mt-2
                                                w-full
                                                rounded-xl
                                                border
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                            "
                                        />

                                    </div>


                                    <div>

                                        <label
                                            htmlFor="subject"
                                            className="text-sm font-medium"
                                        >
                                            Subject
                                        </label>

                                        <input
                                            id="subject"
                                            name="subject"
                                            type="text"
                                            required
                                            value={
                                                formData.subject
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="How can we help?"
                                            className="
                                                mt-2
                                                w-full
                                                rounded-xl
                                                border
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                            "
                                        />

                                    </div>

                                </div>



                                {/* MESSAGE */}

                                <div>

                                    <label
                                        htmlFor="message"
                                        className="text-sm font-medium"
                                    >
                                        Message
                                    </label>

                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        value={
                                            formData.message
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Write your message here..."
                                        className="
                                            mt-2
                                            w-full
                                            resize-none
                                            rounded-xl
                                            border
                                            bg-white
                                            px-4
                                            py-3
                                            outline-none
                                            transition
                                            focus:ring-2
                                        "
                                        style={{
                                            "--tw-ring-color":
                                                `${primaryColor}33`,
                                        }}
                                    />

                                </div>



                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    className="
                                        w-full
                                        rounded-xl
                                        px-6
                                        py-3.5
                                        text-sm
                                        font-bold
                                        text-white
                                        shadow-sm
                                        transition
                                        hover:-translate-y-0.5
                                        hover:shadow-lg
                                    "
                                    style={{
                                        backgroundColor:
                                            primaryColor,
                                    }}
                                >
                                    {contactForm?.button_text ||
                                        "Send Message"}
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </section>



            {/* =========================================================
                VISIT SECTION
            ========================================================= */}

            <section
                className="
                    px-4
                    py-16
                    sm:px-6
                    sm:py-20
                    lg:px-8
                "
            >

                <div className="mx-auto max-w-7xl">

                    <div
                        className="
                            overflow-hidden
                            rounded-3xl
                            border
                            bg-slate-100
                        "
                    >

                        <div
                            className="
                                grid
                                lg:grid-cols-2
                            "
                        >

                            {/* MAP / LOCATION */}

                            <div
                                className="
                                    flex
                                    min-h-[320px]
                                    items-center
                                    justify-center
                                    bg-slate-200
                                    p-10
                                "
                            >

                                <div className="text-center">

                                    <div
                                        className="
                                            mx-auto
                                            flex
                                            h-16
                                            w-16
                                            items-center
                                            justify-center
                                            rounded-full
                                            text-white
                                            shadow-lg
                                        "
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                            className="h-7 w-7"
                                        >

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="
                                                    M15 10.5
                                                    a3 3 0 1 1
                                                    -6 0
                                                    3 3 0 0 1
                                                    6 0Z
                                                "
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="
                                                    M19.5 10.5
                                                    c0 7.142
                                                    -7.5 11.25
                                                    -7.5 11.25
                                                    S4.5 17.642
                                                    4.5 10.5
                                                    a7.5 7.5 0 1 1
                                                    15 0Z
                                                "
                                            />

                                        </svg>

                                    </div>


                                    <h3 className="mt-5 text-xl font-bold">
                                        {address?.section_subtitle ||
                                            "Find EduCore"}
                                    </h3>


                                    <p
                                        className="
                                            mx-auto
                                            mt-2
                                            max-w-sm
                                            text-sm
                                            leading-6
                                            text-slate-600
                                        "
                                    >
                                        {address?.section_content ||
                                            schoolAddress}
                                    </p>

                                </div>

                            </div>



                            {/* VISIT CONTENT */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    justify-center
                                    p-8
                                    sm:p-10
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-bold
                                        uppercase
                                        tracking-wider
                                    "
                                    style={{
                                        color:
                                            primaryColor,
                                    }}
                                >
                                    {visit?.section_subtitle ||
                                        "Plan Your Visit"}
                                </p>


                                <h2
                                    className="
                                        mt-3
                                        text-3xl
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    {visit?.section_title ||
                                        "Come and see EduCore for yourself."}
                                </h2>


                                <p
                                    className="
                                        mt-4
                                        leading-7
                                        text-slate-600
                                    "
                                >
                                    {visit?.section_content ||
                                        "We welcome prospective parents and students to visit our campus, meet our teachers and experience our school community."}
                                </p>


                                <div className="mt-7">

                                    <Link
                                        to={
                                            visit?.button_url ||
                                            "/website/admissions"
                                        }
                                        className="
                                            inline-flex
                                            rounded-lg
                                            px-6
                                            py-3
                                            font-semibold
                                            text-white
                                            shadow-sm
                                            transition
                                            hover:-translate-y-0.5
                                        "
                                        style={{
                                            backgroundColor:
                                                primaryColor,
                                        }}
                                    >
                                        {visit?.button_text ||
                                            "Explore Admissions"}
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>



            {/* =========================================================
                FINAL CTA
            ========================================================= */}

            <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">

                <div
                    className="
                        mx-auto
                        max-w-7xl
                        overflow-hidden
                        rounded-3xl
                        px-6
                        py-14
                        text-center
                        text-white
                        shadow-xl
                        sm:px-12
                        sm:py-16
                    "
                    style={{
                        backgroundColor:
                            primaryColor,
                    }}
                >

                    <p
                        className="
                            text-sm
                            font-bold
                            uppercase
                            tracking-[0.2em]
                            text-white/70
                        "
                    >
                        {contactCta?.section_subtitle ||
                            "We Are Here to Help"}
                    </p>


                    <h2
                        className="
                            mt-3
                            text-3xl
                            font-bold
                            sm:text-4xl
                        "
                    >
                        {contactCta?.section_title ||
                            "Have more questions?"}
                    </h2>


                    <p
                        className="
                            mx-auto
                            mt-4
                            max-w-2xl
                            text-sm
                            leading-7
                            text-white/85
                            sm:text-base
                        "
                    >
                        {contactCta?.section_content ||
                            "Our team is ready to answer your questions and help you learn more about EduCore."}
                    </p>


                    <div
                        className="
                            mt-8
                            flex
                            flex-col
                            justify-center
                            gap-3
                            sm:flex-row
                        "
                    >

                        <a
                            href={`tel:${schoolPhone}`}
                            className="
                                rounded-lg
                                bg-white
                                px-6
                                py-3.5
                                font-bold
                                transition
                                hover:-translate-y-0.5
                                hover:shadow-lg
                            "
                            style={{
                                color:
                                    primaryColor,
                            }}
                        >
                            Call Us
                        </a>


                        <a
                            href={`mailto:${schoolEmail}`}
                            className="
                                rounded-lg
                                border
                                border-white/60
                                px-6
                                py-3.5
                                font-semibold
                                transition
                                hover:bg-white/10
                            "
                        >
                            Email Us
                        </a>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Contact;