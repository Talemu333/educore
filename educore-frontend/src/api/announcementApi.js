import api from "./axios";

export const getAnnouncements = async () => (await api.get("/announcements")).data.data || [];
export const getAnnouncementNotifications = async () => (await api.get("/announcements/notifications")).data.data || { announcements: [], unread_count: 0 };
export const markAnnouncementRead = async (id) => (await api.patch(`/announcements/${id}/read`)).data.data;
export const markAllAnnouncementsRead = async () => (await api.patch("/announcements/read-all")).data.data;
export const createAnnouncement = async (data) => (await api.post("/announcements", data)).data.data;
export const updateAnnouncement = async (id, data) => (await api.put(`/announcements/${id}`, data)).data.data;
export const deactivateAnnouncement = async (id) => (await api.patch(`/announcements/${id}/deactivate`)).data.data;
