import api from "./axios";

const publicSchoolParams = () => {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
    const hostname = window.location.hostname.toLowerCase();
    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;

    if (isEduProwSubdomain) return { schoolSlug: hostname.split(".")[0] };
    if (!isEduProwDomain && hostname !== "localhost" && hostname !== "127.0.0.1") return { schoolDomain: hostname };
    if (!firstSegment || firstSegment === "website") return {};
    return { schoolSlug: firstSegment };
};

export const getPublishedGallery = async () => {
    const response = await api.get("/website/gallery", { params: publicSchoolParams() });
    return response.data.data;
};

export const getAllGallery = async () => {
    const response = await api.get("/website/admin/gallery");
    return response.data.data;
};

export const getGalleryById = async (id) => {
    const response = await api.get(`/website/admin/gallery/${id}`);
    return response.data.data;
};

export const createGallery = async (data) => {
    const response = await api.post("/website/admin/gallery", data);
    return response.data.data;
};

export const updateGallery = async (id, data) => {
    const response = await api.put(`/website/admin/gallery/${id}`, data);
    return response.data.data;
};

export const deleteGallery = async (id) => {
    const response = await api.delete(`/website/admin/gallery/${id}`);
    return response.data;
};
