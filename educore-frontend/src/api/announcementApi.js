import api from "./axios";

export const getAnnouncements = async (params = {}) => (await api.get("/announcements", { params })).data.data;
export const getAnnouncementTargets = async () => (await api.get("/announcements/targets")).data.data;
export const createAnnouncement = async (data) => (await api.post("/announcements", data)).data.data;
export const updateAnnouncement = async (id, data) => (await api.put(`/announcements/${id}`, data)).data.data;
export const deactivateAnnouncement = async (id) => (await api.patch(`/announcements/${id}/deactivate`)).data.data;
export const setAnnouncementPinned = async (id, is_pinned) => (await api.patch(`/announcements/${id}/pin`, { is_pinned })).data.data;
export const markAnnouncementRead = async (id) => (await api.post(`/announcements/${id}/read`)).data.data;
export const uploadAnnouncementAttachments = async (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    return (await api.post(`/announcements/${id}/attachments`, formData)).data.data || [];
};
export const deleteAnnouncementAttachment = async (announcementId, attachmentId) =>
    (await api.delete(`/announcements/${announcementId}/attachments/${attachmentId}`)).data.data;
export const downloadAnnouncementAttachment = async (announcementId, attachment) => {
    const response = await api.get(`/announcements/${announcementId}/attachments/${attachment.id}`, { responseType: "blob" });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = attachment.file_name || "announcement-attachment";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};
