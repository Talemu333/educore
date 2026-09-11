import api from "./axios";

export const getPartnerAdminOverview = async () => (await api.get("/partner-admin/overview")).data;
export const getPartnerAdminPartner = async (id) => (await api.get(`/partner-admin/partners/${id}`)).data;
export const setPartnerStatus = async (id, status) => (await api.patch(`/partner-admin/partners/${id}/status`, { status })).data;
export const setPartnerLeadStatus = async (id, status) => (await api.patch(`/partner-admin/leads/${id}/status`, { status })).data;
export const createPartnerCommission = async (payload) => (await api.post("/partner-admin/commissions", payload)).data;
export const setPartnerCommissionStatus = async (id, status) => (await api.patch(`/partner-admin/commissions/${id}/status`, { status })).data;
export const updatePartnerProgrammeSettings = async (payload) => (await api.patch("/partner-admin/settings", payload)).data;