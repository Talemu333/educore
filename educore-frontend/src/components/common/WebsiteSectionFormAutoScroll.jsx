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

            let isSectionEditButton = false;

            if (buttonText === "Edit") {
                let element = button.parentElement;

                for (let level = 0; element && level < 6; level += 1) {
                    if (element.textContent?.includes("Section key:")) {
                        isSectionEditButton = true;
                        break;
                    }

                    element = element.parentElement;
                }
            }

            if (!isAddSectionButton && !isSectionEditButton) {
                return;
            }

            window.setTimeout(() => {
                const formHeading = Array.from(
                    document.querySelectorAll("h2")
                ).find(heading => {
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
