import api from "./axios";

const getPublicSchoolSlug = () =>
    window.location.pathname
        .split("/")
        .filter(Boolean)[0] || "";

export const submitContactMessage = async (data) => {
    const schoolSlug = getPublicSchoolSlug();

    const response = await api.post(
        "/contact-messages",
        data,
        {
            params: {
                schoolSlug,
            },
        }
    );

    return response.data;
};
