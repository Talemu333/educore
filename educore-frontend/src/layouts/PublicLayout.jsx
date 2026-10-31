import { useState } from "react";

import {
    Outlet,
    Link,
    NavLink,
    useLocation
} from "react-router-dom";

import { useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import "@/schoolCreativeDesign.css";

const NAVIGATION = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Academics", path: "/academics" },
    { label: "Admissions", path: "/admissions" },
    { label: "News", path: "/news" },
    { label: "Gallery", path: "/gallery" },
    { label: "Events", path: "/events" },
    { label: "Contact", path: "/contact" }
];

function getWebsiteBasePath() {
    const hostname = window.location.hostname.toLowerCase();
    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;
    const isCustomSchoolDomain =
        !isEduProwDomain &&
        !isEduProwSubdomain &&
        !["localhost", "127.0.0.1"].includes(hostname) &&
        !hostname.endsWith(".vercel.app");

    if (isEduProwSubdomain || isCustomSchoolDomain) {
        return "";
    }

    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";

    if (firstSegment && firstSegment !== "website") {
        return `/${firstSegment}`;
    }

    return "/website";
}

function SchoolResolutionState({ error }) {
    const status = error?.response?.status;
    const isNotFound = status === 404;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl font-extrabold text-slate-500">
                    {isNotFound ? "404" : "!"}
                </div>
                <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
                    {isNotFound ? "School not found" : "Unable to load school website"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    {isNotFound
                        ? "The school website address you entered does not belong to a registered school."
                        : "We could not load this school website right now. Please try again shortly."}
                </p>
                <Link
                    to="https://eduprow.com"
                    className="mt-6 inline-flex rounded-lg px-5 py-2.5 text-sm font-bold text-white"
                    style={{ backgroundColor: "#1D4ED8" }}
                >
                    Go to EduProw
                </Link>
            </div>
        </div>
    );
}

function PublicLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const { data: homePage } = useWebsitePage("home");

    const {
        data: settings,
        isLoading: isSettingsLoading,
        isError: isSettingsError,
        error: settingsError
    } = useSchoolSettings();

    if (isSettingsLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <p className="text-sm font-medium text-slate-500">Loading school website...</p>
            </div>
        );
    }

    if (isSettingsError || !settings) {
        return <SchoolResolutionState error={settingsError} />;
    }

    const primaryColor = settings.primary_color || "#1D4ED8";
    const secondaryColor = settings.secondary_color || "#D9B351";
    const schoolName = settings.school_name || "Your School";
    const schoolInitial = schoolName.trim().charAt(0).toUpperCase() || "S";
    const schoolAddress = settings.school_address || "";
    const schoolPhone = settings.school_phone || "";
    const schoolEmail = settings.school_email || "";
    const websiteBasePath = getWebsiteBasePath();
    const isHomePage = location.pathname === websiteBasePath || location.pathname === `${websiteBasePath}/` || (websiteBasePath === "/website" && location.pathname === "/website");
    const footerSection = homePage?.sections?.find((section) => section.section_key === "footer");
    const footerDescription = footerSection?.section_content?.trim() || "";

    const publicPath = (path) => `${websiteBasePath}${path === "/" ? "" : path}` || "/";

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="public-site school-creative-site min-h-screen bg-white text-slate-900" style={{ "--school-primary": primaryColor, "--school-secondary": secondaryColor }}>
            {isHomePage && (
                <div className="bg-[#06264f] text-white">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-[11px] font-semibold sm:justify-start sm:px-6 lg:px-8">
                        {schoolPhone && <a href={`tel:${schoolPhone.replace(/[^+\\d]/g, "")}`} className="inline-flex items-center gap-2">☎ <span>{schoolPhone}</span></a>}
                        {schoolEmail && <a href={`mailto:${schoolEmail}`} className="inline-flex items-center gap-2">✉ <span>{schoolEmail}</span></a>}
                        {schoolAddress && <span className="inline-flex items-center gap-2">⌖ <span>{schoolAddress}</span></span>}
                    </div>
                </div>
            )}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
                    <Link
                        to={publicPath("/")}
                        onClick={closeMobileMenu}
                        className="flex min-w-0 flex-1 items-center gap-3 xl:max-w-[430px]"
                    >
                        {settings.school_logo ? (
                            <img
                                src={settings.school_logo}
                                alt={`${schoolName} logo`}
                                className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-white object-contain p-1 shadow-sm"
                            />
                        ) : (
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-sm"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {schoolInitial}
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-extrabold leading-tight tracking-tight text-slate-900 sm:text-base lg:text-lg">
                                {schoolName}
                            </p>
                            {settings.school_motto && (
                                <p className="hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block">
                                    {settings.school_motto}
                                </p>
                            )}
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 xl:flex">
                        {NAVIGATION.map((item) => {
                            const path = publicPath(item.path);
                            return (
                                <NavLink
                                    key={item.path}
                                    to={path}
                                    end={item.path === "/"}
                                    className={({ isActive }) => `relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "text-slate-900"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {item.label}
                                            {isActive && (
                                                <span
                                                    className="absolute -bottom-[20px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full"
                                                    style={{ backgroundColor: primaryColor }}
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}

                        <Link
                            to={publicPath("/login")}
                            className="ml-3 rounded-lg border px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-sm"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                            Sign In
                        </Link>

                        <Link
                            to={publicPath("/admissions")}
                            className="rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Apply Now
                        </Link>
                    </nav>

                    <button
                        type="button"
                        aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
                        aria-expanded={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen((previous) => !previous)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 xl:hidden"
                    >
                        {mobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-slate-200 bg-white px-4 py-4 xl:hidden">
                        <nav className="mx-auto max-w-7xl">
                            <div className="flex flex-col gap-1">
                                {NAVIGATION.map((item) => {
                                    const path = publicPath(item.path);
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={path}
                                            end={item.path === "/"}
                                            onClick={closeMobileMenu}
                                            className={({ isActive }) => `rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                                isActive ? "text-white" : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                            style={({ isActive }) => isActive ? { backgroundColor: primaryColor } : undefined}
                                        >
                                            {item.label}
                                        </NavLink>
                                    );
                                })}
                            </div>

                            <Link
                                to={publicPath("/login")}
                                onClick={closeMobileMenu}
                                className="mt-3 block rounded-lg border px-4 py-3 text-center text-sm font-bold transition"
                                style={{ borderColor: primaryColor, color: primaryColor }}
                            >
                                Sign In
                            </Link>

                            <Link
                                to={publicPath("/admissions")}
                                onClick={closeMobileMenu}
                                className="mt-2 block rounded-lg px-4 py-3 text-center text-sm font-bold text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Apply Now
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                <Outlet />
            </main>

            {isHomePage ? (
                <footer className="text-white">
                    <section className="bg-amber-400 text-slate-950">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-4 sm:flex-row sm:px-8">
                            <div><h2 className="text-base font-extrabold">Get in Touch</h2><p className="text-xs">We are here to help. Contact us for enquiries, admission details or a school tour.</p></div>
                            <div className="flex flex-wrap items-center gap-5 text-xs font-bold">
                                {schoolPhone && <a href={`tel:${schoolPhone.replace(/[^+\\d]/g, "")}`}>☎ {schoolPhone}</a>}
                                {schoolEmail && <a href={`mailto:${schoolEmail}`}>✉ {schoolEmail}</a>}
                                <Link to={publicPath("/contact")} className="rounded-full bg-slate-950 px-5 py-2.5 text-white">Contact Us →</Link>
                            </div>
                        </div>
                    </section>
                    <div className="bg-[#06264f]">
                        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-start gap-3">
                                {settings.school_logo && <img src={settings.school_logo} alt={`${schoolName} logo`} className="h-14 w-14 rounded-lg bg-white object-contain p-1" />}
                                <div><h2 className="text-lg font-black">{schoolName}</h2>{settings.school_motto && <p className="mt-1 text-xs italic text-amber-300">{settings.school_motto}</p>}</div>
                            </div>
                            <div><h3 className="font-extrabold">Quick Links</h3><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/80">{NAVIGATION.filter(item => item.path !== "/").map(item => <Link key={item.path} to={publicPath(item.path)}>{item.label}</Link>)}</div></div>
                            <div><h3 className="font-extrabold">Contact</h3><div className="mt-3 space-y-2 break-words text-xs text-white/80">{schoolAddress && <p>⌖ {schoolAddress}</p>}{schoolPhone && <p>☎ {schoolPhone}</p>}{schoolEmail && <p>✉ {schoolEmail}</p>}</div></div>
                            <div><h3 className="font-extrabold">Admissions</h3><p className="mt-3 text-xs leading-5 text-white/80">Discover our learning community and take the next step.</p><Link to={publicPath("/admissions")} className="mt-3 inline-flex rounded-full px-4 py-2 text-xs font-bold text-slate-950" style={{ backgroundColor: secondaryColor }}>Apply Now →</Link></div>
                        </div>
                        <div className="border-t border-white/15"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-4 text-[11px] text-white/70 sm:flex-row sm:px-8"><p>© {new Date().getFullYear()} {schoolName}. All rights reserved.</p><p>Powered by <a href="https://eduprow.com" className="font-bold text-white">EduProw</a></p></div></div>
                    </div>
                </footer>
            ) : (
                            <footer className="mt-16 text-white">
                                <section className="relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                                    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[32px] border-white/10" />
                                    <div className="pointer-events-none absolute -bottom-28 right-1/4 h-56 w-56 rounded-full border-[24px] border-white/10" />
                                    <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 lg:py-12">
                                        <div className="max-w-2xl">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Your future starts here</p>
                                            <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">Building knowledge. Shaping character. Inspiring success.</h2>
                                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">Discover a learning community committed to helping every student grow and achieve their potential.</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                                            <Link to={publicPath("/admissions")} className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5" style={{ backgroundColor: secondaryColor, color: "#172033" }}>
                                                Explore Admissions <span className="ml-2" aria-hidden="true">→</span>
                                            </Link>
                                            <Link to={publicPath("/contact")} className="inline-flex items-center justify-center rounded-lg border border-white/50 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                                                Contact the School
                                            </Link>
                                        </div>
                                    </div>
                                </section>
                
                                <div className="bg-slate-950">
                                    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-14">
                                        <div className="lg:col-span-4">
                                            <Link to={publicPath("/")} className="inline-flex max-w-full items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                                                {settings.school_logo ? (
                                                    <img src={settings.school_logo} alt={`${schoolName} logo`} className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1.5" />
                                                ) : (
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold text-white" style={{ backgroundColor: primaryColor }}>{schoolInitial}</div>
                                                )}
                                                <div className="min-w-0">
                                                    <h2 className="break-words text-lg font-extrabold leading-snug text-white sm:text-xl">{schoolName}</h2>
                                                    {settings.school_motto && <p className="mt-1 break-words text-xs leading-5 text-slate-400">{settings.school_motto}</p>}
                                                </div>
                                            </Link>
                                            {footerDescription && <p className="mt-5 max-w-sm whitespace-pre-line text-sm leading-7 text-slate-400">{footerDescription}</p>}
                                            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">A community where learners are encouraged to grow, discover their strengths, and prepare for the future.</p>
                                        </div>
                
                                        <div className="lg:col-span-2">
                                            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Quick links</h3>
                                            <div className="mt-5 flex flex-col items-start gap-3">
                                                {NAVIGATION.filter((item) => ["/", "/about", "/academics", "/news", "/events"].includes(item.path)).map((item) => (
                                                    <Link key={item.path} to={publicPath(item.path)} className="text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{item.label}</Link>
                                                ))}
                                            </div>
                                        </div>
                
                                        <div className="lg:col-span-2">
                                            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Admissions</h3>
                                            <div className="mt-5 flex flex-col items-start gap-3">
                                                <Link to={publicPath("/admissions")} className="text-sm text-slate-400 transition-colors hover:text-white">Admission information</Link>
                                                <Link to={publicPath("/gallery")} className="text-sm text-slate-400 transition-colors hover:text-white">School gallery</Link>
                                                <Link to={publicPath("/contact")} className="text-sm text-slate-400 transition-colors hover:text-white">Contact us</Link>
                                                <Link to={publicPath("/login")} className="inline-flex items-center gap-2 pt-1 text-sm font-bold transition-colors hover:opacity-80" style={{ color: secondaryColor }}>Student & Staff Portal <span aria-hidden="true">↗</span></Link>
                                            </div>
                                        </div>
                
                                        <div className="lg:col-span-4">
                                            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Contact information</h3>
                                            <p className="mt-4 text-sm leading-6 text-slate-400">We welcome your questions and enquiries. Reach out to the school using the details below.</p>
                                            <div className="mt-5 space-y-4">
                                                {schoolAddress && <div className="flex items-start gap-3 text-sm text-slate-400"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: secondaryColor }} aria-hidden="true">⌖</span><span className="pt-1 leading-6">{schoolAddress}</span></div>}
                                                {schoolPhone && <a href={`tel:${schoolPhone.replace(/[^+\\d]/g, "")}`} className="flex items-start gap-3 text-sm text-slate-400 transition-colors hover:text-white"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: secondaryColor }} aria-hidden="true">☎</span><span className="pt-2">{schoolPhone}</span></a>}
                                                {schoolEmail && <a href={`mailto:${schoolEmail}`} className="flex min-w-0 items-start gap-3 text-sm text-slate-400 transition-colors hover:text-white"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: secondaryColor }} aria-hidden="true">@</span><span className="break-all pt-2">{schoolEmail}</span></a>}
                                                {!schoolAddress && !schoolPhone && !schoolEmail && <p className="text-sm leading-6 text-slate-500">Contact details will appear here when added in School Settings.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                
                                <div className="bg-black">
                                    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs leading-5 text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                                        <p>© {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
                                        <p>Designed for the school community <span className="px-1 text-slate-700">·</span> Powered by <a href="https://eduprow.com" className="font-semibold text-slate-300 transition-colors hover:text-white">EduProw</a></p>
                                    </div>
                                </div>
                            </footer>
            )}
        </div>
    );
}

export default PublicLayout;
