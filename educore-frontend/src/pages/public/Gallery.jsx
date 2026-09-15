import { useState } from "react";
import { Link } from "react-router-dom";

import Loading from "@/components/common/Loading";
import { usePublishedGallery, useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

function Gallery() {
    const { data: settings } = useSchoolSettings();
    const {
        data: page,
        isLoading: isPageLoading,
        isError: isPageError,
    } = useWebsitePage("gallery");
    const {
        data: galleryItems = [],
        isLoading: isGalleryLoading,
        isError: isGalleryError,
    } = usePublishedGallery();

    const [selectedCategory, setSelectedCategory] = useState("All");

    const primaryColor = settings?.primary_color || "#1D4ED8";
    const sections = page?.sections || [];

    const getSection = (key) =>
        sections.find(
            (section) =>
                section.section_key === key &&
                section.is_active !== false
        );

    const hero = getSection("hero");
    const intro = getSection("intro");
    const gallerySection = getSection("gallery");
    const galleryCta = getSection("gallery_cta") || getSection("contact_cta");

    const schoolName = settings?.school_name || "Our School";
    const categories = [
        "All",
        ...new Set(
            galleryItems
                .map((item) => item.category)
                .filter(Boolean)
        ),
    ];

    const filteredItems =
        selectedCategory === "All"
            ? galleryItems
            : galleryItems.filter(
                  (item) => item.category === selectedCategory
              );

    if (isPageLoading || isGalleryLoading) {
        return (
            <div className="min-h-[60vh]">
                <Loading message="Loading gallery..." />
            </div>
        );
    }

    if (isPageError || isGalleryError) {
        return (
            <div className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl border bg-slate-50 p-10 text-center">
                    <h2 className="text-xl font-bold text-slate-900">
                        Gallery information is not available yet
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Configure the gallery page and publish school photos
                        from Website Management. The page can be updated at
                        any time without changing the website layout.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
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
                            style={{ color: "color-mix(in srgb, var(--school-primary) 75%, white)" }}
                        >
                            {hero?.section_subtitle || "School Life"}
                        </p>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            {hero?.section_title || "Our Gallery"}
                        </h1>
                        <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                            {hero?.section_content ||
                                "Share photos that give visitors a genuine view of your school, its learning environment, activities and memorable moments."}
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                        >
                            {intro?.section_subtitle || "Moments That Matter"}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {intro?.section_title || "Showcase life at your school"}
                        </h2>
                        <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                            {intro?.section_content ||
                                "Use this space to show parents, students and visitors what makes your school community unique. Add your own photos, categories and descriptions from Website Management."}
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {galleryItems.length > 0 && categories.length > 1 && (
                        <div className="mb-10 flex flex-wrap justify-center gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className="rounded-full px-5 py-2.5 text-sm font-semibold transition"
                                    style={
                                        selectedCategory === category
                                            ? {
                                                  backgroundColor: primaryColor,
                                                  color: "white",
                                              }
                                            : undefined
                                    }
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}

                    {galleryItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Add your school gallery
                            </h3>
                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                                No gallery photos have been published yet. Add
                                school-owned images from Website Management and
                                they will appear here automatically.
                            </p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
                            <h3 className="text-lg font-semibold text-slate-900">
                                No items in this category
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory("All")}
                                className="mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                View All Photos
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={item.image_url}
                                            alt={item.title || "School gallery image"}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                                        <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            {item.category && (
                                                <p
                                                    className="text-xs font-semibold uppercase tracking-wider"
                                                    style={{ color: "#bfdbfe" }}
                                                >
                                                    {item.category}
                                                </p>
                                            )}
                                            <h3 className="mt-1 text-lg font-bold text-white">
                                                {item.title || "School Moment"}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        {item.category && (
                                            <p
                                                className="text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: primaryColor }}
                                            >
                                                {item.category}
                                            </p>
                                        )}
                                        <h3 className="mt-2 text-lg font-bold text-slate-900">
                                            {item.title || "School Moment"}
                                        </h3>
                                        {item.description && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div
                    className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16"
                    style={{ backgroundColor: primaryColor }}
                >
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                        {galleryCta?.section_subtitle || "Explore More"}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                        {galleryCta?.section_title || "Discover more about our school"}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                        {galleryCta?.section_content ||
                            `Use this section to encourage visitors to learn more about ${schoolName}, your programmes and how to get in touch.`}
                    </p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            to={galleryCta?.button_url || "../admissions"}
                            className="rounded-lg bg-white px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:opacity-90"
                            style={{ color: primaryColor }}
                        >
                            {galleryCta?.button_text || "Explore Admissions"}
                        </Link>
                        <Link
                            to="../contact"
                            className="rounded-lg border border-white/60 px-6 py-3 font-semibold transition hover:bg-white/10"
                        >
                            Contact the School
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Gallery;
