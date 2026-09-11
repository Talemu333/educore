const modules = [
    { icon: "🎓", title: "Academic Management", description: "Manage students, classes, arms, subjects, sessions, terms, grading, results and promotion from one connected workspace.", items: ["Student records", "Classes & subjects", "Results & grading", "Promotion history"] },
    { icon: "👩‍🏫", title: "Teaching & Learning", description: "Give teachers the tools they need to manage attendance, students, assessments and everyday classroom activities.", items: ["Teacher portal", "Attendance", "Assessments", "Student performance"] },
    { icon: "💻", title: "CBT & Online Testing", description: "Create and manage computer-based examinations, question banks and timed online tests while tracking student performance automatically.", items: ["Question bank", "CBT exam creation", "Timed online tests", "Automatic scoring"] },
    { icon: "👨‍👩‍👧", title: "Parent Engagement", description: "Keep parents connected to their children's academic progress, attendance, announcements and financial information.", items: ["Parent portal", "Results", "Attendance", "Fee information"] },
    { icon: "💳", title: "Fees & Finance", description: "Keep school finances organized with fee structures, payments, receipts, reports and expense tracking.", items: ["Fee management", "Payments", "Payment reports", "Expenses"] },
    { icon: "📣", title: "Communication", description: "Share important information with the school community through announcements, notifications and public content.", items: ["Announcements", "Notifications", "News", "Events"] },
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
    ["🚀", "Grow with EduProw", "We are building a network of people who can help more schools discover and adopt better digital tools."]
];

