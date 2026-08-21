import { useState } from "react";
import { Link } from "react-router-dom";

import Loading from "@/components/common/Loading";
import { usePublishedGallery } from "@/hooks/useWebsite";


function Gallery() {

    /*
    =====================================
    LOAD PUBLISHED GALLERY
    =====================================
    */

    const {
        data: galleryItems = [],
        isLoading,
        isError
    } = usePublishedGallery();


    /*
    =====================================
    CATEGORY FILTER
    =====================================
    */

    const [
        selectedCategory,
        setSelectedCategory
    ] = useState("All");


    /*
    =====================================
    GET CATEGORIES
    =====================================
    */

    const categories = [
        "All",
        ...new Set(
            galleryItems
                .map(item => item.category)
                .filter(Boolean)
        )
    ];


    /*
    =====================================
    FILTER GALLERY
    =====================================
    */

    const filteredItems =
        selectedCategory === "All"
            ? galleryItems
            : galleryItems.filter(
                item =>
                    item.category === selectedCategory
            );


    /*
    =====================================
    LOADING
    =====================================
    */

    if (isLoading) {

        return (

            <div className="min-h-[60vh]">

                <Loading
                    message="Loading gallery..."
                />

            </div>

        );

    }


    /*
    =====================================
    ERROR
    =====================================
    */

    if (isError) {

        return (

            <div className="px-4 py-20 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

                    <h2 className="text-xl font-bold text-red-700">

                        Unable to load gallery

                    </h2>


                    <p className="mt-2 text-sm text-red-600">

                        We could not load the school gallery
                        at the moment. Please try again later.

                    </p>

                </div>

            </div>

        );

    }


    return (

        <div>

            {/* =================================
                HERO
            ================================= */}

            <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">

                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20" />

                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-blue-500/10" />


                <div className="relative mx-auto max-w-7xl">

                    <div className="max-w-3xl">

                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">

                            School Life

                        </p>


                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">

                            Our Gallery

                        </h1>


                        <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">

                            Take a glimpse into life at Educore — from
                            classroom learning and practical activities to
                            friendships, celebrations and memorable moments.

                        </p>

                    </div>

                </div>

            </section>


            {/* =================================
                INTRO
            ================================= */}

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p className="text-sm font-bold uppercase tracking-wider text-blue-600">

                            Moments That Matter

                        </p>


                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">

                            Learning, growing and having fun

                        </h2>


                        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">

                            At Educore, education extends beyond the classroom.
                            Our pupils and students learn, collaborate,
                            participate and create memories that become part
                            of their educational journey.

                        </p>

                    </div>

                </div>

            </section>


            {/* =================================
                GALLERY
            ================================= */}

            <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                <div className="mx-auto max-w-7xl">


                    {/* =================================
                        CATEGORY FILTERS
                    ================================= */}

                    {galleryItems.length > 0 && categories.length > 1 && (

                        <div className="mb-10 flex flex-wrap justify-center gap-2">

                            {categories.map(
                                category => (

                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategory(
                                                category
                                            )
                                        }
                                        className={`
                                            rounded-full
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-semibold
                                            transition

                                            ${
                                                selectedCategory === category
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                                            }
                                        `}
                                    >

                                        {category}

                                    </button>

                                )
                            )}

                        </div>

                    )}


                    {/* =================================
                        EMPTY GALLERY
                    ================================= */}

                    {galleryItems.length === 0 ? (

                        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">

                            <h3 className="text-lg font-semibold">

                                No gallery items available

                            </h3>


                            <p className="mt-2 text-sm text-muted-foreground">

                                Gallery photos will appear here when
                                they are published by the school.

                            </p>

                        </div>

                    ) : filteredItems.length === 0 ? (

                        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">

                            <h3 className="text-lg font-semibold">

                                No items in this category

                            </h3>


                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedCategory("All")
                                }
                                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            >

                                View All Photos

                            </button>

                        </div>

                    ) : (

                        /* =================================
                            GALLERY GRID
                        ================================= */

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {filteredItems.map(
                                item => (

                                    <article
                                        key={item.id}
                                        className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                    >

                                        {/* IMAGE */}

                                        <div className="relative aspect-[4/3] overflow-hidden">

                                            <img
                                                src={
                                                    item.image_url
                                                }
                                                alt={
                                                    item.title
                                                }
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />


                                            {/* IMAGE OVERLAY */}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />


                                            {/* HOVER INFORMATION */}

                                            <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">

                                                {item.category && (

                                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">

                                                        {
                                                            item.category
                                                        }

                                                    </p>

                                                )}


                                                <h3 className="mt-1 text-lg font-bold text-white">

                                                    {
                                                        item.title
                                                    }

                                                </h3>

                                            </div>

                                        </div>


                                        {/* CARD INFO */}

                                        <div className="p-5">

                                            {item.category && (

                                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">

                                                    {
                                                        item.category
                                                    }

                                                </p>

                                            )}


                                            <h3 className="mt-2 text-lg font-bold">

                                                {
                                                    item.title
                                                }

                                            </h3>


                                            {item.description && (

                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">

                                                    {
                                                        item.description
                                                    }

                                                </p>

                                            )}

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </div>

            </section>


            {/* =================================
                SCHOOL LIFE CTA
            ================================= */}

            <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

                <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-blue-600 px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">

                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">

                        Experience Educore

                    </p>


                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">

                        There is more to school than the classroom.

                    </h2>


                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">

                        Discover an environment where children and young
                        people are encouraged to learn, explore, participate
                        and become confident individuals.

                    </p>


                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                        <Link
                            to="/website/admissions"
                            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition hover:opacity-90"
                        >

                            Apply Now

                        </Link>


                        <Link
                            to="/website/contact"
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