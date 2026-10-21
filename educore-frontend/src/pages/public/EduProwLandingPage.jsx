import { useEffect, useState } from "react";

const modules = [
    { icon: "🎓", title: "Academic Management", description: "Manage students, classes, subjects, sessions, terms, grading, results and promotion from one connected workspace.", items: ["Student records", "Classes & subjects", "Results & grading", "Promotion history"] },
    { icon: "👩‍🏫", title: "Teaching & Learning", description: "Give teachers the tools they need to manage attendance, students, assessments and everyday classroom activities.", items: ["Teacher portal", "Attendance", "Assessments", "Student performance"] },
    { icon: "💻", title: "CBT & Online Testing", description: "Create computer-based examinations, question banks and timed online tests while tracking performance automatically.", items: ["Question bank", "CBT exam creation", "Timed online tests", "Automatic scoring"] },
    { icon: "👨‍👩‍👧", title: "Parent Engagement", description: "Keep parents connected to their children's results, attendance, announcements and financial information.", items: ["Parent portal", "Results", "Attendance", "Fee information"] },
    { icon: "💳", title: "Fees & Finance", description: "Keep school finances organized with fee structures, payments, receipts, reports and expense tracking.", items: ["Fee management", "Payments", "Payment reports", "Expenses"] },
    { icon: "📣", title: "Communication", description: "Keep your school community informed through announcements, notifications, news and events.", items: ["Announcements", "Notifications", "News", "Events"] },
    { icon: "🌐", title: "School Website", description: "Give every school a professional public presence with branded pages, admissions, news, events and galleries.", items: ["About & academics", "Admissions", "Gallery", "News & events"] }
];

const portalCards = [
    ["🛡️", "Administrator Portal", "A complete command centre for school leadership, academic administration, finance and operations."],
    ["👩‍🏫", "Teacher Portal", "Teachers can work with assigned students, attendance, results and classroom responsibilities."],
    ["👨‍👩‍👧", "Parent Portal", "Parents get a simple view of their children's results, attendance, payments and school updates."],
    ["🎒", "Student Portal", "Students can access their academic information, subjects, results and digital learning activities."]
];

const highlights = [
    ["01", "One connected system", "Student, academic, finance and communication data stay connected instead of being scattered across spreadsheets and separate tools."],
    ["02", "Built for real schools", "EduProw is designed around the daily workflows of school administrators, teachers, parents and students."],
    ["03", "Multi-school architecture", "Manage multiple schools while keeping school data, users, settings and public websites properly separated."],
    ["04", "Designed to grow", "Start with the modules your school needs today and expand as your operations become more digital."]
];

const steps = [
    ["01", "Tell us about your school", "Share your school's needs and the areas you want to improve."],
    ["02", "See EduProw in action", "Walk through the platform and see how the workflows fit your school."],
    ["03", "Set up your school", "Once you're ready, configure your school and bring your team onto the platform."]
];

const partnerPoints = [
    ["🤝", "Introduce schools", "Help schools in your network discover a practical way to manage their daily operations digitally."],
    ["📚", "Education-focused", "Work with a platform built around school administration, academics, finance, CBT and communication."],
    ["🚀", "Grow with EduProw", "Help more schools discover and adopt better digital tools with EduProw."]
];

const contactEmail = "eduprowtechnologies@gmail.com";
const secondaryEmail = "eduprowtechnologies@gmail.com";
const primaryPhone = "09135091402";
const secondaryPhone = "07089062263";
const whatsappNumber = "2349135091402";
const address = "57, Oko-Addo, Ajah, Lagos";

function ContactIcon({ children }) {
    return <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">{children}</span>;
}

