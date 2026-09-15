import { Link } from "react-router-dom";

import { usePublishedEvents, useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

function Events() {
    const { data: settings } = useSchoolSettings();
    const { data: page, isLoading: pageLoading, isError: pageError } = useWebsitePage("events");
    const { data: events = [], isLoading: eventsLoading } = usePublishedEvents();

    const primaryColor = settings?.primary_color || "#1D4ED8";
    const sections = page?.sections || [];
    const getSection = (key) => sections.find((section) => section.section_key === key && section.is_active !== false);

    const hero = getSection("hero");
    const eventsIntro = getSection("events");
    const eventsCta = getSection("events_cta") || getSection("cta");

    if (pageLoading || eventsLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200" style={{ borderTopColor: primaryColor }} />
                    <p className="mt-4 text-sm text-slate-500">Loading events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28">
                <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-20" style={{ backgroundColor: primaryColor }} />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full opacity-10" style={{ backgroundColor: primaryColor }} />
                <div className="relative mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: `${primaryColor}cc` }}>
                            {hero?.section_subtitle || "School Events"}
                        </p>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            {hero?.section_title || "Events & Activities"}
                        </h1>
                        <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">
                            {hero?.section_content || "Use this section to introduce your school's events, activities, celebrations and important dates."}
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                            {eventsIntro?.section_subtitle || "School Calendar"}
                        </p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {eventsIntro?.section_title || "Upcoming Events"}
                        </h2>
                        <p className="mt-4 leading-7 text-slate-600">
                            {eventsIntro?.section_content || "Published school events will appear here. Add events through Website Management so parents, students and visitors can stay informed."}
                        </p>
                    </div>

                    {pageError && (
                        <div className="mb-8 rounded-2xl border border-dashed bg-slate-50 p-5 text-sm text-slate-600">
                            Website page content is not configured yet. You can customize the headings and introduction from Website Management.
                        </div>
                    )}

                    {events.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-slate-50 px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white" style={{ backgroundColor: primaryColor }}>
                                📅
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-900">Add your school events</h3>
                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                                No published events are available yet. Add your school's events, activities or important dates through Website Management and they will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => {
                                const eventDate = new Date(event.event_date);
                                const formattedDate = eventDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });

                                return (
                                    <article key={event.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                                        <div className="relative h-56 overflow-hidden bg-slate-100">
                                            {event.image_url ? (
                                                <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-5xl" style={{ color: primaryColor }}>
                                                    📅
                                                </div>
                                            )}
                                            <div className="absolute left-4 top-4 overflow-hidden rounded-xl bg-white text-center shadow-lg">
                                                <div className="px-3 py-1 text-xs font-bold uppercase text-white" style={{ backgroundColor: primaryColor }}>
                                                    {eventDate.toLocaleDateString("en-US", { month: "short" })}
                                                </div>
                                                <div className="px-3 py-2 text-xl font-extrabold text-slate-900">{eventDate.getDate()}</div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <p className="text-xs font-medium text-slate-500">{formattedDate}</p>
                                            <h3 className="mt-2 text-xl font-bold leading-snug text-slate-900">{event.title}</h3>
                                            {event.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{event.description}</p>}
                                            {event.venue && <p className="mt-4 text-sm text-slate-500">📍 {event.venue}</p>}
                                            <Link to={`/website/events/${event.slug}`} className="mt-5 inline-flex items-center text-sm font-semibold transition hover:opacity-80" style={{ color: primaryColor }}>
                                                View Event <span className="ml-1">→</span>
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16" style={{ backgroundColor: primaryColor }}>
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        {eventsCta?.section_title || "Stay connected with your school community"}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 opacity-90 sm:text-base">
                        {eventsCta?.section_content || "Use this section to encourage visitors to stay informed about school activities and important dates."}
                    </p>
                    <Link
                        to={eventsCta?.button_url || "/website/contact"}
                        className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 font-semibold transition hover:opacity-90"
                        style={{ color: primaryColor }}
                    >
                        {eventsCta?.button_text || "Contact the School"}
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Events;
