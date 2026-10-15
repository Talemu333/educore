import api from "./axios";

export const getAnnouncements = async (params = {}) => (await api.get("/announcements", { params })).data.data;
export const getAnnouncementTargets = async () => (await api.get("/announcements/targets")).data.data;
export const createAnnouncement = async (data) => (await api.post("/announcements", data)).data.data;
export const updateAnnouncement = async (id, data) => (await api.put(`/announcements/${id}`, data)).data.data;
export const deactivateAnnouncement = async (id) => (await api.patch(`/announcements/${id}/deactivate`)).data.data;
export const setAnnouncementPinned = async (id, is_pinned) => (await api.patch(`/announcements/${id}/pin`, { is_pinned })).data.data;
export const markAnnouncementRead = async (id) => (await api.post(`/announcements/${id}/read`)).data.data;