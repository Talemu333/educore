export default function EduCoreLandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-white/10">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold">E</div>
                        <div>
                            <p className="text-lg font-extrabold tracking-tight">EduCore</p>
                            <p className="text-[11px] text-slate-400">School Management Platform</p>
                        </div>
                    </div>
                    <a href="/" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10">
                        School Sign In
                    </a>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
                    <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20" />
                    <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-indigo-500/10" />
                    <div className="relative mx-auto max-w-5xl text-center">
                        <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Built for modern schools</span>
                        <h1 className="mt-7 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                            One platform for your
                            <span className="block text-blue-400">entire school.</span>
                        </h1>
                        <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                            EduCore helps schools manage students, teachers, parents, academics, attendance, results, payments and their public school website from one place.
                        </p>
                        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                            <a href="/" className="rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500">Sign In to EduCore</a>
                            <a href="#features" className="rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold transition hover:bg-white/10">Explore the Platform</a>
                        </div>
                    </div>
                </section>

                <section id="features" className="bg-white px-6 py-20 text-slate-900 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">EduCore</p>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything your school needs</h2>
                            <p className="mt-4 leading-7 text-slate-600">A single platform designed to keep school operations connected, organized and easy to manage.</p>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                ["🎓", "Academic Management", "Students, classes, subjects, results, grading and promotion."],
                                ["👥", "People Management", "Manage teachers, parents, administrators and student records."],
                                ["📅", "Attendance & Timetable", "Keep daily attendance and school schedules organized."],
                                ["💳", "School Finance", "Manage fees, payments and financial reports in one place."],
                                ["🌐", "School Website", "Give every school its own branded public website and web address."],
                                ["🔐", "Multi-School Ready", "Keep each school's records and public content securely separated."]
                            ].map(([icon, title, description]) => (
                                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">{icon}</div>
                                    <h3 className="mt-5 text-lg font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-6 py-20 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-5xl rounded-3xl bg-slate-950 px-7 py-12 text-center text-white shadow-xl sm:px-12">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Your school. Your identity.</p>
                        <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Powered by EduCore.</h2>
                        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">Schools keep their own name, logo, colours and website content while EduCore quietly provides the technology underneath.</p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-400">
                <p>© {new Date().getFullYear()} EduCore. School management made simpler.</p>
            </footer>
        </div>
    );
}
