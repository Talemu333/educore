import {
    Link
} from "react-router-dom";


import {
    usePublishedEvents
} from "@/hooks/useWebsite";


function Events() {

    const {
        data: events = [],
        isLoading,
        isError
    } = usePublishedEvents();


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
                        Loading events...
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
                    min-h-[70vh]
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
                        Unable to load events
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
                            Educore Events
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
                            Events & Activities
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
                            Discover upcoming school events,
                            academic activities, celebrations and
                            important moments happening within our
                            school community.
                        </p>

                    </div>

                </div>

            </section>


            {/* ==================================================
                EVENTS
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
                            School Calendar
                        </p>


                        <h2
                            className="
                                mt-2
                                text-3xl
                                font-bold
                                sm:text-4xl
                            "
                        >
                            Upcoming Events
                        </h2>

                    </div>


                    {events.length === 0 ? (

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

                            <div className="text-4xl">
                                📅
                            </div>


                            <h3
                                className="
                                    mt-5
                                    text-xl
                                    font-bold
                                "
                            >
                                No upcoming events
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
                                events. Please check back later for
                                upcoming school activities.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="
                                grid
                                gap-7
                                md:grid-cols-2
                                lg:grid-cols-3
                            "
                        >

                            {events.map(
                                event => {

                                    const eventDate =
                                        new Date(
                                            event.event_date
                                        );


                                    const formattedDate =
                                        eventDate.toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric"
                                            }
                                        );


                                    const formattedYear =
                                        eventDate.toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric"
                                            }
                                        );


                                    return (

                                        <article
                                            key={event.id}
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
                                                    bg-slate-100
                                                "
                                            >

                                                {event.image_url ? (

                                                    <img
                                                        src={
                                                            event.image_url
                                                        }
                                                        alt={
                                                            event.title
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

                                                ) : (

                                                    <div
                                                        className="
                                                            flex
                                                            h-full
                                                            items-center
                                                            justify-center
                                                            text-5xl
                                                        "
                                                    >
                                                        📅
                                                    </div>

                                                )}


                                                {/* DATE BADGE */}

                                                <div
                                                    className="
                                                        absolute
                                                        left-4
                                                        top-4
                                                        overflow-hidden
                                                        rounded-xl
                                                        bg-white
                                                        text-center
                                                        shadow-lg
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            bg-blue-600
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-bold
                                                            uppercase
                                                            text-white
                                                        "
                                                    >
                                                        {eventDate.toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short"
                                                            }
                                                        )}
                                                    </div>


                                                    <div
                                                        className="
                                                            px-3
                                                            py-2
                                                            text-xl
                                                            font-extrabold
                                                            text-slate-900
                                                        "
                                                    >
                                                        {
                                                            eventDate.getDate()
                                                        }
                                                    </div>

                                                </div>

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
                                                    {formattedDate},{" "}
                                                    {formattedYear}
                                                </p>


                                                <h3
                                                    className="
                                                        mt-2
                                                        text-xl
                                                        font-bold
                                                        leading-snug
                                                    "
                                                >
                                                    {event.title}
                                                </h3>


                                                {event.description && (

                                                    <p
                                                        className="
                                                            mt-3
                                                            line-clamp-3
                                                            text-sm
                                                            leading-6
                                                            text-slate-600
                                                        "
                                                    >
                                                        {
                                                            event.description
                                                        }
                                                    </p>

                                                )}


                                                {event.venue && (

                                                    <p
                                                        className="
                                                            mt-4
                                                            text-sm
                                                            text-slate-500
                                                        "
                                                    >
                                                        📍{" "}
                                                        {event.venue}
                                                    </p>

                                                )}


                                                <Link
                                                    to={
                                                        `/website/events/${event.slug}`
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
                                                    View Event

                                                    <span className="ml-1">
                                                        →
                                                    </span>

                                                </Link>

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>

            </section>


            {/* ==================================================
                CTA
            ================================================== */}

            <section
                className="
                    px-4
                    pb-16
                    sm:px-6
                    sm:pb-20
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
                        Be part of our school community
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
                        Stay connected with Educore and never miss
                        important school activities, celebrations
                        and events.
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


export default Events;