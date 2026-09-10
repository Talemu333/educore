import api from "./axios";

const publicParams = () => {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
    const hostname = window.location.hostname.toLowerCase();
    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;

    // The hostname is the tenant identity on wildcard/custom domains.
    // Using schoolDomain keeps website content and settings on the same
    // resolution path and avoids relying on a possibly stale/missing slug.
    if (isEduProwSubdomain) return { schoolDomain: hostname };
    if (!isEduProwDomain && hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.endsWith(".vercel.app")) {
        return { schoolDomain: hostname };
    }
    if (!firstSegment || firstSegment === "website") return {};
    return { schoolSlug: firstSegment };
};

export const getPublishedPages = async () => (await api.get("/website/pages", { params: publicParams() })).data.data;
export const getWebsitePage = async (slug) => (await api.get(`/website/pages/${slug}`, { params: publicParams() })).data.data;
export const getAllWebsitePages = async () => (await api.get("/website/admin/pages")).data.data;
export const updateWebsitePage = async (id, data) => (await api.put(`/website/pages/${id}`, data)).data.data;
export const getPageSections = async (pageId) => (await api.get(`/website/admin/pages/${pageId}/sections`)).data.data;
export const createWebsiteSection = async (pageId, data) => (await api.post(`/website/admin/pages/${pageId}/sections`, data)).data.data;
export const updateWebsiteSection = async (sectionId, data) => (await api.put(`/website/admin/sections/${sectionId}`, data)).data.data;
export const deleteWebsiteSection = async (sectionId) => (await api.delete(`/website/admin/sections/${sectionId}`)).data;
export const getNewsBySlug = async (slug) => (await api.get(`/website/news/${slug}`, { params: publicParams() })).data.data;
export const getAllNews = async () => (await api.get("/website/admin/news")).data.data;
export const createNews = async (data) => (await api.post("/website/admin/news", data)).data.data;
export const updateNews = async (id, data) => (await api.put(`/website/admin/news/${id}`, data)).data.data;
export const deleteNews = async (id) => (await api.delete(`/website/admin/news/${id}`)).data;
export const getPublishedNews = async () => (await api.get("/website/news", { params: publicParams() })).data.data;
export const getPublishedEvents = async () => (await api.get("/website/events", { params: publicParams() })).data.data;
export const getEventBySlug = async (slug) => (await api.get(`/website/events/${slug}`, { params: publicParams() })).data.data;
export const getAllEvents = async () => (await api.get("/website/admin/events")).data.data;
export const getEventById = async (id) => (await api.get(`/website/admin/events/${id}`, { params: publicParams() })).data.data;
export const createEvent = async (data) => (await api.post("/website/admin/events", data)).data.data;
export const updateEvent = async (id, data) => (await api.put(`/website/admin/events/${id}`, data)).data.data;
export const deleteEvent = async (id) => (await api.delete(`/website/admin/events/${id}`)).data;
