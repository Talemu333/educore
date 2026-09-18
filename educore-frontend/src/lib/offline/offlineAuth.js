import { getRecord, putRecord, deleteRecord } from "./offlineDb";

const AUTH_KEY = "current-user";

export async function saveOfflineUser(user) {
    if (!user) return;

    await putRecord("auth", {
        key: AUTH_KEY,
        user: {
            id: user.id,
            school_id: user.school_id,
            role_name: user.role_name,
            admin_type: user.admin_type,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            must_change_password: user.must_change_password
        },
        savedAt: Date.now()
    });
}

export async function getOfflineUser() {
    const record = await getRecord("auth", AUTH_KEY);
    return record?.user || null;
}

export async function clearOfflineUser() {
    await deleteRecord("auth", AUTH_KEY);
}
