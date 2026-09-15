import { Link } from "react-router-dom";

import { usePublishedNews, useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

function News() {
    const { data: newsItems = [], isLoading, isError } = usePublishedNews();
    const { data: page } = useWebsitePage("news");
    const { data: settings } = useSchoolSettings();

    const primaryColor = settings?.primary_color || "#1D4ED8";
    const sections = page?.sections || [];

    const getSection = (key) =>
        sections.find(
            (section) =>
                section.section_key === key && section.is_active !== false
        );

    const hero = getSection("hero");
    const featured = getSection("featured_news");
    const latest = getSection("latest_news");
    const information = getSection("news_information");
    const cta = getSection("news_cta") || getSection("contact_cta");

    const featuredNews = newsItems.length > 0 ? newsItems[0] : null;
    const latestNews = newsItems.filter(
        (news) => !featuredNews || news.id !== featuredNews.id
    );

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div
                        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200"
                        style={{ borderTopColor: primaryColor }}
                    />
                    <p className="mt-4 text-sm text-slate-500">Loading news...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="max-w-xl text-center">
                    <h2 className="text-2xl font-bold text-slate-900">
                        School News
                    </h2>
                    <p className="mt-3 leading-7 text-slate-600">
                        Use this page to share school announcements, achievements,
                        activities and other important updates with your community.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* HERO */}
            <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
                <div
                    className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20"
                    style={{ backgroundColor: primaryColor }}
                />
                <div
                    className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full opacity-10"
                    style={{ backgroundColor: primaryColor }}
                />

                <div className="relative mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p
                            className="text-sm font-bold uppercase tracking-[0.2em]"
                            style={{ color: `${primaryColor}cc` }}
                        >
                            {hero?.section_subtitle || "School Updates"}
                        </p>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            {hero?.section_title || "News & Announcements"}
                        </h1>
                        <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                            {hero?.section_content ||
                                "Use this page to share your school's latest news, announcements, achievements and stories with parents, students and visitors."}
                        </p>
                    </div>
                </div>
            </section>

            {/* FEATURED NEWS */}
            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                        >
                            {featured?.section_subtitle || "Featured"}
                        </p>
                        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                            {featured?.section_title || "Featured School News"}
                        </h2>
                    </div>

                    {featuredNews ? (
                        <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="grid lg:grid-cols-2">
                                <div className="relative min-h-[280px] overflow-hidden bg-slate-100 sm:min-h-[360px] lg:min-h-[460px]">
                                    {featuredNews.image_url ? (
                                        <img
                                            src={featuredNews.image_url}
                                            alt={featuredNews.title}
                                            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center p-8 text-center">
                                            <div>
                                                <div
                                                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl text-white"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    📰
                                                </div>
                                                <p className="mt-4 text-sm text-slate-500">
                                                    Add an image to this news article in Website Management.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                                    <p className="text-sm text-slate-500">
                                        {formatDate(featuredNews.published_at)}
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                                        {featuredNews.title}
                                    </h2>
                                    {featuredNews.excerpt && (
                                        <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                                            {featuredNews.excerpt}
                                        </p>
                                    )}
                                    {featuredNews.author && (
                                        <p className="mt-4 text-sm text-slate-500">
                                            By {featuredNews.author}
                                        </p>
                                    )}
                                    <Link
                                        to={`/website/news/${featuredNews.slug}`}
                                        className="mt-7 inline-flex w-fit items-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {featured?.button_text || "Read More"}
                                        <span className="ml-2">→</span>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                            <div
                                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                📰
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-900">
                                Add your first news article
                            </h3>
                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                                Publish school news, announcements or achievements from Website Management. Published articles will appear here automatically.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* LATEST NEWS */}
            {latestNews.length > 0 && (
                <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10">
                            <p
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: primaryColor }}
                            >
                                {latest?.section_subtitle || "Latest Updates"}
                            </p>
                            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                                {latest?.section_title || "Latest News"}
                            </h2>
                        </div>

                        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                            {latestNews.map((news) => (
                                <article
                                    key={news.id}
                                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="relative h-56 overflow-hidden bg-slate-100">
                                        {news.image_url ? (
                                            <img
                                                src={news.image_url}
                                                alt={news.title}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-4xl">
                                                📰
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <p className="text-xs font-medium text-slate-500">
                                            {formatDate(news.published_at)}
                                        </p>
                                        <h3 className="mt-2 text-xl font-bold leading-snug">
                                            {news.title}
                                        </h3>
                                        {news.excerpt && (
                                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                                {news.excerpt}
                                            </p>
                                        )}
                                        {news.author && (
                                            <p className="mt-3 text-xs text-slate-500">
                                                By {news.author}
                                            </p>
                                        )}
                                        <Link
                                            to={`/website/news/${news.slug}`}
                                            className="mt-5 inline-flex items-center text-sm font-semibold transition hover:gap-2"
                                            style={{ color: primaryColor }}
                                        >
                                            Read Article
                                            <span className="ml-1">→</span>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* INFORMATION */}
            <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                        >
                            {information?.section_subtitle || "Stay Informed"}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            {information?.section_title || "Keep your school community informed."}
                        </h2>
                        <p className="mt-4 leading-7 text-slate-600">
                            {information?.section_content ||
                                "Use this section to explain how your school communicates important announcements, academic updates, activities and achievements."}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div
                    className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16"
                    style={{ backgroundColor: primaryColor }}
                >
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        {cta?.section_title || "Have a question about a school update?"}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                        {cta?.section_content ||
                            "Use this section to direct visitors to the appropriate school contact or information page."}
                    </p>
                    <Link
                        to={cta?.button_url || "/website/contact"}
                        className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 font-semibold transition hover:bg-slate-100"
                        style={{ color: primaryColor }}
                    >
                        {cta?.button_text || "Contact the School"}
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default News;