export default function EduProwLandingPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
                    <a href="/eduprow" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-sm">E</div>
                        <div>
                            <p className="text-lg font-extrabold tracking-tight text-slate-950">EduProw</p>
                            <p className="text-[11px] font-medium text-slate-500">School Management Platform</p>
                        </div>
                    </a>

                    <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
                        <a href="#solutions" className="transition hover:text-blue-600">Solutions</a>
                        <a href="#how-it-works" className="transition hover:text-blue-600">How It Works</a>
                        <a href="#partners" className="transition hover:text-blue-600">Partners</a>
                        <a href="#contact" className="transition hover:text-blue-600">Contact</a>
                    </nav>

                    <div className="flex items-center gap-2">
                        <a href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex">School Sign In</a>
                        <a href="#get-started" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">Get Started</a>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden bg-slate-950 px-5 py-20 text-white sm:px-6 sm:py-28 lg:px-8 lg:py-32">
                    <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                        <div>
                            <span className="inline-flex rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Modern school management</span>
                            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Run your school with <span className="text-blue-400">clarity.</span></h1>
                            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">EduProw brings school administration, academics, teachers, parents, students, finance, communication and your public website together in one powerful platform.</p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <a href="#get-started" className="rounded-xl bg-blue-600 px-7 py-3.5 text-center text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500">Get Started</a>
                                <a href="#solutions" className="rounded-xl border border-white/15 px-7 py-3.5 text-center text-sm font-semibold transition hover:bg-white/10">Explore Solutions</a>
                            </div>

                            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
                                <span>✓ Role-based access</span>
                                <span>✓ Multi-school ready</span>
                                <span>✓ School-branded websites</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur sm:p-5">
                                <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xl sm:p-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">School overview</p>
                                            <h2 className="mt-1 text-lg font-extrabold">Everything in one view</h2>
                                        </div>
                                        <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Current term</div>
                                    </div>
                                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[["Students", "1,248"], ["Teachers", "64"], ["Attendance", "94%"], ["Fees", "87%"]].map(([label, value]) => (
                                            <div key={label} className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-[11px] font-medium text-slate-500">{label}</p>
                                                <p className="mt-1 text-xl font-black">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400">Academic performance</p>
                                                <p className="mt-1 text-lg font-bold">Results & attendance</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Live</span>
                                        </div>
                                        <div className="mt-5 flex h-20 items-end gap-2">
                                            {[35,52,46,68,60,78,88,82,94,86].map((height, index) => (
                                                <div key={index} className="flex-1 rounded-t-md bg-blue-500/80" style={{ height: `${height}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="solutions" className="px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Complete school solution</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Everything your school needs to operate better.</h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">From admissions and student records to results, fees, communication, CBT and your school website, EduProw connects the workflows that matter most.</p>
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
                            <p className="mt-4 leading-7 text-slate-400">EduProw gives each stakeholder the right information and tools without overwhelming them with features they do not need.</p>
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

                <section id="how-it-works" className="px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Getting started</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A simple path from interest to implementation.</h2>
                        </div>
                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            {steps.map(([number, title, description]) => (
                                <article key={number} className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                                    <span className="text-sm font-black text-blue-600">{number}</span>
                                    <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="why-eduprow" className="bg-slate-50 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Why EduProw</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Less paperwork. Better decisions. Stronger schools.</h2>
                                <p className="mt-5 text-base leading-7 text-slate-600">A good school management system should not add another layer of complexity. EduProw brings the important pieces together so your team can spend less time chasing information and more time running the school.</p>
                                <a href="#get-started" className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700">Talk to EduProw</a>
                            </div>
                            <div className="grid gap-4">
                                {highlights.map(([number, title, description]) => (
                                    <div key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                        <div className="flex gap-5">
                                            <span className="text-sm font-black text-blue-600">{number}</span>
                                            <div><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{description}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="partners" className="px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-[2rem] border border-blue-100 bg-blue-50 p-7 sm:p-12 lg:p-14">
                        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">EduProw Partner Network</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Want to become an EduProw marketer?</h2>
                                <p className="mt-5 leading-7 text-slate-600">If you know school owners, administrators or education organisations that need better digital tools, you can work with EduProw to introduce them to the platform.</p>
                                <a href="#contact" className="mt-7 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800">I want to become a marketer</a>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {partnerPoints.map(([icon, title, description]) => (
                                    <article key={title} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                                        <div className="text-2xl">{icon}</div>
                                        <h3 className="mt-4 font-extrabold">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="get-started" className="bg-slate-950 px-5 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Start a conversation</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Let's talk about what your school needs.</h2>
                            <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">Whether you are a school owner exploring EduProw or someone interested in working with us as a marketer, this is the right place to begin.</p>
                        </div>
                        <div className="mt-12 grid gap-5 md:grid-cols-2">
                            <a href="#contact" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:bg-white/[0.08]">
                                <span className="text-2xl">🏫</span>
                                <h3 className="mt-5 text-xl font-extrabold">I represent a school</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Ask questions, discuss your school's needs and explore how EduProw can fit your operations.</p>
                                <span className="mt-6 inline-flex text-sm font-bold text-blue-400">Contact EduProw →</span>
                            </a>
                            <a href="#partners" className="group rounded-3xl border border-blue-500/20 bg-blue-600/10 p-7 transition hover:-translate-y-1 hover:bg-blue-600/15">
                                <span className="text-2xl">📈</span>
                                <h3 className="mt-5 text-xl font-extrabold">I want to become a marketer</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Join the conversation about helping more schools discover EduProw and digital school management.</p>
                                <span className="mt-6 inline-flex text-sm font-bold text-blue-400">Explore partnership →</span>
                            </a>
                        </div>
                    </div>
                </section>

                <section id="contact" className="scroll-mt-24 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Contact EduProw</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Have a question? Let's talk.</h2>
                                <p className="mt-5 leading-7 text-slate-600">Use this section for school enquiries, product questions and marketing or partnership conversations.</p>
                                <div className="mt-8 space-y-3 text-sm text-slate-600">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="font-extrabold text-slate-900">School enquiries</p><p className="mt-1">For demos, onboarding and school management questions.</p></div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="font-extrabold text-slate-900">Marketing & partnerships</p><p className="mt-1">For people interested in becoming EduProw marketers or partners.</p></div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
                                <p className="text-lg font-extrabold">Start with the right conversation</p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Choose the path that best describes why you are contacting EduProw.</p>
                                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                    <a href="#get-started" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50"><p className="font-bold">School / Organisation</p><p className="mt-1 text-xs leading-5 text-slate-500">Discuss the platform, demo or onboarding.</p></a>
                                    <a href="#partners" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50"><p className="font-bold">Marketer / Partner</p><p className="mt-1 text-xs leading-5 text-slate-500">Learn about working with EduProw.</p></a>
                                </div>
                                <div className="mt-7 rounded-2xl bg-slate-950 p-6 text-white">
                                    <p className="text-sm font-bold">Ready to move forward?</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">Use the appropriate option above and we'll keep the conversation focused on what you need.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-950 px-5 py-12 text-white sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold">E</div>
                            <div><p className="font-extrabold">EduProw</p><p className="text-xs text-slate-500">School Management Platform</p></div>
                        </div>
                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">A modern school management platform built to connect administration, academics, finance, communication and the school community.</p>
                    </div>
                    <div>
                        <p className="font-bold">Platform</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-400">
                            <a href="#solutions" className="block hover:text-white">Solutions</a>
                            <a href="#how-it-works" className="block hover:text-white">How It Works</a>
                            <a href="#partners" className="block hover:text-white">Partner Network</a>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold">Access</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-400">
                            <a href="/login" className="block hover:text-white">School Sign In</a>
                            <a href="#get-started" className="block hover:text-white">Get Started</a>
                            <a href="#contact" className="block hover:text-white">Contact EduProw</a>
                        </div>
                    </div>
                </div>
                <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-7 text-sm text-slate-500">© {new Date().getFullYear()} EduProw. All rights reserved.</div>
            </footer>
        </div>
    );
}
