import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loading from "@/components/common/Loading";

import {
    useAllWebsitePages,
    useUpdateWebsitePage,
    usePageSections,
    useCreateWebsiteSection,
    useUpdateWebsiteSection,
    useDeleteWebsiteSection,

    useAllNews,
    useCreateNews,
    useUpdateNews,
    useDeleteNews,

    useAllGallery,
    useCreateGallery,
    useUpdateGallery,
    useDeleteGallery,

    useAllEvents,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent
} from "@/hooks/useWebsite";


const PAGE_OPTIONS = [
    {
        slug: "home",
        label: "Home",
        path: "/website"
    },
    {
        slug: "about",
        label: "About",
        path: "/website/about"
    },
    {
        slug: "academics",
        label: "Academics",
        path: "/website/academics"
    },
    {
        slug: "admissions",
        label: "Admissions",
        path: "/website/admissions"
    },
    {
        slug: "contact",
        label: "Contact",
        path: "/website/contact"
    }
];


const NEWS_OPTION = {
    slug: "news",
    label: "News",
    path: "/website/news"
};


const GALLERY_OPTION = {
    slug: "gallery",
    label: "Gallery",
    path: "/website/gallery"
};

const EVENTS_OPTION = {
    slug: "events",
    label: "Events",
    path: "/website/events"
};


