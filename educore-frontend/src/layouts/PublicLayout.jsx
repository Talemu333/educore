import { useState } from "react";

import {
    Outlet,
    Link,
    NavLink
} from "react-router-dom";

import { useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

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

    useWebsitePage("home");

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

    // Never render a generic "EduCore School" website when tenant resolution
    // fails. The public website must belong to a real school.
    if (isSettingsError || !settings) {
        return <SchoolResolutionState error={settingsError} />;
    }

    const primaryColor = settings.primary_color || "#1D4ED8";
    const schoolName = settings.school_name;
    const schoolAddress = settings.school_address || "School address coming soon";
    const schoolPhone = settings.school_phone || "";
    const schoolEmail = settings.school_email || "";
    const websiteBasePath = getWebsiteBasePath();

    const publicPath = (path) => `${websiteBasePath}${path === "/" ? "" : path}` || "/";

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        to={publicPath("/")}
                        onClick={closeMobileMenu}
                        className="flex min-w-0 items-center gap-3"
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
                                E
                            </div>
                        )}

                        <div className="min-w-0">
                            <p className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                                {schoolName}
                            </p>
                            <p className="hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block">
                                {settings.school_motto || "Excellence • Character • Knowledge"}
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
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
                            to="/"
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
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
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
                    <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
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
                                to="/"
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

            <footer className="border-t border-slate-800 bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3">
                                {settings.school_logo ? (
                                    <img
                                        src={settings.school_logo}
                                        alt={`${schoolName} logo`}
                                        className="h-12 w-12 rounded-full bg-white object-contain p-1"
                                    />
                                ) : (
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        E
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-lg font-bold">{schoolName}</h2>
                                    <p className="hidden text-xs text-slate-400 sm:block">
                                        {settings.school_motto || "Excellence • Character • Knowledge"}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                                {schoolName} is committed to providing a nurturing environment where children can learn, grow, discover their talents and develop the character and knowledge needed for a successful future.
                            </p>

                            <div className="mt-6 flex gap-2">
                                {["Facebook", "Instagram", "YouTube"].map((social) => (
                                    <button
                                        key={social}
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-xs font-bold text-slate-400 transition hover:border-slate-500 hover:text-white"
                                        title={`${social} coming soon`}
                                    >
                                        {social[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold">Quick Links</h3>
                            <div className="mt-5 flex flex-col gap-3">
                                {NAVIGATION.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={publicPath(item.path)}
                                        className="text-sm text-slate-400 transition hover:text-white"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <Link
                                    to="/"
                                    className="text-sm font-semibold transition hover:text-white"
                                    style={{ color: primaryColor }}
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold">Contact Us</h3>
                            <div className="mt-5 space-y-4 text-sm text-slate-400">
                                <div className="flex gap-3">
                                    <span className="mt-0.5" style={{ color: primaryColor }}>●</span>
                                    <span>{schoolAddress}</span>
                                </div>
                                {schoolPhone && (
                                    <div className="flex gap-3">
                                        <span style={{ color: primaryColor }}>●</span>
                                        <span>{schoolPhone}</span>
                                    </div>
                                )}
                                {schoolEmail && (
                                    <div className="flex gap-3">
                                        <span style={{ color: primaryColor }}>●</span>
                                        <span className="break-all">{schoolEmail}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>© {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
                        <p>Powered by <span className="font-semibold text-slate-400">EduCore</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PublicLayout;
