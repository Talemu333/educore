import api from "./axios";

const publicSchoolParams = () => {
    const firstSegment =
        window.location.pathname
            .split("/")
            .filter(Boolean)[0] || "";

    // Legacy /website/* routes are resolved by hostname.
    // School-specific routes use the first URL segment as the school slug.
    if (!firstSegment || firstSegment === "website") {
        return {};
    }

    return {
        schoolSlug: firstSegment
    };
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
