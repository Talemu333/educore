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

export const getContactMessages = async () => {
    const response = await api.get(
        "/contact-messages/admin"
    );

    return response.data.data;
};

export const updateContactMessageStatus = async (
    id,
    status
) => {
    const response = await api.patch(
        `/contact-messages/admin/${id}/status`,
        { status }
    );

    return response.data.data;
};
