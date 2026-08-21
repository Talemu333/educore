import api from "@/api/axios";

export const getClassBroadsheet = async ({
    classId,
    armId,
    sessionId,
    termId
}) => {

    const response = await api.get(
        "/results/broadsheet",
        {
            params: {
                classId,
                armId,
                sessionId,
                termId
            }
        }
    );

    return response.data.data;

};