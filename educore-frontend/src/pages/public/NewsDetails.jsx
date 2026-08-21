import {
    Link,
    useParams
} from "react-router-dom";


import {
    useNewsBySlug
} from "@/hooks/useWebsite";


function NewsDetails() {

    const {
        slug
    } = useParams();


    const {
        data: article,
        isLoading,
        isError
    } = useNewsBySlug(slug);


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
                    min-h-[70vh]
                    items-center
                    justify-center
                    px-4
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
                        Loading article...
                    </p>

                </div>

            </div>

        );

    }


    /*
    =====================================
    ERROR / NOT FOUND
    =====================================
    */

    if (isError || !article) {

        return (

            <div
                className="
                    flex
                    min-h-[70vh]
                    items-center
                    justify-center
                    px-4
                "
            >

                <div
                    className="
                        max-w-lg
                        text-center
                    "
                >

                    <p
                        className="
                            text-sm
                            font-bold
                            uppercase
                            tracking-wider
                            text-blue-600
                        "
                    >
                        News Article
                    </p>


                    <h1
                        className="
                            mt-3
                            text-3xl
                            font-bold
                        "
                    >
                        Article Not Found
                    </h1>


                    <p
                        className="
                            mt-4
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        The news article you are looking for
                        could not be found or is no longer
                        available.
                    </p>


                    <Link
                        to="/website/news"
                        className="
                            mt-7
                            inline-flex
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
                        ← Back to News
                    </Link>

                </div>

            </div>

        );

    }


    /*
    =====================================
    DATE
    =====================================
    */

    const formattedDate =
        article.published_at
            ? new Date(
                article.published_at
            ).toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            )
            : "";


    return (

        <article>


            {/* ==================================================
                HERO / ARTICLE HEADER
            ================================================== */}

            <section
                className="
                    bg-slate-950
                    px-4
                    py-16
                    text-white
                    sm:px-6
                    sm:py-20
                    lg:px-8
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-5xl
                    "
                >

                    <Link
                        to="/website/news"
                        className="
                            inline-flex
                            items-center
                            text-sm
                            font-medium
                            text-blue-400
                            transition
                            hover:text-blue-300
                        "
                    >
                        ← Back to News
                    </Link>


                    <p
                        className="
                            mt-8
                            text-sm
                            font-bold
                            uppercase
                            tracking-[0.2em]
                            text-blue-400
                        "
                    >
                        Educore News
                    </p>


                    <h1
                        className="
                            mt-4
                            max-w-4xl
                            text-4xl
                            font-extrabold
                            leading-tight
                            tracking-tight
                            sm:text-5xl
                            lg:text-6xl
                        "
                    >
                        {article.title}
                    </h1>


                    <div
                        className="
                            mt-6
                            flex
                            flex-wrap
                            items-center
                            gap-x-6
                            gap-y-2
                            text-sm
                            text-slate-400
                        "
                    >

                        {formattedDate && (

                            <span>
                                {formattedDate}
                            </span>

                        )}


                        {article.author && (

                            <span>
                                By {article.author}
                            </span>

                        )}

                    </div>

                </div>

            </section>


            {/* ==================================================
                FEATURED IMAGE
            ================================================== */}

            {article.image_url && (

                <section
                    className="
                        px-4
                        sm:px-6
                        lg:px-8
                    "
                >

                    <div
                        className="
                            mx-auto
                            -mt-8
                            max-w-6xl
                            overflow-hidden
                            rounded-3xl
                            bg-slate-100
                            shadow-2xl
                        "
                    >

                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="
                                max-h-[650px]
                                w-full
                                object-cover
                            "
                        />

                    </div>

                </section>

            )}


            {/* ==================================================
                ARTICLE CONTENT
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
                        max-w-3xl
                    "
                >

                    {/* EXCERPT */}

                    {article.excerpt && (

                        <p
                            className="
                                mb-10
                                border-l-4
                                border-blue-600
                                pl-5
                                text-lg
                                font-medium
                                leading-8
                                text-slate-600
                                sm:text-xl
                            "
                        >
                            {article.excerpt}
                        </p>

                    )}


                    {/* CONTENT */}

                    <div
                        className="
                            whitespace-pre-line
                            text-base
                            leading-8
                            text-slate-700
                            sm:text-lg
                            sm:leading-9
                        "
                    >
                        {article.content}
                    </div>


                    {/* AUTHOR */}

                    {article.author && (

                        <div
                            className="
                                mt-12
                                border-t
                                border-slate-200
                                pt-8
                            "
                        >

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Published by
                            </p>


                            <p
                                className="
                                    mt-1
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                {article.author}
                            </p>

                        </div>

                    )}


                    {/* BACK TO NEWS */}

                    <div className="mt-10">

                        <Link
                            to="/website/news"
                            className="
                                inline-flex
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
                            ← Back to All News
                        </Link>

                    </div>

                </div>

            </section>


        </article>

    );

}


export default NewsDetails;