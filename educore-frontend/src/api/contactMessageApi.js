import api from "./axios";

const getPublicSchoolParams = () => {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
    const hostname = window.location.hostname.toLowerCase();
    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;

    if (isEduProwSubdomain) return { schoolSlug: hostname.split(".")[0] };
    if (!isEduProwDomain && hostname !== "localhost" && hostname !== "127.0.0.1") return { schoolDomain: hostname };
    if (!firstSegment || firstSegment === "website") return {};
    return { schoolSlug: firstSegment };
};

export const submitContactMessage = async (data) => {
    const response = await api.post("/contact-messages", data, {
        params: getPublicSchoolParams(),
    });
    return response.data;
};

export const getContactMessages = async () => {
    const response = await api.get("/contact-messages/admin");
    return response.data.data;
};

export const updateContactMessageStatus = async (id, status) => {
    const response = await api.patch(`/contact-messages/admin/${id}/status`, { status });
    return response.data.data;
};
