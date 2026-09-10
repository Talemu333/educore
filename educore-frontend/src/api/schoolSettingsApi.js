import api from "./axios";

const publicSchoolParams = () => {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
    const hostname = window.location.hostname.toLowerCase();
    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;

    if (isEduProwSubdomain) return { schoolDomain: hostname };
    if (!isEduProwDomain && hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.endsWith(".vercel.app")) {
        return { schoolDomain: hostname };
    }
    if (!firstSegment || firstSegment === "website") return {};
    return { schoolSlug: firstSegment };
};

export const getSchoolSettings = async () => {
    const response = await api.get("/school-settings", {
        params: publicSchoolParams()
    });
    return response.data.data;
};

export const updateSchoolSettings = async (data) => {
    const response = await api.put("/school-settings", data);
    return response.data.data;
};