const heroSlides = [
    {
        eyebrow: "Modern school management",
        title: "Run your school with",
        accent: "clarity.",
        description: "Bring administration, academics, finance, communication and everyday school operations together in one connected platform.",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2200&q=85"
    },
    {
        eyebrow: "Teaching and learning",
        title: "Give teachers more room to",
        accent: "teach.",
        description: "Organise attendance, assessments, class records and computer-based tests while keeping school information connected.",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=2200&q=85"
    },
    {
        eyebrow: "Stronger school community",
        title: "Keep your school community",
        accent: "connected.",
        description: "Help parents and students stay informed about results, attendance, payments, announcements and school updates.",
        image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=2200&q=85"
    },
    {
        eyebrow: "Your school's online presence",
        title: "Make your school stand out",
        accent: "online.",
        description: "Give your school a professional branded website with admissions information, news, events and a gallery.",
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2200&q=85"
    }
];

export default function EduProwLandingPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [carouselPaused, setCarouselPaused] = useState(false);

    useEffect(() => {
        const pageRoot = document.querySelector(".eduprow-landing");
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
        if (carouselPaused) return undefined;
        const timer = window.setInterval(() => {
            setCurrentSlide((current) => (current + 1) % heroSlides.length);
        }, 6500);
        return () => window.clearInterval(timer);
    }, [carouselPaused]);

    const sendEmail = () => {
        window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("EduProw Enquiry")}`;
    };

    return (
        <div id="top" className="eduprow-landing min-h-screen bg-white text-slate-900">
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
                    <a href="/eduprow" className="flex items-center gap-3">
                        <img src="https://res.cloudinary.com/xg3fx2ic/image/upload/v1791152547/EduProw-Logo_033051.png" alt="EduProw" className="h-11 w-auto object-contain" />
                        <div>
                            <p className="text-lg font-extrabold tracking-tight text-slate-950">EduProw</p>
                            <p className="text-[11px] font-medium text-slate-500">School Management Platform</p>
                        </div>
                    </a>
                    <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
                        <a href="#solutions" className="transition hover:text-blue-600">Solutions</a>
                        <a href="#why-eduprow" className="transition hover:text-blue-600">Why EduProw</a>
                        <a href="#partners" className="transition hover:text-blue-600">Partners</a>
                        <a href="#contact" className="transition hover:text-blue-600">Contact</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        <a href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex">School Sign In</a>
                        <a href="#contact" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">Get Started</a>
                    </div>
                </div>
            </header>

            <main>
                <section
                    className="eduprow-hero-carousel relative isolate flex min-h-[660px] items-center overflow-hidden bg-slate-950 text-white sm:min-h-[720px] lg:min-h-[min(820px,calc(100vh-76px))]"
                    aria-label="EduProw highlights"
                    onMouseEnter={() => setCarouselPaused(true)}
                    onMouseLeave={() => setCarouselPaused(false)}
                    onFocusCapture={() => setCarouselPaused(true)}
                    onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) setCarouselPaused(false);
                    }}
                >
                    <div className="absolute inset-0 -z-20">
                        {heroSlides.map((slide, index) => (
                            <img
                                key={slide.title}
                                src={slide.image}
                                alt=""
                                aria-hidden="true"
                                fetchPriority={index === 0 ? "high" : "auto"}
                                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 scale-100" : "scale-105 opacity-0"}`}
                                style={{ transitionProperty: "opacity, transform" }}
                            />
                        ))}
                    </div>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/45" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/15" />
                    <div className="absolute -right-40 top-10 -z-10 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="absolute -bottom-48 -left-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
                        <div key={currentSlide} className="eduprow-slide-copy max-w-3xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100 backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
                                {heroSlides[currentSlide].eyebrow}
                            </span>
                            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                                {heroSlides[currentSlide].title}{" "}
                                <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                                    {heroSlides[currentSlide].accent}
                                </span>
                            </h1>
                            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                                {heroSlides[currentSlide].description}
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                                    Talk to EduProw <span aria-hidden="true">→</span>
                                </a>
                                <a href="#demo" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-center text-sm font-semibold text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                                    <span aria-hidden="true">▶</span> Watch the demo
                                </a>
                            </div>
                            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-200">
                                <span className="flex items-center gap-2"><span className="text-sky-300">✓</span> Connected school operations</span>
                                <span className="flex items-center gap-2"><span className="text-sky-300">✓</span> Multi-school ready</span>
                                <span className="flex items-center gap-2"><span className="text-sky-300">✓</span> Branded school websites</span>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="absolute -inset-5 rounded-[2rem] bg-blue-400/15 blur-2xl" />
                            <div className="relative rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                                <div className="overflow-hidden rounded-[1.5rem] bg-white p-5 text-slate-900 shadow-xl sm:p-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">School dashboard</p>
                                            <h2 className="mt-1 text-lg font-extrabold">Everything in one view</h2>
                                        </div>
                                        <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">EduProw</div>
                                    </div>
                                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {["Student records", "Results", "Attendance", "Finance"].map((label, index) => (
                                            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition duration-300 hover:-translate-y-1 hover:border-blue-200">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">{["S", "R", "A", "₦"][index]}</span>
                                                <p className="mt-2 text-[11px] font-semibold text-slate-600">{label}</p>
                                                <p className="mt-2 h-1.5 rounded-full bg-blue-100"><span className="block h-1.5 w-3/4 rounded-full bg-blue-500" /></p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950 p-5 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400">Academic operations</p>
                                                <p className="mt-1 text-lg font-bold">Results & attendance</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Connected</span>
                                        </div>
                                        <div className="mt-5 flex h-20 items-end gap-2" aria-label="Illustrative performance chart">
                                            {[35, 52, 46, 68, 60, 78, 88, 82, 94, 86].map((height, index) => <div key={index} className="eduprow-chart-bar flex-1 rounded-t-md bg-gradient-to-t from-blue-700 to-sky-400" style={{ height: `${height}%`, animationDelay: `${index * 55}ms` }} />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -left-8 rounded-2xl border border-white/20 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur">
                                <p className="text-xs text-slate-400">One connected platform</p>
                                <p className="mt-1 text-sm font-bold text-white">Less admin. More impact.</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-5 z-10 mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2" aria-label="Choose a slide">
                            {heroSlides.map((slide, index) => (
                                <button
                                    key={slide.title}
                                    type="button"
                                    aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
                                    aria-current={index === currentSlide ? "true" : undefined}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${index === currentSlide ? "w-9 bg-sky-300" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                                />
                            ))}
                            <span className="ml-2 hidden text-xs font-semibold tracking-widest text-white/70 sm:inline">
                                0{currentSlide + 1} <span className="text-white/40">/</span> 0{heroSlides.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-slate-950/30 text-lg text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">←</button>
                            <button type="button" onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-slate-950/30 text-lg text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">→</button>
                            <button type="button" onClick={() => setCarouselPaused((paused) => !paused)} aria-label={carouselPaused ? "Resume carousel autoplay" : "Pause carousel autoplay"} className="hidden h-10 items-center justify-center rounded-full border border-white/30 bg-slate-950/30 px-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:inline-flex">
                                {carouselPaused ? "Play" : "Pause"}
                            </button>
                        </div>
                    </div>
                </section>

                <section id="demo" className="scroll-mt-24 bg-slate-50 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">See EduProw in action</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Take a quick tour of EduProw.</h2>
                            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">Watch the demo below to see how EduProw brings school administration, academics, finance, CBT and communication together in one platform.</p>
                        </div>
                        <div className="mx-auto mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl">
                            <div className="aspect-video w-full">
                                <iframe
                                    className="h-full w-full"
                                    src="https://www.youtube.com/embed/x37yrC48p74"
                                    title="EduProw School Management Platform Demo"
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="solutions" className="scroll-mt-24 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Complete school solution</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Everything your school needs to operate better.</h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">From student records and results to fees, communication, CBT and your school website, EduProw connects the workflows that matter most.</p>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {modules.map(module => (
                                <article key={module.title} className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">{module.icon}</div>
                                    <h3 className="mt-6 text-xl font-extrabold">{module.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-600">{module.description}</p>
                                    <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
                                        {module.items.map(item => <li key={item} className="flex items-center gap-2"><span className="text-blue-600">✓</span>{item}</li>)}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="portals" className="bg-slate-950 px-5 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Connected stakeholders</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A dedicated experience for everyone.</h2>
                            <p className="mt-4 leading-7 text-slate-400">Each stakeholder gets the right information and tools without being overwhelmed by features they do not need.</p>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {portalCards.map(([icon, title, description]) => (
                                <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.08]">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">{icon}</div>
                                    <h3 className="mt-5 text-lg font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="scroll-mt-24 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Getting started</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A simple path from interest to implementation.</h2>
                        </div>
                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            {steps.map(([number, title, description]) => (
                                <article key={number} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                                    <span className="text-sm font-black text-blue-600">{number}</span>
                                    <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="why-eduprow" className="scroll-mt-24 bg-slate-50 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Why EduProw</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Less paperwork. Better decisions. Stronger schools.</h2>
                                <p className="mt-5 text-base leading-7 text-slate-600">A good school management system should not add another layer of complexity. EduProw brings the important pieces together so your team can spend less time chasing information and more time running the school.</p>
                                <a href="#contact" className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700">Talk to EduProw</a>
                            </div>
                            <div className="grid gap-4">
                                {highlights.map(([number, title, description]) => (
                                    <div key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                        <div className="flex gap-5"><span className="text-sm font-black text-blue-600">{number}</span><div><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{description}</p></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="partners" className="scroll-mt-24 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-[2rem] border border-blue-100 bg-blue-50 p-7 sm:p-12 lg:p-14">
                        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">EduProw Partner Network</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Want to become an EduProw marketer?</h2>
                                <p className="mt-5 leading-7 text-slate-600">If you know school owners, administrators or education organisations that need better digital tools, you can work with EduProw to introduce them to the platform.</p>
                                <a href="/partners" className="mt-7 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800">Become a marketer</a>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {partnerPoints.map(([icon, title, description]) => <article key={title} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="text-2xl">{icon}</div><h3 className="mt-4 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="contact" className="scroll-mt-24 border-t border-slate-100 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Contact EduProw</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Let's talk about what your school needs.</h2>
                            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">Whether you need a school management solution, want to see the platform in action, or want to become an EduProw marketer, reach out directly.</p>
                        </div>

                        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                                    <ContactIcon>✉️</ContactIcon>
                                    <p className="mt-5 text-sm font-bold text-slate-500">Email</p>
                                    <a href={`mailto:${contactEmail}`} className="mt-1 block break-all font-extrabold text-slate-900 hover:text-blue-600">{contactEmail}</a>
                                    <a href={`mailto:${secondaryEmail}`} className="mt-2 block break-all font-extrabold text-slate-900 hover:text-blue-600">{secondaryEmail}</a>
                                    <p className="mt-3 text-sm text-blue-600">Send us an email →</p>
                                </div>
                                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                                    <ContactIcon>💬</ContactIcon>
                                    <p className="mt-5 text-sm font-bold text-slate-500">WhatsApp</p>
                                    <p className="mt-1 font-extrabold text-slate-900 group-hover:text-emerald-600">{primaryPhone}</p>
                                    <p className="mt-3 text-sm text-emerald-600">Chat with us →</p>
                                </a>
                                <a href={`tel:${primaryPhone}`} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                                    <ContactIcon>📞</ContactIcon>
                                    <p className="mt-5 text-sm font-bold text-slate-500">Phone</p>
                                    <p className="mt-1 font-extrabold text-slate-900 group-hover:text-blue-600">{primaryPhone}</p>
                                    <p className="mt-1 text-sm text-slate-500">Calls & WhatsApp</p>
                                </a>
                                <a href={`tel:${secondaryPhone}`} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                                    <ContactIcon>☎️</ContactIcon>
                                    <p className="mt-5 text-sm font-bold text-slate-500">Alternative line</p>
                                    <p className="mt-1 font-extrabold text-slate-900 group-hover:text-blue-600">{secondaryPhone}</p>
                                    <p className="mt-1 text-sm text-slate-500">Call us directly</p>
                                </a>
                            </div>

                            <div className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-9">
                                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-400">Visit / Reach us</p>
                                <h3 className="mt-3 text-2xl font-black">EduProw</h3>
                                <div className="mt-7 space-y-5 text-sm text-slate-300">
                                    <div className="flex gap-4"><span className="text-xl">📍</span><div><p className="font-bold text-white">Address</p><p className="mt-1 leading-6">{address}</p></div></div>
                                    <div className="flex gap-4"><span className="text-xl">✉️</span><div><p className="font-bold text-white">Email</p><a href={`mailto:${contactEmail}`} className="mt-1 block break-all hover:text-white">{contactEmail}</a><a href={`mailto:${secondaryEmail}`} className="mt-1 block break-all hover:text-white">{secondaryEmail}</a></div></div>
                                    <div className="flex gap-4"><span className="text-xl">📞</span><div><p className="font-bold text-white">Phone</p><p className="mt-1">{primaryPhone} · {secondaryPhone}</p></div></div>
                                </div>
                                <button type="button" onClick={sendEmail} className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500">Send an email to EduProw</button>
                                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Chat on WhatsApp</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer id="footer" className="relative overflow-hidden border-t border-white/10 bg-slate-950 px-5 text-white sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/80 to-transparent" />
                <div className="mx-auto max-w-7xl py-12 sm:py-16">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-5">
                            <a href="#top" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                                <img src="https://res.cloudinary.com/xg3fx2ic/image/upload/v1791152547/EduProw-Logo_033051.png" alt="EduProw logo" className="h-12 w-auto object-contain sm:h-14" />
                                <span className="min-w-0">
                                    <span className="block text-lg font-extrabold tracking-tight text-white sm:text-xl">EduProw</span>
                                    <span className="mt-1 block text-xs text-slate-400">School Management Platform</span>
                                </span>
                            </a>
                            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">A connected platform for school administration, teaching, learning, finance and communication — helping schools manage everyday work with greater clarity.</p>
                            <a href="#contact" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                                Talk to our team <span aria-hidden="true">↗</span>
                            </a>
                        </div>
                        <div className="lg:col-span-3">
                            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Platform</h3>
                            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-1">
                                <a href="#solutions" className="w-fit text-slate-400 transition-colors hover:text-white">Solutions</a>
                                <a href="#portals" className="w-fit text-slate-400 transition-colors hover:text-white">User Portals</a>
                                <a href="#how-it-works" className="w-fit text-slate-400 transition-colors hover:text-white">How It Works</a>
                                <a href="#why-eduprow" className="w-fit text-slate-400 transition-colors hover:text-white">Why EduProw</a>
                                <a href="#partners" className="w-fit text-slate-400 transition-colors hover:text-white">Partner Network</a>
                            </div>
                        </div>
                        <div className="lg:col-span-4">
                            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Contact</h3>
                            <p className="mt-4 text-sm leading-6 text-slate-400">Want to see how EduProw could work for your school? Get in touch with us.</p>
                            <div className="mt-5 space-y-4 text-sm">
                                <a href={`mailto:${contactEmail}`} className="flex min-w-0 items-start gap-3 text-slate-400 transition-colors hover:text-white">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-sky-300" aria-hidden="true">@</span>
                                    <span className="break-all pt-1">{contactEmail}</span>
                                </a>
                                <a href={`tel:${primaryPhone}`} className="flex items-start gap-3 text-slate-400 transition-colors hover:text-white">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-sky-300" aria-hidden="true">☎</span>
                                    <span className="pt-1">{primaryPhone}</span>
                                </a>
                                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-slate-400 transition-colors hover:text-white">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-sky-300" aria-hidden="true">↗</span>
                                    <span className="pt-1">Chat with us on WhatsApp</span>
                                </a>
                                <p className="text-xs leading-5 text-slate-500">{address}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-slate-500 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
                        <p>© {new Date().getFullYear()} EduProw. All rights reserved.</p>
                        <p>Built for schools. Designed to grow. <span className="px-1 text-slate-700">·</span> <a href="#top" className="font-semibold text-slate-300 transition-colors hover:text-white">Back to top ↑</a></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
