import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";


import {
    getPublishedPages,
    getWebsitePage,
    getAllWebsitePages,
    updateWebsitePage,

    getPageSections,
    createWebsiteSection,
    updateWebsiteSection,
    getPublishedNews,
    deleteWebsiteSection,

    getAllNews,
    getNewsBySlug,
    createNews,
    updateNews,
    deleteNews,

    getPublishedEvents,
    getEventBySlug,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from "@/api/websiteApi";

import {
    getPublishedGallery,
    getAllGallery,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery
} from "@/api/galleryApi";


/*
=====================================
PUBLIC TENANT IDENTIFIER
=====================================

For path-based school websites, the first
URL segment identifies the school.

For EduProw subdomains/custom domains, the
hostname identifies the school, so the path
can remain /, /about, /news, etc.
*/
const getPublicSchoolIdentifier = () => {
    const pathnameSegment =
        window.location.pathname
            .split("/")
            .filter(Boolean)[0] || "";

    const hostname =
        window.location.hostname.toLowerCase();

    const isEduProwDomain = [
        "eduprow.com",
        "www.eduprow.com"
    ].includes(hostname);

    const isEduProwSubdomain =
        hostname.endsWith(".eduprow.com") &&
        !isEduProwDomain;

    const isCustomSchoolDomain =
        !isEduProwDomain &&
        !isEduProwSubdomain &&
        !["localhost", "127.0.0.1"].includes(hostname) &&
        !hostname.endsWith(".vercel.app");

    if (isEduProwSubdomain || isCustomSchoolDomain) {
        return hostname;
    }

    if (!pathnameSegment || pathnameSegment === "website") {
        return "";
    }

    return pathnameSegment;
};


/*
=====================================
PUBLIC: GET ALL PUBLISHED PAGES
=====================================
*/

export function useWebsitePages() {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "website-pages",
            schoolIdentifier
        ],

        queryFn:
            getPublishedPages,

        enabled:
            !!schoolIdentifier

    });

}


/*
=====================================
PUBLIC: GET SINGLE WEBSITE PAGE
=====================================
*/

export function useWebsitePage(
    slug
) {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "website-page",
            schoolIdentifier,
            slug
        ],

        queryFn: () =>
            getWebsitePage(slug),

        enabled:
            !!slug && !!schoolIdentifier

    });

}


/*
=====================================
ADMIN: GET ALL WEBSITE PAGES
=====================================
*/

export function useAllWebsitePages() {

    return useQuery({

        queryKey: [
            "website-admin-pages"
        ],

        queryFn:
            getAllWebsitePages

    });

}


/*
=====================================
ADMIN: UPDATE WEBSITE PAGE
=====================================
*/

export function useUpdateWebsitePage() {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            ({ id, data }) =>
                updateWebsitePage(
                    id,
                    data
                ),


        onSuccess: (
            updatedPage
        ) => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-pages"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-page"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-pages"
                ]

            });

        }

    });

}

/*
=====================================
GET PAGE SECTIONS
=====================================
*/

export function usePageSections(
    pageId
) {

    return useQuery({

        queryKey: [
            "website-sections",
            pageId
        ],

        queryFn: () =>
            getPageSections(pageId),

        enabled:
            !!pageId

    });

}


/*
=====================================
CREATE SECTION
=====================================
*/

export function useCreateWebsiteSection() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ pageId, data }) =>
                createWebsiteSection(
                    pageId,
                    data
                ),

        onSuccess: (
            _data,
            variables
        ) => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-sections",
                    variables.pageId
                ]

            });

        }

    });

}


/*
=====================================
UPDATE SECTION
=====================================
*/

export function useUpdateWebsiteSection() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id, data, pageId }) =>
                updateWebsiteSection(
                    id,
                    data
                ),

        onSuccess: (
            _data,
            variables
        ) => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-sections",
                    variables.pageId
                ]

            });

        }

    });

}


/*
=====================================
DELETE SECTION
=====================================
*/

export function useDeleteWebsiteSection() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id }) =>
                deleteWebsiteSection(id),

        onSuccess: (
            _data,
            variables
        ) => {

            if (variables.pageId) {

                queryClient.invalidateQueries({

                    queryKey: [
                        "website-sections",
                        variables.pageId
                    ]

                });

            }

        }

    });

}

export function usePublishedNews() {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "website-news",
            schoolIdentifier
        ],

        queryFn:
            getPublishedNews,

        enabled:
            !!schoolIdentifier

    });

}