function WebsiteManagement() {

    /*
    =====================================
    SELECTED MANAGEMENT TAB
    =====================================
    */

    const [
        selectedManagementTab,
        setSelectedManagementTab
    ] = useState("page");


    /*
    =====================================
    SELECTED WEBSITE PAGE
    =====================================
    */

    const [
        selectedSlug,
        setSelectedSlug
    ] = useState("home");


    /*
    =====================================
    LOAD WEBSITE PAGES
    =====================================
    */

    const {
        data: pages = [],
        isLoading,
        isError
    } = useAllWebsitePages();


    /*
    =====================================
    LOAD PAGE SECTIONS
    =====================================
    */

    const selectedPage =
        pages.find(
            page =>
                page.page_slug === selectedSlug
        );


    const {
        data: sections = [],
        isLoading: isSectionsLoading
    } = usePageSections(
        selectedPage?.id
    );


    /*
    =====================================
    LOAD NEWS
    =====================================
    */

    const {
        data: news = [],
        isLoading: isNewsLoading,
        isError: isNewsError
    } = useAllNews();


    /*
    =====================================
    LOAD GALLERY
    =====================================
    */

    const {
        data: gallery = [],
        isLoading: isGalleryLoading
    } = useAllGallery();

    /*
=====================================
LOAD EVENTS
=====================================
*/

    const {
        data: events = [],
        isLoading: isEventsLoading,
        isError: isEventsError
    } = useAllEvents();


    /*
    =====================================
    PAGE MUTATION
    =====================================
    */

    const {
        mutate: updatePage,
        isPending: isSaving
    } = useUpdateWebsitePage();


    /*
    =====================================
    SECTION MUTATIONS
    =====================================
    */

    const {
        mutate: createSection,
        isPending: isCreatingSection
    } = useCreateWebsiteSection();


    const {
        mutate: updateSection,
        isPending: isUpdatingSection
    } = useUpdateWebsiteSection();


    const {
        mutate: deleteSection,
        isPending: isDeletingSection
    } = useDeleteWebsiteSection();


    /*
    =====================================
    NEWS MUTATIONS
    =====================================
    */

    const {
        mutate: createNews,
        isPending: isCreatingNews
    } = useCreateNews();


    const {
        mutate: updateNews,
        isPending: isUpdatingNews
    } = useUpdateNews();


    const {
        mutate: deleteNews,
        isPending: isDeletingNews
    } = useDeleteNews();


    /*
    =====================================
    GALLERY MUTATIONS
    =====================================
    */

    const {
        mutate: createGallery,
        isPending: isCreatingGallery
    } = useCreateGallery();


    const {
        mutate: updateGallery,
        isPending: isUpdatingGallery
    } = useUpdateGallery();


    const {
        mutate: deleteGallery,
        isPending: isDeletingGallery
    } = useDeleteGallery();

    /*
=====================================
EVENT MUTATIONS
=====================================
*/

    const {
        mutate: createEvent,
        isPending: isCreatingEvent
    } = useCreateEvent();


    const {
        mutate: updateEvent,
        isPending: isUpdatingEvent
    } = useUpdateEvent();


    const {
        mutate: deleteEvent,
        isPending: isDeletingEvent
    } = useDeleteEvent();


    /*
    =====================================
    PAGE FORM
    =====================================
    */

    const [
        formData,
        setFormData
    ] = useState({

        page_title: "",
        page_content: "",
        meta_title: "",
        meta_description: "",
        is_published: true

    });


    /*
    =====================================
    SECTION FORM
    =====================================
    */

    const [
        sectionForm,
        setSectionForm
    ] = useState({

        section_key: "",
        section_title: "",
        section_subtitle: "",
        section_content: "",
        image_url: "",
        button_text: "",
        button_url: "",
        display_order: 1,
        is_active: true

    });


    const [
        editingSectionId,
        setEditingSectionId
    ] = useState(null);


    const [
        showSectionForm,
        setShowSectionForm
    ] = useState(false);


    /*
    =====================================
    NEWS FORM
    =====================================
    */

    const [
        newsForm,
        setNewsForm
    ] = useState({

        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image_url: "",
        author: "",
        published_at: "",
        is_published: false

    });


    const [
        editingNewsId,
        setEditingNewsId
    ] = useState(null);


    const [
        showNewsForm,
        setShowNewsForm
    ] = useState(false);


    /*
    =====================================
    GALLERY FORM
    =====================================
    */

    const [
        galleryForm,
        setGalleryForm
    ] = useState({

        title: "",
        description: "",
        image_url: "",
        category: "",
        display_order: 1,
        is_published: true

    });


    const [
        editingGalleryId,
        setEditingGalleryId
    ] = useState(null);


    const [
        showGalleryForm,
        setShowGalleryForm
    ] = useState(false);

    /*
=====================================
EVENT FORM
=====================================
*/

    const [
        eventForm,
        setEventForm
    ] = useState({

        title: "",
        slug: "",
        description: "",
        content: "",
        image_url: "",
        event_date: "",
        event_time: "",
        venue: "",
        is_published: false

    });


    const [
        editingEventId,
        setEditingEventId
    ] = useState(null);


    const [
        showEventForm,
        setShowEventForm
    ] = useState(false);


    /*
    =====================================
    LOAD SELECTED PAGE INTO FORM
    =====================================
    */

    useEffect(() => {

        if (!selectedPage) {

            setFormData({

                page_title: "",
                page_content: "",
                meta_title: "",
                meta_description: "",
                is_published: true

            });

            return;

        }


        setFormData({

            page_title:
                selectedPage.page_title || "",

            page_content:
                selectedPage.page_content || "",

            meta_title:
                selectedPage.meta_title || "",

            meta_description:
                selectedPage.meta_description || "",

            is_published:
                selectedPage.is_published !== false

        });

    }, [selectedPage]);


    /*
    =====================================
    PAGE FORM CHANGE
    =====================================
    */

    const handleChange = event => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setFormData(previous => ({

            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };


    /*
    =====================================
    SECTION FORM CHANGE
    =====================================
    */

    const handleSectionChange = event => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setSectionForm(previous => ({

            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };


    /*
    =====================================
    NEWS FORM CHANGE
    =====================================
    */

    const handleNewsChange = event => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setNewsForm(previous => ({

            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };


    /*
    =====================================
    GALLERY FORM CHANGE
    =====================================
    */

    const handleGalleryChange = event => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setGalleryForm(previous => ({

            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };

    /*
=====================================
EVENT FORM CHANGE
=====================================
*/

    const handleEventChange = event => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setEventForm(previous => ({

            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };


    /*
    =====================================
    RESET SECTION FORM
    =====================================
    */

    const resetSectionForm = () => {

        setSectionForm({

            section_key: "",
            section_title: "",
            section_subtitle: "",
            section_content: "",
            image_url: "",
            button_text: "",
            button_url: "",
            display_order:
                sections.length + 1,
            is_active: true

        });


        setEditingSectionId(null);

        setShowSectionForm(false);

    };


    /*
    =====================================
    RESET NEWS FORM
    =====================================
    */

    const resetNewsForm = () => {

        setNewsForm({

            title: "",
            slug: "",
            excerpt: "",
            content: "",
            image_url: "",
            author: "",
            published_at: "",
            is_published: false

        });


        setEditingNewsId(null);

        setShowNewsForm(false);

    };


    /*
    =====================================
    RESET GALLERY FORM
    =====================================
    */

    const resetGalleryForm = () => {

        setGalleryForm({

            title: "",
            description: "",
            image_url: "",
            category: "",
            display_order:
                gallery.length + 1,
            is_published: true

        });


        setEditingGalleryId(null);

        setShowGalleryForm(false);

    };

    /*
=====================================
RESET EVENT FORM
=====================================
*/

    const resetEventForm = () => {

        setEventForm({

            title: "",
            slug: "",
            description: "",
            content: "",
            image_url: "",
            event_date: "",
            event_time: "",
            venue: "",
            is_published: false

        });


        setEditingEventId(null);

        setShowEventForm(false);

    };


    /*
    =====================================
    EDIT SECTION
    =====================================
    */

    const handleEditSection = section => {

        setSectionForm({

            section_key:
                section.section_key || "",

            section_title:
                section.section_title || "",

            section_subtitle:
                section.section_subtitle || "",

            section_content:
                section.section_content || "",

            image_url:
                section.image_url || "",

            button_text:
                section.button_text || "",

            button_url:
                section.button_url || "",

            display_order:
                section.display_order || 1,

            is_active:
                section.is_active !== false

        });


        setEditingSectionId(section.id);

        setShowSectionForm(true);

    };


    /*
    =====================================
    EDIT NEWS
    =====================================
    */

    const handleEditNews = article => {

        setNewsForm({

            title:
                article.title || "",

            slug:
                article.slug || "",

            excerpt:
                article.excerpt || "",

            content:
                article.content || "",

            image_url:
                article.image_url || "",

            author:
                article.author || "",

            published_at:
                article.published_at
                    ? article.published_at.slice(0, 16)
                    : "",

            is_published:
                article.is_published === true

        });


        setEditingNewsId(article.id);

        setShowNewsForm(true);

    };


    /*
    =====================================
    EDIT GALLERY
    =====================================
    */

    const handleEditGallery = item => {

        setGalleryForm({

            title:
                item.title || "",

            description:
                item.description || "",

            image_url:
                item.image_url || "",

            category:
                item.category || "",

            display_order:
                item.display_order || 1,

            is_published:
                item.is_published !== false

        });


        setEditingGalleryId(item.id);

        setShowGalleryForm(true);

    };

    /*
=====================================
EDIT EVENT
=====================================
*/

    const handleEditEvent = event => {

        setEventForm({

            title:
                event.title || "",

            slug:
                event.slug || "",

            description:
                event.description || "",

            content:
                event.content || "",

            image_url:
                event.image_url || "",

            event_date:
                event.event_date
                    ? event.event_date.slice(0, 10)
                    : "",

            event_time:
                event.event_time
                    ? event.event_time.slice(0, 5)
                    : "",

            venue:
                event.venue || "",

            is_published:
                event.is_published === true

        });


        setEditingEventId(event.id);

        setShowEventForm(true);

    };

    /*
=====================================
SAVE EVENT
=====================================
*/

    const handleSaveEvent = () => {

        if (!eventForm.title.trim()) {

            toast.error(
                "Event title is required."
            );

            return;

        }


        if (!eventForm.slug.trim()) {

            toast.error(
                "Event slug is required."
            );

            return;

        }


        if (!eventForm.event_date) {

            toast.error(
                "Event date is required."
            );

            return;

        }


        const data = {

            ...eventForm,

            event_time:
                eventForm.event_time || null

        };


        /*
        UPDATE
        */

        if (editingEventId) {

            updateEvent(

                {
                    id: editingEventId,
                    data
                },

                {

                    onSuccess: () => {

                        toast.success(
                            "Event updated successfully."
                        );

                        resetEventForm();

                    },

                    onError: error => {

                        toast.error(

                            error.response
                                ?.data
                                ?.message ||

                            "Failed to update event."

                        );

                    }

                }

            );

            return;

        }


        /*
        CREATE
        */

        createEvent(

            data,

            {

                onSuccess: () => {

                    toast.success(
                        "Event created successfully."
                    );

                    resetEventForm();

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to create event."

                    );

                }

            }

        );

    };


    /*
    =====================================
    SAVE PAGE
    =====================================
    */

    const handleSave = () => {

        if (!selectedPage) {

            toast.error(
                "Website page could not be found."
            );

            return;

        }


        if (!formData.page_title.trim()) {

            toast.error(
                "Page title is required."
            );

            return;

        }


        updatePage(

            {
                id: selectedPage.id,
                data: formData
            },

            {

                onSuccess: () => {

                    toast.success(
                        "Website page updated successfully."
                    );

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to update website page."

                    );

                }

            }

        );

    };


    /*
    =====================================
    SAVE SECTION
    =====================================
    */

    const handleSaveSection = () => {

        if (!selectedPage) {

            toast.error(
                "Please select a website page."
            );

            return;

        }


        if (!sectionForm.section_key.trim()) {

            toast.error(
                "Section key is required."
            );

            return;

        }


        if (!sectionForm.section_title.trim()) {

            toast.error(
                "Section title is required."
            );

            return;

        }


        const data = {

            ...sectionForm,

            display_order:
                Number(
                    sectionForm.display_order
                )

        };


        if (editingSectionId) {

            updateSection(

                {
                    id: editingSectionId,
                    pageId: selectedPage.id,
                    data
                },

                {

                    onSuccess: () => {

                        toast.success(
                            "Section updated successfully."
                        );

                        resetSectionForm();

                    },

                    onError: error => {

                        toast.error(

                            error.response
                                ?.data
                                ?.message ||

                            "Failed to update section."

                        );

                    }

                }

            );

            return;

        }


        createSection(

            {
                pageId: selectedPage.id,
                data
            },

            {

                onSuccess: () => {

                    toast.success(
                        "Section created successfully."
                    );

                    resetSectionForm();

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to create section."

                    );

                }

            }

        );

    };

    /*
=====================================
DELETE EVENT
=====================================
*/

    const handleDeleteEvent = event => {

        const confirmed =
            window.confirm(
                `Delete "${event.title}"?`
            );


        if (!confirmed) {
            return;
        }


        deleteEvent(

            {
                id: event.id
            },

            {

                onSuccess: () => {

                    toast.success(
                        "Event deleted successfully."
                    );

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to delete event."

                    );

                }

            }

        );

    };


    /*
    =====================================
    DELETE SECTION
    =====================================
    */

    const handleDeleteSection = section => {

        const confirmed =
            window.confirm(
                `Delete "${section.section_title}"?`
            );


        if (!confirmed) {
            return;
        }


        deleteSection(

            {
                id: section.id,
                pageId: selectedPage.id
            },

            {

                onSuccess: () => {

                    toast.success(
                        "Section deleted successfully."
                    );

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to delete section."

                    );

                }

            }

        );

    };


    /*
    =====================================
    SAVE NEWS
    =====================================
    */

    const handleSaveNews = () => {

        if (!newsForm.title.trim()) {

            toast.error(
                "News title is required."
            );

            return;

        }


        if (!newsForm.slug.trim()) {

            toast.error(
                "News slug is required."
            );

            return;

        }


        if (!newsForm.content.trim()) {

            toast.error(
                "News content is required."
            );

            return;

        }


        const data = {

            ...newsForm,

            published_at:
                newsForm.published_at
                    ? newsForm.published_at
                    : null

        };


        if (editingNewsId) {

            updateNews(

                {
                    id: editingNewsId,
                    data
                },

                {

                    onSuccess: () => {

                        toast.success(
                            "News article updated successfully."
                        );

                        resetNewsForm();

                    },

                    onError: error => {

                        toast.error(

                            error.response
                                ?.data
                                ?.message ||

                            "Failed to update news article."

                        );

                    }

                }

            );

            return;

        }


        createNews(

            data,

            {

                onSuccess: () => {

                    toast.success(
                        "News article created successfully."
                    );

                    resetNewsForm();

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to create news article."

                    );

                }

            }

        );

    };


    /*
    =====================================
    DELETE NEWS
    =====================================
    */

    const handleDeleteNews = article => {

        const confirmed =
            window.confirm(
                `Delete "${article.title}"?`
            );

        if (!confirmed) {
            return;
        }

        deleteNews(
            {
                id: article.id
            },
            {
                onSuccess: () => {

                    toast.success(
                        "News article deleted successfully."
                    );

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to delete news article."

                    );

                }
            }
        );

    };


    /*
    =====================================
    SAVE GALLERY
    =====================================
    */

    const handleSaveGallery = () => {

        if (!galleryForm.title.trim()) {

            toast.error(
                "Gallery title is required."
            );

            return;

        }


        if (!galleryForm.image_url.trim()) {

            toast.error(
                "Image URL is required."
            );

            return;

        }


        const data = {

            ...galleryForm,

            display_order:
                Number(
                    galleryForm.display_order
                )

        };


        /*
        UPDATE
        */

        if (editingGalleryId) {

            updateGallery(

                {
                    id: editingGalleryId,
                    data
                },

                {

                    onSuccess: () => {

                        toast.success(
                            "Gallery item updated successfully."
                        );

                        resetGalleryForm();

                    },

                    onError: error => {

                        toast.error(

                            error.response
                                ?.data
                                ?.message ||

                            "Failed to update gallery item."

                        );

                    }

                }

            );

            return;

        }


        /*
        CREATE
        */

        createGallery(

            {
                data
            },

            {

                onSuccess: () => {

                    toast.success(
                        "Gallery item created successfully."
                    );

                    resetGalleryForm();

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to create gallery item."

                    );

                }

            }

        );

    };


    /*
    =====================================
    DELETE GALLERY
    =====================================
    */

    const handleDeleteGallery = item => {

        const confirmed =
            window.confirm(
                `Delete "${item.title}"?`
            );


        if (!confirmed) {
            return;
        }


        deleteGallery(

            {
                id: item.id
            },

            {

                onSuccess: () => {

                    toast.success(
                        "Gallery item deleted successfully."
                    );

                },

                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to delete gallery item."

                    );

                }

            }

        );

    };


    /*
    =====================================
    PREVIEW PAGE
    =====================================
    */

    const handlePreview = () => {

        const pageOption =
            PAGE_OPTIONS.find(
                page =>
                    page.slug === selectedSlug
            );


        if (!pageOption) {
            return;
        }


        window.open(
            pageOption.path,
            "_blank",
            "noopener,noreferrer"
        );

    };


    /*
    =====================================
    PREVIEW NEWS
    =====================================
    */

    const handlePreviewNews = () => {

        window.open(
            NEWS_OPTION.path,
            "_blank",
            "noopener,noreferrer"
        );

    };


    /*
    =====================================
    PREVIEW GALLERY
    =====================================
    */

    const handlePreviewGallery = () => {

        window.open(
            GALLERY_OPTION.path,
            "_blank",
            "noopener,noreferrer"
        );

    };

    const handlePreviewEvent = () => {

        window.open(
            EVENTS_OPTION.path,
            "_blank",
            "noopener,noreferrer"
        );

    };


    /*
    =====================================
    LOADING
    =====================================
    */

    if (isLoading) {

        return (

            <Loading
                message="Loading website pages..."
            />

        );

    }


    /*
    =====================================
    ERROR
    =====================================
    */

    if (isError) {

        return (

            <div className="rounded-2xl border bg-background p-10 text-center shadow-sm">

                <h2 className="text-xl font-semibold">
                    Unable to load website pages
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Please refresh the page and try again.
                </p>

            </div>

        );

    }


    const selectedPageOption =
        PAGE_OPTIONS.find(
            page =>
                page.slug === selectedSlug
        );


    /*
    =====================================
    RENDER
    =====================================
    */

    return (

        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================= */}

            <div>

                <h1 className="text-2xl font-bold tracking-tight">
                    Website Management
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Manage the content displayed on your
                    school's public website.
                </p>

            </div>


            {/* =================================
                PAGE / NEWS / GALLERY SELECTOR
            ================================= */}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">

                {PAGE_OPTIONS.map(page => (

                    <button
                        key={page.slug}
                        type="button"
                        onClick={() => {

                            setSelectedManagementTab("page");

                            setSelectedSlug(page.slug);

                            setShowSectionForm(false);

                            setShowNewsForm(false);

                            setShowGalleryForm(false);

                        }}
                        className={`
                            rounded-xl
                            border
                            p-4
                            text-left
                            transition-all
                            duration-200

                            ${
                                selectedManagementTab === "page" &&
                                selectedSlug === page.slug

                                    ? "border-primary bg-primary text-primary-foreground shadow-lg"

                                    : "bg-background text-foreground hover:border-primary/50 hover:bg-muted/50 hover:shadow-md"
                            }
                        `}
                    >

                        <p className="font-semibold">
                            {page.label}
                        </p>

                        <p
                            className={`
                                mt-1
                                text-xs

                                ${
                                    selectedManagementTab === "page" &&
                                    selectedSlug === page.slug

                                        ? "text-white/70"

                                        : "text-muted-foreground"
                                }
                            `}
                        >
                            {page.path}
                        </p>

                    </button>

                ))}


                {/* NEWS */}

                <button
                    type="button"
                    onClick={() => {

                        setSelectedManagementTab("news");

                        setShowSectionForm(false);

                        setShowGalleryForm(false);

                    }}
                    className={`
                        rounded-xl
                        border
                        p-4
                        text-left
                        transition-all
                        duration-200

                        ${
                            selectedManagementTab === "news"

                                ? "border-primary bg-primary text-primary-foreground shadow-lg"

                                : "bg-background text-foreground hover:border-primary/50 hover:bg-muted/50 hover:shadow-md"
                        }
                    `}
                >

                    <p className="font-semibold">
                        News
                    </p>

                    <p
                        className={`
                            mt-1
                            text-xs

                            ${
                                selectedManagementTab === "news"

                                    ? "text-white/70"

                                    : "text-muted-foreground"
                            }
                        `}
                    >
                        {NEWS_OPTION.path}
                    </p>

                </button>


                {/* GALLERY */}

                <button
                    type="button"
                    onClick={() => {

                        setSelectedManagementTab("gallery");

                        setShowSectionForm(false);

                        setShowNewsForm(false);

                    }}
                    className={`
                        rounded-xl
                        border
                        p-4
                        text-left
                        transition-all
                        duration-200

                        ${
                            selectedManagementTab === "gallery"

                                ? "border-primary bg-primary text-primary-foreground shadow-lg"

                                : "bg-background text-foreground hover:border-primary/50 hover:bg-muted/50 hover:shadow-md"
                        }
                    `}
                >

                    <p className="font-semibold">
                        Gallery
                    </p>

                    <p
                        className={`
                            mt-1
                            text-xs

                            ${
                                selectedManagementTab === "gallery"

                                    ? "text-white/70"

                                    : "text-muted-foreground"
                            }
                        `}
                    >
                        {GALLERY_OPTION.path}
                    </p>

                </button>

                {/* EVENTS */}

                <button
                    type="button"
                    onClick={() => {

                        setSelectedManagementTab("events");

                        setShowSectionForm(false);

                        setShowNewsForm(false);

                        setShowGalleryForm(false);

                        setShowEventForm(false);

                    }}
                    className={`
                        rounded-xl
                        border
                        p-4
                        text-left
                        transition-all
                        duration-200

                        ${
                            selectedManagementTab === "events"

                                ? "border-primary bg-primary text-primary-foreground shadow-lg"

                                : "bg-background text-foreground hover:border-primary/50 hover:bg-muted/50 hover:shadow-md"
                        }
                    `}
                >

                    <p className="font-semibold">
                        Events
                    </p>

                    <p
                        className={`
                            mt-1
                            text-xs

                            ${
                                selectedManagementTab === "events"

                                    ? "text-white/70"

                                    : "text-muted-foreground"
                            }
                        `}
                    >
                        {EVENTS_OPTION.path}
                    </p>

                </button>

            </div>


            {/* =====================================================
                PAGE MANAGEMENT
            ===================================================== */}

            {selectedManagementTab === "page" && (

                <>

                    {/* PAGE EDITOR */}

                    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                        <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold">

                                        Edit{" "}
                                        {selectedPageOption?.label}
                                        {" "}Page

                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">

                                        Changes made here will appear on
                                        the public website.

                                    </p>

                                </div>


                                {selectedPage?.is_published ? (

                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                        Published
                                    </span>

                                ) : (

                                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                        Draft
                                    </span>

                                )}

                            </div>

                        </div>


                        <div className="space-y-6 p-5 sm:p-6">

                            {/* PAGE TITLE */}

                            <div>

                                <label
                                    htmlFor="page_title"
                                    className="text-sm font-medium"
                                >
                                    Page Title
                                </label>

                                <input
                                    id="page_title"
                                    type="text"
                                    name="page_title"
                                    value={formData.page_title}
                                    onChange={handleChange}
                                    className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter page title"
                                />

                            </div>


                            {/* PAGE CONTENT */}

                            <div>

                                <label
                                    htmlFor="page_content"
                                    className="text-sm font-medium"
                                >
                                    Page Content
                                </label>

                                <textarea
                                    id="page_content"
                                    name="page_content"
                                    value={formData.page_content}
                                    onChange={handleChange}
                                    rows={10}
                                    className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter the main content for this page..."
                                />

                            </div>


                            {/* META TITLE */}

                            <div>

                                <label
                                    htmlFor="meta_title"
                                    className="text-sm font-medium"
                                >
                                    Meta Title
                                </label>

                                <input
                                    id="meta_title"
                                    type="text"
                                    name="meta_title"
                                    value={formData.meta_title}
                                    onChange={handleChange}
                                    maxLength={60}
                                    className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter SEO title"
                                />

                                <p className="mt-2 text-xs text-muted-foreground">
                                    Recommended: keep this around 50–60 characters.
                                </p>

                            </div>


                            {/* META DESCRIPTION */}

                            <div>

                                <label
                                    htmlFor="meta_description"
                                    className="text-sm font-medium"
                                >
                                    Meta Description
                                </label>

                                <textarea
                                    id="meta_description"
                                    name="meta_description"
                                    value={formData.meta_description}
                                    onChange={handleChange}
                                    maxLength={160}
                                    rows={4}
                                    className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="Describe this page for search engines..."
                                />

                                <p className="mt-2 text-xs text-muted-foreground">
                                    Recommended: keep this around 150–160 characters.
                                </p>

                            </div>


                            {/* PUBLISH */}

                            <div className="rounded-xl border bg-muted/20 p-4">

                                <div className="flex items-start gap-3">

                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleChange}
                                        className="mt-1 h-4 w-4 accent-primary"
                                    />

                                    <div>

                                        <label
                                            htmlFor="is_published"
                                            className="text-sm font-medium"
                                        >
                                            Publish page
                                        </label>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            When disabled, this page will not be available
                                            on the public website.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    disabled={!selectedPage}
                                    className="rounded-lg border px-5 py-3 font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Preview Page
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving || !selectedPage}
                                    className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : "Save Changes"
                                    }
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* PAGE SECTIONS */}

                    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                        <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold">
                                        Page Sections
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Build and manage the sections that appear on this page.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() => {

                                        setEditingSectionId(null);

                                        setSectionForm({

                                            section_key: "",
                                            section_title: "",
                                            section_subtitle: "",
                                            section_content: "",
                                            image_url: "",
                                            button_text: "",
                                            button_url: "",
                                            display_order:
                                                sections.length + 1,
                                            is_active: true

                                        });

                                        setShowSectionForm(true);

                                    }}
                                    disabled={!selectedPage}
                                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    + Add Section
                                </button>

                            </div>

                        </div>


                        <div className="p-5 sm:p-6">

                            {isSectionsLoading ? (

                                <Loading message="Loading sections..." />

                            ) : sections.length === 0 ? (

                                <div className="rounded-xl border border-dashed p-10 text-center">

                                    <h3 className="font-semibold">
                                        No sections yet
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Add your first section to start building this page.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {sections.map(section => (

                                        <div
                                            key={section.id}
                                            className="rounded-xl border p-4 transition hover:shadow-sm sm:p-5"
                                        >

                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="font-semibold">
                                                            {section.section_title}
                                                        </h3>

                                                        {section.is_active ? (

                                                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                                Active
                                                            </span>

                                                        ) : (

                                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                                Hidden
                                                            </span>

                                                        )}

                                                    </div>

                                                    {section.section_subtitle && (

                                                        <p className="mt-1 text-sm font-medium text-primary">
                                                            {section.section_subtitle}
                                                        </p>

                                                    )}

                                                    {section.section_content && (

                                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                                            {section.section_content}
                                                        </p>

                                                    )}

                                                    <div className="mt-3 text-xs text-muted-foreground">

                                                        Section key:{" "}

                                                        <span className="font-medium">
                                                            {section.section_key}
                                                        </span>

                                                        {" • "}

                                                        Order:{" "}

                                                        {section.display_order}

                                                    </div>

                                                </div>


                                                <div className="flex shrink-0 gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditSection(section)
                                                        }
                                                        className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteSection(section)
                                                        }
                                                        disabled={isDeletingSection}
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* SECTION FORM */}

                    {showSectionForm && (

                        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                            <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                                <h2 className="text-lg font-semibold">

                                    {editingSectionId
                                        ? "Edit Section"
                                        : "Add New Section"
                                    }

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Configure how this section will appear on the public website.
                                </p>

                            </div>


                            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">

                                <div>

                                    <label className="text-sm font-medium">
                                        Section Key
                                    </label>

                                    <input
                                        type="text"
                                        name="section_key"
                                        value={sectionForm.section_key}
                                        onChange={handleSectionChange}
                                        placeholder="e.g. welcome"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Use a short unique identifier such as welcome, mission or facilities.
                                    </p>

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        Section Title
                                    </label>

                                    <input
                                        type="text"
                                        name="section_title"
                                        value={sectionForm.section_title}
                                        onChange={handleSectionChange}
                                        placeholder="Enter section title"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Subtitle
                                    </label>

                                    <input
                                        type="text"
                                        name="section_subtitle"
                                        value={sectionForm.section_subtitle}
                                        onChange={handleSectionChange}
                                        placeholder="Optional subtitle"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Section Content
                                    </label>

                                    <textarea
                                        name="section_content"
                                        value={sectionForm.section_content}
                                        onChange={handleSectionChange}
                                        rows={7}
                                        placeholder="Write the content for this section..."
                                        className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="image_url"
                                        value={sectionForm.image_url}
                                        onChange={handleSectionChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        Button Text
                                    </label>

                                    <input
                                        type="text"
                                        name="button_text"
                                        value={sectionForm.button_text}
                                        onChange={handleSectionChange}
                                        placeholder="e.g. Learn More"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        Button URL
                                    </label>

                                    <input
                                        type="text"
                                        name="button_url"
                                        value={sectionForm.button_url}
                                        onChange={handleSectionChange}
                                        placeholder="/website/about"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        Display Order
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        name="display_order"
                                        value={sectionForm.display_order}
                                        onChange={handleSectionChange}
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="flex items-center rounded-lg border p-4">

                                    <input
                                        type="checkbox"
                                        id="section_active"
                                        name="is_active"
                                        checked={sectionForm.is_active}
                                        onChange={handleSectionChange}
                                        className="h-4 w-4 accent-primary"
                                    />

                                    <label
                                        htmlFor="section_active"
                                        className="ml-3"
                                    >

                                        <span className="block text-sm font-medium">
                                            Active Section
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Show this section on the public website.
                                        </span>

                                    </label>

                                </div>


                                <div className="flex flex-col gap-3 border-t pt-5 sm:col-span-2 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={resetSectionForm}
                                        className="rounded-lg border px-5 py-3 font-semibold transition hover:bg-muted"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSaveSection}
                                        disabled={
                                            isCreatingSection ||
                                            isUpdatingSection
                                        }
                                        className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {isCreatingSection ||
                                        isUpdatingSection

                                            ? "Saving..."

                                            : editingSectionId
                                                ? "Update Section"
                                                : "Create Section"

                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                </>

            )}


            {/* =====================================================
                NEWS MANAGEMENT
            ===================================================== */}

            {selectedManagementTab === "news" && (

                <>

                    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                        <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold">
                                        News Management
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Create and manage news articles displayed on your school's website.
                                    </p>

                                </div>


                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        onClick={handlePreviewNews}
                                        className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                                    >
                                        Preview News
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setEditingNewsId(null);

                                            setNewsForm({

                                                title: "",
                                                slug: "",
                                                excerpt: "",
                                                content: "",
                                                image_url: "",
                                                author: "",
                                                published_at: "",
                                                is_published: false

                                            });

                                            setShowNewsForm(true);

                                        }}
                                        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                                    >
                                        + Add News
                                    </button>

                                </div>

                            </div>

                        </div>


                        <div className="p-5 sm:p-6">

                            {isNewsLoading ? (

                                <Loading message="Loading news articles..." />

                            ) : isNewsError ? (

                                <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">

                                    <h3 className="font-semibold text-red-700">
                                        Unable to load news articles
                                    </h3>

                                    <p className="mt-2 text-sm text-red-600">
                                        Please refresh the page and try again.
                                    </p>

                                </div>

                            ) : news.length === 0 ? (

                                <div className="rounded-xl border border-dashed p-10 text-center">

                                    <h3 className="font-semibold">
                                        No news articles yet
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Create your first news article to display it on the website.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setShowNewsForm(true)}
                                        className="mt-5 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
                                    >
                                        Create First News Article
                                    </button>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {news.map(article => (

                                        <div
                                            key={article.id}
                                            className="rounded-xl border p-4 transition hover:shadow-sm sm:p-5"
                                        >

                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                                <div className="flex min-w-0 gap-4">

                                                    {article.image_url ? (

                                                        <img
                                                            src={article.image_url}
                                                            alt={article.title}
                                                            className="h-24 w-32 shrink-0 rounded-lg object-cover"
                                                        />

                                                    ) : (

                                                        <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                                            No Image
                                                        </div>

                                                    )}


                                                    <div className="min-w-0">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <h3 className="font-semibold">
                                                                {article.title}
                                                            </h3>

                                                            {article.is_published ? (

                                                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                                    Published
                                                                </span>

                                                            ) : (

                                                                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                                                                    Draft
                                                                </span>

                                                            )}

                                                        </div>


                                                        {article.excerpt && (

                                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                                {article.excerpt}
                                                            </p>

                                                        )}


                                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">

                                                            <span>
                                                                Slug:{" "}
                                                                <span className="font-medium">
                                                                    {article.slug}
                                                                </span>
                                                            </span>

                                                            {article.author && (

                                                                <span>
                                                                    Author:{" "}
                                                                    <span className="font-medium">
                                                                        {article.author}
                                                                    </span>
                                                                </span>

                                                            )}

                                                            {article.published_at && (

                                                                <span>
                                                                    Published:{" "}
                                                                    <span className="font-medium">
                                                                        {new Date(
                                                                            article.published_at
                                                                        ).toLocaleDateString()}
                                                                    </span>
                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>


                                                <div className="flex shrink-0 gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditNews(article)
                                                        }
                                                        className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteNews(article)
                                                        }
                                                        disabled={isDeletingNews}
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* NEWS FORM */}

                    {showNewsForm && (

                        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                            <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                                <h2 className="text-lg font-semibold">

                                    {editingNewsId
                                        ? "Edit News Article"
                                        : "Add News Article"
                                    }

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create or update a news article for the school website.
                                </p>

                            </div>


                            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">

                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        News Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={newsForm.title}
                                        onChange={handleNewsChange}
                                        placeholder="Enter news title"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        Slug
                                    </label>

                                    <input
                                        type="text"
                                        name="slug"
                                        value={newsForm.slug}
                                        onChange={handleNewsChange}
                                        placeholder="e.g. school-wins-award"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Use lowercase words separated by hyphens.
                                    </p>

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        Author
                                    </label>

                                    <input
                                        type="text"
                                        name="author"
                                        value={newsForm.author}
                                        onChange={handleNewsChange}
                                        placeholder="Enter author name"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Excerpt
                                    </label>

                                    <textarea
                                        name="excerpt"
                                        value={newsForm.excerpt}
                                        onChange={handleNewsChange}
                                        rows={4}
                                        placeholder="Short summary of the news article..."
                                        className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        News Content
                                    </label>

                                    <textarea
                                        name="content"
                                        value={newsForm.content}
                                        onChange={handleNewsChange}
                                        rows={12}
                                        placeholder="Write the complete news article..."
                                        className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="image_url"
                                        value={newsForm.image_url}
                                        onChange={handleNewsChange}
                                        placeholder="https://example.com/news-image.jpg"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        Published Date
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="published_at"
                                        value={newsForm.published_at}
                                        onChange={handleNewsChange}
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                <div className="flex items-center rounded-lg border p-4">

                                    <input
                                        type="checkbox"
                                        id="news_is_published"
                                        name="is_published"
                                        checked={newsForm.is_published}
                                        onChange={handleNewsChange}
                                        className="h-4 w-4 accent-primary"
                                    />

                                    <label
                                        htmlFor="news_is_published"
                                        className="ml-3"
                                    >

                                        <span className="block text-sm font-medium">
                                            Publish Article
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Make this news article visible on the public website.
                                        </span>

                                    </label>

                                </div>


                                <div className="flex flex-col gap-3 border-t pt-5 sm:col-span-2 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={resetNewsForm}
                                        className="rounded-lg border px-5 py-3 font-semibold transition hover:bg-muted"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSaveNews}
                                        disabled={
                                            isCreatingNews ||
                                            isUpdatingNews
                                        }
                                        className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {isCreatingNews ||
                                        isUpdatingNews

                                            ? "Saving..."

                                            : editingNewsId
                                                ? "Update News"
                                                : "Create News"

                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                </>

            )}


            {/* =====================================================
                GALLERY MANAGEMENT
            ===================================================== */}

            {selectedManagementTab === "gallery" && (

                <>

                    {/* GALLERY HEADER */}

                    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                        <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold">
                                        Gallery Management
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add and manage images displayed in your school's website gallery.
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={handlePreviewGallery}
                                        className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                                    >
                                        Preview Gallery
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() => {

                                            setEditingGalleryId(null);

                                            setGalleryForm({

                                                title: "",
                                                description: "",
                                                image_url: "",
                                                category: "",
                                                display_order:
                                                    gallery.length + 1,
                                                is_published: true

                                            });

                                            setShowGalleryForm(true);

                                        }}
                                        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                                    >
                                        + Add Gallery Image
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* =================================
                            GALLERY LIST
                        ================================= */}

                        <div className="p-5 sm:p-6">

                            {isGalleryLoading ? (

                                <Loading
                                    message="Loading gallery..."
                                />

                            ) : gallery.length === 0 ? (

                                <div className="rounded-xl border border-dashed p-10 text-center">

                                    <h3 className="font-semibold">
                                        No gallery images yet
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Add your first image to start building the website gallery.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setEditingGalleryId(null);

                                            setGalleryForm({

                                                title: "",
                                                description: "",
                                                image_url: "",
                                                category: "",
                                                display_order: 1,
                                                is_published: true

                                            });

                                            setShowGalleryForm(true);

                                        }}
                                        className="mt-5 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
                                    >
                                        Add First Gallery Image
                                    </button>

                                </div>

                            ) : (

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                    {gallery.map(item => (

                                        <div
                                            key={item.id}
                                            className="overflow-hidden rounded-xl border bg-background transition hover:shadow-md"
                                        >

                                            {/* IMAGE */}

                                            {item.image_url ? (

                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="h-52 w-full object-cover"
                                                />

                                            ) : (

                                                <div className="flex h-52 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                                                    No Image
                                                </div>

                                            )}


                                            {/* CONTENT */}

                                            <div className="space-y-3 p-4">

                                                <div className="flex items-start justify-between gap-2">

                                                    <h3 className="font-semibold">
                                                        {item.title}
                                                    </h3>


                                                    {item.is_published ? (

                                                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-[11px] font-medium text-green-700">
                                                            Published
                                                        </span>

                                                    ) : (

                                                        <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-medium text-yellow-700">
                                                            Draft
                                                        </span>

                                                    )}

                                                </div>


                                                {item.description && (

                                                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                                                        {item.description}
                                                    </p>

                                                )}


                                                {item.category && (

                                                    <div>

                                                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                            {item.category}
                                                        </span>

                                                    </div>

                                                )}


                                                <div className="text-xs text-muted-foreground">

                                                    Display order:{" "}

                                                    <span className="font-medium">
                                                        {item.display_order}
                                                    </span>

                                                </div>


                                                {/* ACTIONS */}

                                                <div className="flex gap-2 pt-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditGallery(item)
                                                        }
                                                        className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteGallery(item)
                                                        }
                                                        disabled={isDeletingGallery}
                                                        className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        GALLERY FORM
                    ================================================= */}

                    {showGalleryForm && (

                        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                            <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                                <h2 className="text-lg font-semibold">

                                    {editingGalleryId
                                        ? "Edit Gallery Image"
                                        : "Add Gallery Image"
                                    }

                                </h2>


                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add an image and configure how it should appear
                                    in the public website gallery.
                                </p>

                            </div>


                            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">

                                {/* TITLE */}

                                <div className="lg:col-span-2">

                                    <label
                                        htmlFor="gallery_title"
                                        className="text-sm font-medium"
                                    >
                                        Image Title
                                    </label>

                                    <input
                                        id="gallery_title"
                                        type="text"
                                        name="title"
                                        value={galleryForm.title}
                                        onChange={handleGalleryChange}
                                        placeholder="e.g. School Cultural Day"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Give the image a meaningful title.
                                    </p>

                                </div>


                                {/* DESCRIPTION */}

                                <div className="lg:col-span-2">

                                    <label
                                        htmlFor="gallery_description"
                                        className="text-sm font-medium"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="gallery_description"
                                        name="description"
                                        value={galleryForm.description}
                                        onChange={handleGalleryChange}
                                        rows={4}
                                        placeholder="Briefly describe what is shown in the image..."
                                        className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Optional description for the gallery image.
                                    </p>

                                </div>


                                {/* IMAGE URL */}

                                <div className="lg:col-span-2">

                                    <label
                                        htmlFor="gallery_image_url"
                                        className="text-sm font-medium"
                                    >
                                        Image URL
                                    </label>

                                    <input
                                        id="gallery_image_url"
                                        type="url"
                                        name="image_url"
                                        value={galleryForm.image_url}
                                        onChange={handleGalleryChange}
                                        placeholder="https://example.com/gallery-image.jpg"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Paste the URL of the image you want to display.
                                    </p>

                                </div>


                                {/* IMAGE PREVIEW */}

                                {galleryForm.image_url && (

                                    <div className="lg:col-span-2">

                                        <label className="text-sm font-medium">
                                            Image Preview
                                        </label>

                                        <div className="mt-2 overflow-hidden rounded-xl border bg-muted">

                                            <img
                                                src={galleryForm.image_url}
                                                alt={
                                                    galleryForm.title ||
                                                    "Gallery preview"
                                                }
                                                className="h-64 w-full object-cover"
                                                onError={event => {

                                                    event.currentTarget.style.display =
                                                        "none";

                                                }}
                                            />

                                        </div>

                                    </div>

                                )}


                                {/* CATEGORY */}

                                <div>

                                    <label
                                        htmlFor="gallery_category"
                                        className="text-sm font-medium"
                                    >
                                        Category
                                    </label>

                                    <input
                                        id="gallery_category"
                                        type="text"
                                        name="category"
                                        value={galleryForm.category}
                                        onChange={handleGalleryChange}
                                        placeholder="e.g. Events, Sports, Campus"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Optional category for grouping gallery images.
                                    </p>

                                </div>


                                {/* DISPLAY ORDER */}

                                <div>

                                    <label
                                        htmlFor="gallery_display_order"
                                        className="text-sm font-medium"
                                    >
                                        Display Order
                                    </label>

                                    <input
                                        id="gallery_display_order"
                                        type="number"
                                        min="1"
                                        name="display_order"
                                        value={galleryForm.display_order}
                                        onChange={handleGalleryChange}
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Lower numbers appear first.
                                    </p>

                                </div>


                                {/* PUBLISH */}

                                <div className="flex items-center rounded-lg border p-4 lg:col-span-2">

                                    <input
                                        type="checkbox"
                                        id="gallery_is_published"
                                        name="is_published"
                                        checked={galleryForm.is_published}
                                        onChange={handleGalleryChange}
                                        className="h-4 w-4 accent-primary"
                                    />

                                    <label
                                        htmlFor="gallery_is_published"
                                        className="ml-3"
                                    >

                                        <span className="block text-sm font-medium">
                                            Publish Image
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Make this image visible on the public website.
                                        </span>

                                    </label>

                                </div>


                                {/* ACTIONS */}

                                <div className="flex flex-col gap-3 border-t pt-5 lg:col-span-2 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={resetGalleryForm}
                                        className="rounded-lg border px-5 py-3 font-semibold transition hover:bg-muted"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleSaveGallery}
                                        disabled={
                                            isCreatingGallery ||
                                            isUpdatingGallery
                                        }
                                        className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {isCreatingGallery ||
                                        isUpdatingGallery

                                            ? "Saving..."

                                            : editingGalleryId
                                                ? "Update Gallery Image"
                                                : "Create Gallery Image"

                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                </>

            )}

            {/* =====================================================
    EVENTS MANAGEMENT
===================================================== */}

            {selectedManagementTab === "events" && (
                <>
                    {/* EVENTS HEADER */}
                    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                        <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold">
                                        Events Management
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Create and manage events displayed on your school's website.
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={handlePreviewEvent}
                                        className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                                    >
                                        Preview Events
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() => {

                                            setEditingEventId(null);

                                            setEventForm({
                                                title: "",
                                                slug: "",
                                                description: "",
                                                content: "",
                                                image_url: "",
                                                event_date: "",
                                                event_time: "",
                                                venue: "",
                                                is_published: false
                                            });

                                            setShowEventForm(true);

                                        }}
                                        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                                    >
                                        + Add Event
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* EVENTS LIST */}

                        <div className="p-5 sm:p-6">

                            {isEventsLoading ? (

                                <Loading message="Loading events..." />

                            ) : isEventsError ? (

                                <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">

                                    <h3 className="font-semibold text-red-700">
                                        Unable to load events
                                    </h3>

                                    <p className="mt-2 text-sm text-red-600">
                                        Please refresh the page and try again.
                                    </p>

                                </div>

                            ) : events.length === 0 ? (

                                <div className="rounded-xl border border-dashed p-10 text-center">

                                    <h3 className="font-semibold">
                                        No events yet
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Create your first event to display it on the website.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setEditingEventId(null);

                                            setEventForm({
                                                title: "",
                                                slug: "",
                                                description: "",
                                                content: "",
                                                image_url: "",
                                                event_date: "",
                                                event_time: "",
                                                venue: "",
                                                is_published: false
                                            });

                                            setShowEventForm(true);

                                        }}
                                        className="mt-5 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
                                    >
                                        Create First Event
                                    </button>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {events.map(event => (

                                        <div
                                            key={event.id}
                                            className="rounded-xl border p-4 transition hover:shadow-sm sm:p-5"
                                        >

                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                                {/* EVENT INFORMATION */}

                                                <div className="flex min-w-0 gap-4">

                                                    {event.image_url ? (

                                                        <img
                                                            src={event.image_url}
                                                            alt={event.title}
                                                            className="h-28 w-40 shrink-0 rounded-lg object-cover"
                                                        />

                                                    ) : (

                                                        <div className="flex h-28 w-40 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                                            No Image
                                                        </div>

                                                    )}


                                                    <div className="min-w-0">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <h3 className="font-semibold">
                                                                {event.title}
                                                            </h3>

                                                            {event.is_published ? (

                                                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                                    Published
                                                                </span>

                                                            ) : (

                                                                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                                                                    Draft
                                                                </span>

                                                            )}

                                                        </div>


                                                        {event.description && (

                                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                                {event.description}
                                                            </p>

                                                        )}


                                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">

                                                            <span>
                                                                Slug:{" "}
                                                                <span className="font-medium">
                                                                    {event.slug}
                                                                </span>
                                                            </span>


                                                            {event.event_date && (

                                                                <span>
                                                                    Date:{" "}
                                                                    <span className="font-medium">
                                                                        {new Date(
                                                                            event.event_date
                                                                        ).toLocaleDateString()}
                                                                    </span>
                                                                </span>

                                                            )}


                                                            {event.event_time && (

                                                                <span>
                                                                    Time:{" "}
                                                                    <span className="font-medium">
                                                                        {event.event_time}
                                                                    </span>
                                                                </span>

                                                            )}


                                                            {event.venue && (

                                                                <span>
                                                                    Venue:{" "}
                                                                    <span className="font-medium">
                                                                        {event.venue}
                                                                    </span>
                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>


                                                {/* ACTIONS */}

                                                <div className="flex shrink-0 gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditEvent(event)
                                                        }
                                                        className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteEvent(event)
                                                        }
                                                        disabled={isDeletingEvent}
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        EVENT FORM
                    ================================================= */}

                    {showEventForm && (

                        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

                            <div className="border-b bg-muted/30 px-5 py-5 sm:px-6">

                                <h2 className="text-lg font-semibold">

                                    {editingEventId
                                        ? "Edit Event"
                                        : "Add Event"
                                    }

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create or update an event for the school website.
                                </p>

                            </div>


                            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">

                                {/* TITLE */}

                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Event Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={eventForm.title}
                                        onChange={handleEventChange}
                                        placeholder="Enter event title"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                {/* SLUG */}

                                <div>

                                    <label className="text-sm font-medium">
                                        Slug
                                    </label>

                                    <input
                                        type="text"
                                        name="slug"
                                        value={eventForm.slug}
                                        onChange={handleEventChange}
                                        placeholder="e.g. 2026-graduation-ceremony"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Use lowercase words separated by hyphens.
                                    </p>

                                </div>


                                {/* VENUE */}

                                <div>

                                    <label className="text-sm font-medium">
                                        Venue
                                    </label>

                                    <input
                                        type="text"
                                        name="venue"
                                        value={eventForm.venue}
                                        onChange={handleEventChange}
                                        placeholder="e.g. School Auditorium"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                {/* EVENT DATE */}

                                <div>

                                    <label className="text-sm font-medium">
                                        Event Date
                                    </label>

                                    <input
                                        type="date"
                                        name="event_date"
                                        value={eventForm.event_date}
                                        onChange={handleEventChange}
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                {/* EVENT TIME */}

                                <div>

                                    <label className="text-sm font-medium">
                                        Event Time
                                    </label>

                                    <input
                                        type="time"
                                        name="event_time"
                                        value={eventForm.event_time}
                                        onChange={handleEventChange}
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Short Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={eventForm.description}
                                        onChange={handleEventChange}
                                        rows={4}
                                        placeholder="Briefly describe the event..."
                                        className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        This can be used as the event summary on the events listing page.
                                    </p>

                                </div>


                                {/* CONTENT */}

                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Event Content
                                    </label>

                                    <textarea
                                        name="content"
                                        value={eventForm.content}
                                        onChange={handleEventChange}
                                        rows={10}
                                        placeholder="Write the complete details of the event..."
                                        className="mt-2 w-full resize-y rounded-lg border bg-background px-4 py-3 leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                {/* IMAGE URL */}

                                <div className="lg:col-span-2">

                                    <label className="text-sm font-medium">
                                        Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="image_url"
                                        value={eventForm.image_url}
                                        onChange={handleEventChange}
                                        placeholder="https://example.com/event-image.jpg"
                                        className="mt-2 w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>


                                {/* IMAGE PREVIEW */}

                                {eventForm.image_url && (

                                    <div className="lg:col-span-2">

                                        <label className="text-sm font-medium">
                                            Image Preview
                                        </label>

                                        <div className="mt-2 overflow-hidden rounded-xl border bg-muted">

                                            <img
                                                src={eventForm.image_url}
                                                alt={
                                                    eventForm.title ||
                                                    "Event preview"
                                                }
                                                className="h-64 w-full object-cover"
                                                onError={event => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />

                                        </div>

                                    </div>

                                )}


                                {/* PUBLISH */}

                                <div className="flex items-center rounded-lg border p-4 lg:col-span-2">

                                    <input
                                        type="checkbox"
                                        id="event_is_published"
                                        name="is_published"
                                        checked={eventForm.is_published}
                                        onChange={handleEventChange}
                                        className="h-4 w-4 accent-primary"
                                    />

                                    <label
                                        htmlFor="event_is_published"
                                        className="ml-3"
                                    >

                                        <span className="block text-sm font-medium">
                                            Publish Event
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Make this event visible on the public website.
                                        </span>

                                    </label>

                                </div>


                                {/* ACTIONS */}

                                <div className="flex flex-col gap-3 border-t pt-5 lg:col-span-2 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={resetEventForm}
                                        className="rounded-lg border px-5 py-3 font-semibold transition hover:bg-muted"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleSaveEvent}
                                        disabled={
                                            isCreatingEvent ||
                                            isUpdatingEvent
                                        }
                                        className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {isCreatingEvent ||
                                        isUpdatingEvent

                                            ? "Saving..."

                                            : editingEventId
                                                ? "Update Event"
                                                : "Create Event"

                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                </>
            )}

        </div>

    );

}


export default WebsiteManagement;