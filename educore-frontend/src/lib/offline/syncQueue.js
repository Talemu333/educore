import {
    getAllRecords,
    getRecord,
    putRecord,
    deleteRecord
} from "./offlineDb";

const ATTENDANCE_TYPE = "attendance";

export async function enqueueAttendance(payload, schoolId) {
    const item = {
        type: ATTENDANCE_TYPE,
        schoolId: Number(schoolId),
        payload,
        status: "pending",
        createdAt: Date.now(),
        attempts: 0
    };

    return putRecord("syncQueue", item);
}

export async function getPendingSyncItems() {
    const records = await getAllRecords("syncQueue");

    return records
        .filter(item => item.status === "pending" && item.type === ATTENDANCE_TYPE)
        .sort((a, b) => a.createdAt - b.createdAt);
}

export async function markSyncItemComplete(id) {
    return deleteRecord("syncQueue", id);
}

export async function markSyncItemPending(item, errorMessage = "") {
    return putRecord("syncQueue", {
        ...item,
        status: "pending",
        attempts: Number(item.attempts || 0) + 1,
        lastError: errorMessage || null,
        lastAttemptAt: Date.now()
    });
}

export async function getPendingSyncCount() {
    const items = await getPendingSyncItems();
    return items.length;
}

export async function getSyncItem(id) {
    return getRecord("syncQueue", id);
}