export function useNewsBySlug(slug) {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "website-news",
            schoolIdentifier,
            slug
        ],

        queryFn: () =>
            getNewsBySlug(slug),

        enabled:
            !!slug && !!schoolIdentifier

    });

}

export function useAllNews() {

    return useQuery({

        queryKey: [
            "website-admin-news"
        ],

        queryFn:
            getAllNews

    });

}


export function useCreateNews() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            createNews,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-news"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-news"
                ]

            });

        }

    });

}


export function useUpdateNews() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id, data }) =>
                updateNews(id, data),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-news"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-news"
                ]

            });

        }

    });

}

/*
=====================================
NEWS: GET PUBLISHED
=====================================
*/

export function useDeleteNews() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id }) =>
                deleteNews(id),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-news"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-news"
                ]

            });

        }

    });

}

/*
=========================================
EVENTS
=========================================
*/


/*
=========================================
PUBLIC: GET PUBLISHED EVENTS
=========================================
*/

export function usePublishedEvents() {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "website-events",
            schoolIdentifier
        ],

        queryFn:
            getPublishedEvents,

        enabled:
            !!schoolIdentifier

    });

}


/*
=========================================
PUBLIC: GET EVENT BY SLUG
=========================================
*/

export function useEventBySlug(
    slug
) {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "website-event",
            schoolIdentifier,
            slug
        ],

        queryFn: () =>
            getEventBySlug(slug),

        enabled:
            !!slug && !!schoolIdentifier

    });

}


/*
=========================================
ADMIN: GET ALL EVENTS
=========================================
*/

export function useAllEvents() {

    return useQuery({

        queryKey: [
            "website-admin-events"
        ],

        queryFn:
            getAllEvents

    });

}


/*
=========================================
ADMIN: GET EVENT BY ID
=========================================
*/

export function useEventById(
    id
) {

    return useQuery({

        queryKey: [
            "website-admin-event",
            id
        ],

        queryFn: () =>
            getEventById(id),

        enabled:
            !!id

    });

}


/*
=========================================
ADMIN: CREATE EVENT
=========================================
*/

export function useCreateEvent() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            createEvent,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-events"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-events"
                ]

            });

        }

    });

}


/*
=========================================
ADMIN: UPDATE EVENT
=========================================
*/

export function useUpdateEvent() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id, data }) =>
                updateEvent(
                    id,
                    data
                ),

        onSuccess: (
            updatedEvent
        ) => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-events"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-events"
                ]

            });

            if (
                updatedEvent?.slug
            ) {

                queryClient.invalidateQueries({

                    queryKey: [
                        "website-event"
                    ]

                });

            }

        }

    });

}


/*
=========================================
ADMIN: DELETE EVENT
=========================================
*/

export function useDeleteEvent() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id }) =>
                deleteEvent(
                    id
                ),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-events"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-events"
                ]

            });

        }

    });

}

/*
=====================================
GALLERY: GET PUBLISHED
=====================================
*/

export function usePublishedGallery() {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "website-gallery",
            schoolIdentifier
        ],

        queryFn:
            getPublishedGallery,

        enabled:
            !!schoolIdentifier

    });

}


/*
=====================================
GALLERY: ADMIN GET ALL
=====================================
*/

export function useAllGallery() {

    return useQuery({

        queryKey: [
            "website-admin-gallery"
        ],

        queryFn:
            getAllGallery

    });

}


/*
=====================================
GALLERY: GET ONE
=====================================
*/

export function useGalleryById(
    id
) {

    return useQuery({

        queryKey: [
            "website-admin-gallery-item",
            id
        ],

        queryFn: () =>
            getGalleryById(id),

        enabled:
            !!id

    });

}


/*
=====================================
GALLERY: CREATE
=====================================
*/

export function useCreateGallery() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ data }) =>
                createGallery(data),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-gallery"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-gallery"
                ]

            });

        }

    });

}


/*
=====================================
GALLERY: UPDATE
=====================================
*/

export function useUpdateGallery() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id, data }) =>
                updateGallery(
                    id,
                    data
                ),

        onSuccess: (
            updatedGallery
        ) => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-gallery"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-gallery"
                ]

            });

        }

    });

}


/*
=====================================
GALLERY: DELETE
=====================================
*/

export function useDeleteGallery() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id }) =>
                deleteGallery(id),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "website-admin-gallery"
                ]

            });

            queryClient.invalidateQueries({

                queryKey: [
                    "website-gallery"
                ]

            });

        }

    });

}
