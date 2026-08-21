import {
    Link,
    useParams
} from "react-router-dom";


import {
    useEventBySlug
} from "@/hooks/useWebsite";


function EventDetails() {

    const {
        slug
    } = useParams();


    const {
        data: event,
        isLoading,
        isError
    } = useEventBySlug(slug);


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
                        Loading event...
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

    if (isError || !event) {

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
                        School Event
                    </p>


                    <h1
                        className="
                            mt-3
                            text-3xl
                            font-bold
                        "
                    >
                        Event Not Found
                    </h1>


                    <p
                        className="
                            mt-4
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        The event you are looking for could
                        not be found or is no longer available.
                    </p>


                    <Link
                        to="/website/events"
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
                        ← Back to Events
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

    const eventDate =
        event.event_date
            ? new Date(
                event.event_date
            )
            : null;


    const formattedDate =
        eventDate
            ? eventDate.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            )
            : "";


    /*
    =====================================
    TIME
    =====================================
    */

    const formatTime = (
        time
    ) => {

        if (!time) {
            return "";
        }


        const [
            hours,
            minutes
        ] = time.split(":");


        const date =
            new Date();


        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );


        return date.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    };


    const startTime =
        formatTime(
            event.start_time
        );


    const endTime =
        formatTime(
            event.end_time
        );


    const eventTime =
        startTime && endTime
            ? `${startTime} – ${endTime}`
            : startTime
                ? startTime
                : "";


    return (

        <article>


            {/* ==================================================
                HERO / EVENT HEADER
            ================================================== */}

            <section
                className="
                    relative
                    overflow-hidden
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
                        max-w-5xl
                    "
                >

                    <Link
                        to="/website/events"
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
                        ← Back to Events
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
                        Educore Event
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
                        {event.title}
                    </h1>


                    {event.description && (

                        <p
                            className="
                                mt-6
                                max-w-3xl
                                text-base
                                leading-7
                                text-slate-300
                                sm:text-lg
                                sm:leading-8
                            "
                        >
                            {event.description}
                        </p>

                    )}

                </div>

            </section>


            {/* ==================================================
                FEATURED IMAGE
            ================================================== */}

            {event.image_url && (

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
                            src={event.image_url}
                            alt={event.title}
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
                EVENT INFORMATION
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
                        max-w-5xl
                    "
                >

                    <div
                        className="
                            grid
                            gap-5
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        {/* DATE */}

                        {formattedDate && (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-6
                                    shadow-sm
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-xl
                                    "
                                >
                                    📅
                                </div>


                                <p
                                    className="
                                        mt-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Date
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        font-semibold
                                        leading-6
                                        text-slate-900
                                    "
                                >
                                    {formattedDate}
                                </p>

                            </div>

                        )}


                        {/* TIME */}

                        {eventTime && (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-6
                                    shadow-sm
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-green-50
                                        text-xl
                                    "
                                >
                                    🕐
                                </div>


                                <p
                                    className="
                                        mt-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Time
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        font-semibold
                                        leading-6
                                        text-slate-900
                                    "
                                >
                                    {eventTime}
                                </p>

                            </div>

                        )}


                        {/* VENUE */}

                        {event.venue && (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-6
                                    shadow-sm
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-yellow-50
                                        text-xl
                                    "
                                >
                                    📍
                                </div>


                                <p
                                    className="
                                        mt-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Venue
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        font-semibold
                                        leading-6
                                        text-slate-900
                                    "
                                >
                                    {event.venue}
                                </p>

                            </div>

                        )}


                        {/* ORGANIZER */}

                        {event.organizer && (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-6
                                    shadow-sm
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-purple-50
                                        text-xl
                                    "
                                >
                                    👥
                                </div>


                                <p
                                    className="
                                        mt-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Organizer
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        font-semibold
                                        leading-6
                                        text-slate-900
                                    "
                                >
                                    {event.organizer}
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </section>


            {/* ==================================================
                EVENT CONTENT
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
                        max-w-3xl
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
                        About This Event
                    </p>


                    <h2
                        className="
                            mt-2
                            text-3xl
                            font-bold
                            sm:text-4xl
                        "
                    >
                        Event Details
                    </h2>


                    {event.content ? (

                        <div
                            className="
                                mt-8
                                whitespace-pre-line
                                text-base
                                leading-8
                                text-slate-700
                                sm:text-lg
                                sm:leading-9
                            "
                        >
                            {event.content}
                        </div>

                    ) : event.description ? (

                        <div
                            className="
                                mt-8
                                whitespace-pre-line
                                text-base
                                leading-8
                                text-slate-700
                                sm:text-lg
                                sm:leading-9
                            "
                        >
                            {event.description}
                        </div>

                    ) : (

                        <p
                            className="
                                mt-8
                                text-slate-500
                            "
                        >
                            More information about this event
                            will be provided soon.
                        </p>

                    )}


                    {/* BACK TO EVENTS */}

                    <div className="mt-10">

                        <Link
                            to="/website/events"
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
                            ← Back to All Events
                        </Link>

                    </div>

                </div>

            </section>


        </article>

    );

}


export default EventDetails;