import {
    Link
} from "react-router-dom";


import {
    usePublishedNews
} from "@/hooks/useWebsite";


function News() {


    const {
        data: newsItems = [],
        isLoading,
        isError
    } = usePublishedNews();


    /*
    =====================================
    FEATURED NEWS
    =====================================
    */

    const featuredNews =
        newsItems.length > 0
            ? newsItems[0]
            : null;


    /*
    =====================================
    LATEST NEWS
    =====================================
    */

    const latestNews =
        newsItems.filter(
            news =>
                !featuredNews ||
                news.id !== featuredNews.id
        );


    /*
    =====================================
    LOADING
    =====================================
    */

    if (isLoading) {

        return (

            <div
                className="
                    flex
                    min-h-[60vh]
                    items-center
                    justify-center
                "
            >

                <div className="text-center">

                    <div
                        className="
                            mx-auto
                            h-10
                            w-10
                            animate-spin
                            rounded-full
                            border-4
                            border-blue-200
                            border-t-blue-600
                        "
                    />

                    <p
                        className="
                            mt-4
                            text-sm
                            text-slate-500
                        "
                    >
                        Loading news...
                    </p>

                </div>

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

            <div
                className="
                    flex
                    min-h-[60vh]
                    items-center
                    justify-center
                    px-4
                "
            >

                <div className="text-center">

                    <h2
                        className="
                            text-2xl
                            font-bold
                        "
                    >
                        Unable to load news
                    </h2>


                    <p
                        className="
                            mt-3
                            text-slate-500
                        "
                    >
                        Please try again later.
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div>


            {/* ==================================================
                HERO
            ================================================== */}

            <section
                className="
                    relative
                    overflow-hidden
                    bg-slate-950
                    px-4
                    py-20
                    text-white
                    sm:px-6
                    sm:py-28
                    lg:px-8
                "
            >

                <div
                    className="
                        absolute
                        -right-32
                        -top-32
                        h-96
                        w-96
                        rounded-full
                        bg-blue-600/20
                    "
                />


                <div
                    className="
                        absolute
                        -bottom-40
                        -left-20
                        h-96
                        w-96
                        rounded-full
                        bg-blue-500/10
                    "
                />


                <div
                    className="
                        relative
                        mx-auto
                        max-w-7xl
                    "
                >

                    <div className="max-w-3xl">

                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-blue-400
                            "
                        >
                            Educore Updates
                        </p>


                        <h1
                            className="
                                mt-4
                                text-4xl
                                font-extrabold
                                tracking-tight
                                sm:text-5xl
                                lg:text-6xl
                            "
                        >
                            News & Announcements
                        </h1>


                        <p
                            className="
                                mt-6
                                text-base
                                leading-7
                                text-slate-300
                                sm:text-lg
                                sm:leading-8
                            "
                        >
                            Stay informed about what is happening
                            at Educore. Explore school news,
                            announcements, achievements and stories
                            from our school community.
                        </p>

                    </div>

                </div>

            </section>


            {/* ==================================================
                FEATURED NEWS
            ================================================== */}

            <section
                className="
                    px-4
                    py-16
                    sm:px-6
                    sm:py-20
                    lg:px-8
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-7xl
                    "
                >

                    <div className="mb-10">

                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-wider
                                text-blue-600
                            "
                        >
                            Featured
                        </p>


                        <h2
                            className="
                                mt-2
                                text-3xl
                                font-bold
                                sm:text-4xl
                            "
                        >
                            From Our School
                        </h2>

                    </div>


                    {featuredNews ? (

                        <article
                            className="
                                group
                                overflow-hidden
                                rounded-3xl
                                border
                                border-slate-200
                                bg-white
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    grid
                                    lg:grid-cols-2
                                "
                            >

                                {/* IMAGE */}

                                <div
                                    className="
                                        relative
                                        min-h-[280px]
                                        overflow-hidden
                                        sm:min-h-[360px]
                                        lg:min-h-[460px]
                                    "
                                >

                                    <img
                                        src={
                                            featuredNews.image_url
                                        }
                                        alt={
                                            featuredNews.title
                                        }
                                        className="
                                            absolute
                                            inset-0
                                            h-full
                                            w-full
                                            object-cover
                                            transition
                                            duration-700
                                            group-hover:scale-105
                                        "
                                    />


                                    <div
                                        className="
                                            absolute
                                            inset-0
                                            bg-gradient-to-t
                                            from-slate-950/50
                                            to-transparent
                                        "
                                    />

                                </div>


                                {/* CONTENT */}

                                <div
                                    className="
                                        flex
                                        flex-col
                                        justify-center
                                        px-6
                                        py-10
                                        sm:px-10
                                        lg:px-14
                                    "
                                >

                                    <p
                                        className="
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        {new Date(
                                            featuredNews.published_at
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            }
                                        )}
                                    </p>


                                    <h2
                                        className="
                                            mt-3
                                            text-3xl
                                            font-bold
                                            leading-tight
                                            tracking-tight
                                            sm:text-4xl
                                        "
                                    >
                                        {
                                            featuredNews.title
                                        }
                                    </h2>


                                    <p
                                        className="
                                            mt-5
                                            text-sm
                                            leading-7
                                            text-muted-foreground
                                            sm:text-base
                                        "
                                    >
                                        {
                                            featuredNews.excerpt
                                        }
                                    </p>


                                    <p
                                        className="
                                            mt-4
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        By {
                                            featuredNews.author
                                        }
                                    </p>


                                    <Link
                                        to={
                                            `/website/news/${featuredNews.slug}`
                                        }
                                        className="
                                            mt-7
                                            inline-flex
                                            w-fit
                                            items-center
                                            rounded-lg
                                            bg-blue-600
                                            px-5
                                            py-3
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-blue-700
                                        "
                                    >
                                        Read More

                                        <span className="ml-2">
                                            →
                                        </span>

                                    </Link>

                                </div>

                            </div>

                        </article>

                    ) : (

                        <div
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50
                                px-6
                                py-16
                                text-center
                            "
                        >

                            <h3
                                className="
                                    text-xl
                                    font-bold
                                "
                            >
                                No news available yet
                            </h3>


                            <p
                                className="
                                    mx-auto
                                    mt-3
                                    max-w-lg
                                    text-sm
                                    leading-6
                                    text-slate-500
                                "
                            >
                                There are currently no published
                                news articles. Please check back
                                later for updates from the school.
                            </p>

                        </div>

                    )}

                </div>

            </section>


            {/* ==================================================
                NEWS GRID
            ================================================== */}

            {latestNews.length > 0 && (

                <section
                    className="
                        px-4
                        py-16
                        sm:px-6
                        sm:py-20
                        lg:px-8
                    "
                >

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                        "
                    >

                        <div className="mb-10">

                            <p
                                className="
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-blue-600
                                "
                            >
                                Latest Updates
                            </p>


                            <h2
                                className="
                                    mt-2
                                    text-3xl
                                    font-bold
                                    sm:text-4xl
                                "
                            >
                                Latest News
                            </h2>

                        </div>


                        <div
                            className="
                                grid
                                gap-7
                                md:grid-cols-2
                                lg:grid-cols-3
                            "
                        >

                            {latestNews.map(
                                news => (

                                    <article
                                        key={
                                            news.id
                                        }
                                        className="
                                            group
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            shadow-sm
                                            transition
                                            duration-300
                                            hover:-translate-y-1
                                            hover:shadow-xl
                                        "
                                    >

                                        {/* IMAGE */}

                                        <div
                                            className="
                                                relative
                                                h-56
                                                overflow-hidden
                                            "
                                        >

                                            <img
                                                src={
                                                    news.image_url
                                                }
                                                alt={
                                                    news.title
                                                }
                                                className="
                                                    h-full
                                                    w-full
                                                    object-cover
                                                    transition
                                                    duration-500
                                                    group-hover:scale-105
                                                "
                                            />

                                        </div>


                                        {/* CONTENT */}

                                        <div className="p-6">

                                            <p
                                                className="
                                                    text-xs
                                                    font-medium
                                                    text-slate-500
                                                "
                                            >
                                                {new Date(
                                                    news.published_at
                                                ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric"
                                                    }
                                                )}
                                            </p>


                                            <h3
                                                className="
                                                    mt-2
                                                    text-xl
                                                    font-bold
                                                    leading-snug
                                                "
                                            >
                                                {
                                                    news.title
                                                }
                                            </h3>


                                            <p
                                                className="
                                                    mt-3
                                                    line-clamp-3
                                                    text-sm
                                                    leading-6
                                                    text-muted-foreground
                                                "
                                            >
                                                {
                                                    news.excerpt
                                                }
                                            </p>


                                            <p
                                                className="
                                                    mt-3
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                By {
                                                    news.author
                                                }
                                            </p>


                                            <Link
                                                to={
                                                    `/website/news/${news.slug}`
                                                }
                                                className="
                                                    mt-5
                                                    inline-flex
                                                    items-center
                                                    text-sm
                                                    font-semibold
                                                    text-blue-600
                                                    transition
                                                    hover:text-blue-700
                                                "
                                            >
                                                Read Article

                                                <span className="ml-1">
                                                    →
                                                </span>

                                            </Link>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    </div>

                </section>

            )}


            {/* ==================================================
                PARENT INFORMATION
            ================================================== */}

            <section
                className="
                    bg-slate-50
                    px-4
                    py-16
                    sm:px-6
                    sm:py-20
                    lg:px-8
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-7xl
                    "
                >

                    <div
                        className="
                            grid
                            gap-8
                            lg:grid-cols-3
                        "
                    >

                        {/* CARD 1 */}

                        <div
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-7
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                    text-xl
                                "
                            >
                                📢
                            </div>


                            <h3
                                className="
                                    mt-5
                                    text-lg
                                    font-bold
                                "
                            >
                                School Announcements
                            </h3>


                            <p
                                className="
                                    mt-3
                                    text-sm
                                    leading-6
                                    text-muted-foreground
                                "
                            >
                                Important information from the
                                school will be shared here to help
                                parents and students stay informed.
                            </p>

                        </div>


                        {/* CARD 2 */}

                        <div
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-7
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-green-50
                                    text-xl
                                "
                            >
                                📚
                            </div>


                            <h3
                                className="
                                    mt-5
                                    text-lg
                                    font-bold
                                "
                            >
                                Academic Updates
                            </h3>


                            <p
                                className="
                                    mt-3
                                    text-sm
                                    leading-6
                                    text-muted-foreground
                                "
                            >
                                Keep up with academic activities,
                                achievements, examinations and
                                other learning-related updates.
                            </p>

                        </div>


                        {/* CARD 3 */}

                        <div
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-7
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-yellow-50
                                    text-xl
                                "
                            >
                                🏆
                            </div>


                            <h3
                                className="
                                    mt-5
                                    text-lg
                                    font-bold
                                "
                            >
                                Student Achievements
                            </h3>


                            <p
                                className="
                                    mt-3
                                    text-sm
                                    leading-6
                                    text-muted-foreground
                                "
                            >
                                We celebrate the accomplishments,
                                talents and progress of our pupils
                                and students.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                CTA
            ================================================== */}

            <section
                className="
                    px-4
                    py-16
                    sm:px-6
                    sm:py-20
                    lg:px-8
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-7xl
                        overflow-hidden
                        rounded-3xl
                        bg-blue-600
                        px-6
                        py-12
                        text-center
                        text-white
                        shadow-xl
                        sm:px-12
                        sm:py-16
                    "
                >

                    <h2
                        className="
                            text-3xl
                            font-bold
                            sm:text-4xl
                        "
                    >
                        Stay connected with Educore
                    </h2>


                    <p
                        className="
                            mx-auto
                            mt-4
                            max-w-2xl
                            text-sm
                            leading-6
                            text-blue-100
                            sm:text-base
                        "
                    >
                        Have questions about an announcement,
                        event or school activity? Our team is
                        always happy to assist.
                    </p>


                    <Link
                        to="/website/contact"
                        className="
                            mt-7
                            inline-flex
                            rounded-lg
                            bg-white
                            px-6
                            py-3
                            font-semibold
                            text-blue-600
                            transition
                            hover:bg-blue-50
                        "
                    >
                        Contact the School
                    </Link>

                </div>

            </section>


        </div>

    );

}


export default News;