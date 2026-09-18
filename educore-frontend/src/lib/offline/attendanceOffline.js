import api from "../../api/axios";
import { getRecord, putRecord } from "./offlineDb";
import {
    enqueueAttendance,
    getPendingSyncItems,
    markSyncItemComplete,
    markSyncItemPending
} from "./syncQueue";
import { getOfflineUser } from "./offlineAuth";

const makeKey = (parts) => parts.map(value => String(value ?? "null")).join(":");

const isNetworkFailure = (error) =>
    error?.isNetworkError ||
    !error?.response ||
    error?.response?.status === 0;

export async function cacheAttendanceStudents({ schoolId, sessionId, classId, armId, students }) {
    if (!schoolId || !sessionId || !classId || !Array.isArray(students)) return;

    await putRecord("attendanceStudents", {
        key: makeKey([schoolId, sessionId, classId, armId]),
        schoolId: Number(schoolId),
        sessionId,
        classId,
        armId: armId || null,
        students,
        savedAt: Date.now()
    });
}

export async function getCachedAttendanceStudents({ schoolId, sessionId, classId, armId }) {
    if (!schoolId || !sessionId || !classId) return null;

    const record = await getRecord(
        "attendanceStudents",
        makeKey([schoolId, sessionId, classId, armId])
    );

    return record?.students || null;
}

export async function cacheAttendanceByDate({ schoolId, classId, armId, attendanceDate, attendance }) {
    if (!schoolId || !classId || !attendanceDate || !Array.isArray(attendance)) return;

    await putRecord("attendanceByDate", {
        key: makeKey([schoolId, classId, armId, attendanceDate]),
        schoolId: Number(schoolId),
        classId,
        armId: armId || null,
        attendanceDate,
        attendance,
        savedAt: Date.now()
    });
}

export async function getCachedAttendanceByDate({ schoolId, classId, armId, attendanceDate }) {
    if (!schoolId || !classId || !attendanceDate) return null;

    const record = await getRecord(
        "attendanceByDate",
        makeKey([schoolId, classId, armId, attendanceDate])
    );

    return record?.attendance || null;
}

export async function saveAttendanceOfflineAware(data) {
    if (!navigator.onLine) {
        const user = await getOfflineUser();
        if (!user?.school_id) {
            throw new Error("Please sign in while online before using attendance offline.");
        }

        await enqueueAttendance(data, user.school_id);
        await cacheAttendanceByDate({
            schoolId: user.school_id,
            classId: data.class_id,
            armId: data.arm_id || null,
            attendanceDate: data.attendance_date,
            attendance: data.students || []
        }).catch(() => {});

        return {
            attendance_date: data.attendance_date,
            class: null,
            students_processed: Array.isArray(data.students) ? data.students.length : 0,
            attendance: data.students || [],
            offline: true,
            pending_sync: true
        };
    }

    try {
        const response = await api.post("/attendance", data);
        return response.data.data;
    } catch (error) {
        if (!isNetworkFailure(error)) throw error;

        const user = await getOfflineUser();
        if (!user?.school_id) throw error;

        await enqueueAttendance(data, user.school_id);
        await cacheAttendanceByDate({
            schoolId: user.school_id,
            classId: data.class_id,
            armId: data.arm_id || null,
            attendanceDate: data.attendance_date,
            attendance: data.students || []
        }).catch(() => {});

        return {
            attendance_date: data.attendance_date,
            class: null,
            students_processed: Array.isArray(data.students) ? data.students.length : 0,
            attendance: data.students || [],
            offline: true,
            pending_sync: true
        };
    }
}

let syncPromise = null;

export async function syncPendingAttendance() {
    if (syncPromise) return syncPromise;

    if (!navigator.onLine) {
        return { synced: 0, remaining: await getPendingSyncItems() };
    }

    syncPromise = (async () => {
        const user = await getOfflineUser();

        if (!user?.school_id) {
            return { synced: 0, remaining: await getPendingSyncItems() };
        }

        const items = await getPendingSyncItems();
        let synced = 0;

        for (const item of items) {
            if (Number(item.schoolId) !== Number(user.school_id)) continue;

            try {
                await api.post("/attendance", item.payload);
                await markSyncItemComplete(item.id);
                synced += 1;
            } catch (error) {
                await markSyncItemPending(
                    item,
                    error?.response?.data?.message ||
                    error?.userMessage ||
                    error.message ||
                    "Sync failed"
                );

                if (isNetworkFailure(error)) break;
            }
        }

        return {
            synced,
            remaining: await getPendingSyncItems()
        };
    })().finally(() => {
        syncPromise = null;
    });

    return syncPromise;
}

export function startAttendanceSync() {
    const sync = () => syncPendingAttendance().catch(() => {});

    window.addEventListener("online", sync);
    window.addEventListener("load", sync);

    return () => {
        window.removeEventListener("online", sync);
        window.removeEventListener("load", sync);
    };
}
