import api from "./axios";

export const getAnnouncements = async () => (await api.get("/announcements")).data.data || [];
export const createAnnouncement = async (data) => (await api.post("/announcements", data)).data.data;
export const updateAnnouncement = async (id, data) => (await api.put(`/announcements/${id}`, data)).data.data;
export const deactivateAnnouncement = async (id) => (await api.patch(`/announcements/${id}/deactivate`)).data.data;
