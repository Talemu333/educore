import Loading from "@/components/common/Loading";

import {
    useWebsitePage,
    usePageSections
} from "@/hooks/useWebsite";


function WebsitePageRenderer({
    slug,
    renderSection
}) {

    /*
    =====================================
    LOAD PAGE
    =====================================
    */

    const {
        data: page,
        isLoading: isPageLoading,
        isError: isPageError
    } = useWebsitePage(slug);


    /*
    =====================================
    LOAD SECTIONS
    =====================================
    */

    const {
        data: sections = [],
        isLoading: isSectionsLoading,
        isError: isSectionsError
    } = usePageSections(
        page?.id
    );


    /*
    =====================================
    LOADING
    =====================================
    */

    if (
        isPageLoading ||
        isSectionsLoading
    ) {

        return (
            <Loading
                message="Loading page..."
            />
        );

    }


    /*
    =====================================
    ERROR
    =====================================
    */

    if (
        isPageError ||
        isSectionsError
    ) {

        return (
            <div className="py-20 text-center">

                <h2 className="text-xl font-semibold">
                    Unable to load this page
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Please try again later.
                </p>

            </div>
        );

    }


    /*
    =====================================
    PAGE NOT FOUND
    =====================================
    */

    if (!page) {

        return (
            <div className="py-20 text-center">

                <h2 className="text-xl font-semibold">
                    Page not found
                </h2>

            </div>
        );

    }


    /*
    =====================================
    PAGE NOT PUBLISHED
    =====================================
    */

    if (
        page.is_published === false
    ) {

        return (
            <div className="py-20 text-center">

                <h2 className="text-xl font-semibold">
                    Page unavailable
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    This page is currently unavailable.
                </p>

            </div>
        );

    }


    /*
    =====================================
    SORT ACTIVE SECTIONS
    =====================================
    */

    const activeSections =
        sections
            .filter(
                section =>
                    section.is_active !== false
            )
            .sort(
                (a, b) =>
                    a.display_order -
                    b.display_order
            );


    /*
    =====================================
    RENDER
    =====================================
    */

    return (

        <div>

            {renderSection
                ? activeSections.map(
                    section =>
                        renderSection(
                            section
                        )
                )
                : null}

        </div>

    );

}


export default WebsitePageRenderer;