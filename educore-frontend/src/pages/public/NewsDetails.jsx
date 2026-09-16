import {
    Link,
    useParams
} from "react-router-dom";

import {
    useNewsBySlug
} from "@/hooks/useWebsite";

import {
    useSchoolSettings
} from "@/hooks/useSchoolSettings";


function NewsDetails() {

    const { slug } = useParams();

    const {
        data: article,
        isLoading,
        isError
    } = useNewsBySlug(slug);

    const {
        data: settings = {}
    } = useSchoolSettings();

    const schoolName =
        settings.school_name ||
        "Our School";

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="text-center">
                    <div
                        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200"
                        style={{ borderTopColor: "var(--school-primary, #1D4ED8)" }}
                    />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading article...
                    </p>
                </div>
            </div>
        );
    }

    if (isError || !article) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="max-w-lg text-center">
                    <p
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ color: "var(--school-primary, #1D4ED8)" }}
                    >
                        News Article
                    </p>

                    <h1 className="mt-3 text-3xl font-bold">
                        Article Not Found
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                        The news article you are looking for could not be found
                        or is no longer available.
                    </p>

                    <Link
                        to="/news"
                        className="mt-7 inline-flex rounded-lg px-5 py-3 text-sm font-semibold text-white transition"
                        style={{ backgroundColor: "var(--school-primary, #1D4ED8)" }}
                    >
                        ← Back to News
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
        : "";

    return (
        <article>
            <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        to="/news"
                        className="inline-flex items-center text-sm font-medium transition"
                        style={{ color: "color-mix(in srgb, var(--school-primary, #1D4ED8) 75%, white)" }}
                    >
                        ← Back to News
                    </Link>

                    <p
                        className="mt-8 text-sm font-bold uppercase tracking-[0.2em]"
                        style={{ color: "color-mix(in srgb, var(--school-primary, #1D4ED8) 75%, white)" }}
                    >
                        {schoolName} News
                    </p>

                    <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        {article.title}
                    </h1>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                        {formattedDate && <span>{formattedDate}</span>}
                        {article.author && <span>By {article.author}</span>}
                    </div>
                </div>
            </section>

            {article.image_url && (
                <section className="px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto -mt-8 max-w-6xl overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="max-h-[650px] w-full object-cover"
                        />
                    </div>
                </section>
            )}

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    {article.excerpt && (
                        <p
                            className="mb-10 border-l-4 pl-5 text-lg font-medium leading-8 text-slate-600 sm:text-xl"
                            style={{ borderColor: "var(--school-primary, #1D4ED8)" }}
                        >
                            {article.excerpt}
                        </p>
                    )}

                    <div className="whitespace-pre-line text-base leading-8 text-slate-700 sm:text-lg sm:leading-9">
                        {article.content}
                    </div>

                    {article.author && (
                        <div className="mt-12 border-t border-slate-200 pt-8">
                            <p className="text-sm text-slate-500">
                                Published by
                            </p>
                            <p className="mt-1 font-semibold text-slate-900">
                                {article.author}
                            </p>
                        </div>
                    )}

                    <div className="mt-10">
                        <Link
                            to="/news"
                            className="inline-flex items-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition"
                            style={{ backgroundColor: "var(--school-primary, #1D4ED8)" }}
                        >
                            ← Back to All News
                        </Link>
                    </div>
                </div>
            </section>
        </article>
    );
}

export default NewsDetails;
