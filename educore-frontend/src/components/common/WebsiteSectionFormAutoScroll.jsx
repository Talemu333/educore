import { useEffect } from "react";

function WebsiteSectionFormAutoScroll() {
    useEffect(() => {
        const handleClick = event => {
            const button = event.target.closest("button");

            if (!button) {
                return;
            }

            const buttonText = button.textContent?.trim();

            const isAddSectionButton =
                buttonText === "+ Add Section";

            const isSectionEditButton =
                buttonText === "Edit" &&
                Array.from(
                    { length: 6 },
                    (_, index) => button.parentElement?.parentElement
                        ? Array.from({ length: index + 1 }).reduce(
                            element => element?.parentElement,
                            button
                        )
                        : null
                ).some(element =>
                    element?.textContent?.includes("Section key:")
                );

            if (!isAddSectionButton && !isSectionEditButton) {
                return;
            }

            window.setTimeout(() => {
                const headings = Array.from(
                    document.querySelectorAll("h2")
                );

                const formHeading = headings.find(heading => {
                    const text = heading.textContent?.trim();
                    return (
                        text === "Add New Section" ||
                        text === "Edit Section"
                    );
                });

                if (!formHeading) {
                    return;
                }

                const formContainer =
                    formHeading.closest("div.overflow-hidden");

                const target = formContainer || formHeading;

                const top =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    24;

                window.scrollTo({
                    top: Math.max(0, top),
                    behavior: "smooth"
                });
            }, 50);
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return null;
}

export default WebsiteSectionFormAutoScroll;
