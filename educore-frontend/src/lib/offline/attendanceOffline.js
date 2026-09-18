import api from "../../api/axios";
import { getRecord, putRecord, getAllRecords, deleteRecord } from "./offlineDb";
import { getOfflineUser } from "./offlineAuth";

const ATTENDANCE_TYPE = "attendance";

const makeKey = (parts) =>
    parts.map((value) => String(value ?? "null")).join(":");

const isNetworkFailure = (error) =>
    error?.isNetworkError ||
    !error?.response ||
    error?.response?.status === 0;

export async function cacheAttendanceStudents({
    schoolId,
    sessionId,
    classId,
    armId,
    students
}) {
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

export async function getCachedAttendanceStudents({
    schoolId,
    sessionId,
    classId,
    armId
}) {
    if (!schoolId || !sessionId || !classId) return null;

    const record = await getRecord(
        "attendanceStudents",
        makeKey([schoolId, sessionId, classId, armId])
    );

    return record?.students || null;
}

export async function cacheAttendanceByDate({
    schoolId,
    sessionId,
    termId,
    classId,
    armId,
    attendanceDate,
    attendance
}) {
    if (!schoolId || !sessionId || !termId || !classId || !attendanceDate) return;

    await putRecord("attendanceByDate", {
        key: makeKey([
            schoolId,
            sessionId,
            termId,
            classId,
            armId,
            attendanceDate
        ]),
        schoolId: Number(schoolId),
        sessionId,
        termId,
        classId,
        armId: armId || null,
        attendanceDate,
        attendance: Array.isArray(attendance) ? attendance : [],
        savedAt: Date.now()
    });
}

export async function getCachedAttendanceByDate({
    schoolId,
    sessionId,
    termId,
    classId,
    armId,
    attendanceDate
}) {
    if (!schoolId || !sessionId || !termId || !classId || !attendanceDate) {
        return null;
    }

    const record = await getRecord(
        "attendanceByDate",
        makeKey([
            schoolId,
            sessionId,
            termId,
            classId,
            armId,
            attendanceDate
        ])
    );

    return record?.attendance ?? null;
}

export async function enqueueAttendance(payload, schoolId) {
    if (!schoolId) {
        throw new Error("School context is required for offline attendance.");
    }

    return putRecord("syncQueue", {
        type: ATTENDANCE_TYPE,
        schoolId: Number(schoolId),
        payload,
        status: "pending",
        createdAt: Date.now(),
        attempts: 0
    });
}

export async function getPendingAttendance() {
    const records = await getAllRecords("syncQueue");

    return records
        .filter(
            (item) =>
                item.type === ATTENDANCE_TYPE &&
                item.status === "pending"
        )
        .sort((a, b) => a.createdAt - b.createdAt);
}

async function markPending(item, errorMessage) {
    return putRecord("syncQueue", {
        ...item,
        status: "pending",
        attempts: Number(item.attempts || 0) + 1,
        lastError: errorMessage || null,
        lastAttemptAt: Date.now()
    });
}

export async function saveAttendanceOfflineAware(data) {
    const user = await getOfflineUser();

    if (!user?.school_id) {
        throw new Error(
            "Please sign in while online before using attendance offline."
        );
    }

    if (!navigator.onLine) {
        await enqueueAttendance(data, user.school_id);

        await cacheAttendanceByDate({
            schoolId: user.school_id,
            sessionId: data.session_id,
            termId: data.term_id,
            classId: data.class_id,
            armId: data.arm_id,
            attendanceDate: data.attendance_date,
            attendance: data.students || []
        });

        return {
            attendance_date: data.attendance_date,
            class: null,
            students_processed: Array.isArray(data.students)
                ? data.students.length
                : 0,
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

        await enqueueAttendance(data, user.school_id);

        await cacheAttendanceByDate({
            schoolId: user.school_id,
            sessionId: data.session_id,
            termId: data.term_id,
            classId: data.class_id,
            armId: data.arm_id,
            attendanceDate: data.attendance_date,
            attendance: data.students || []
        });

        return {
            attendance_date: data.attendance_date,
            class: null,
            students_processed: Array.isArray(data.students)
                ? data.students.length
                : 0,
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
        return { synced: 0, remaining: await getPendingAttendance() };
    }

    syncPromise = (async () => {
        const user = await getOfflineUser();

        if (!user?.school_id) {
            return { synced: 0, remaining: await getPendingAttendance() };
        }

        const items = await getPendingAttendance();
        let synced = 0;

        for (const item of items) {
            if (Number(item.schoolId) !== Number(user.school_id)) continue;

            try {
                await api.post("/attendance", item.payload);
                await deleteRecord("syncQueue", item.id);
                synced += 1;
            } catch (error) {
                await markPending(
                    item,
                    error?.response?.data?.message ||
                    error?.userMessage ||
                    error?.message ||
                    "Sync failed"
                );

                if (isNetworkFailure(error)) break;
            }
        }

        return {
            synced,
            remaining: await getPendingAttendance()
        };
    })().finally(() => {
        syncPromise = null;
    });

    return syncPromise;
}

export function startAttendanceSync() {
    const sync = () => {
        syncPendingAttendance().catch(() => {});
    };

    window.addEventListener("online", sync);
    window.addEventListener("load", sync);

    return () => {
        window.removeEventListener("online", sync);
        window.removeEventListener("load", sync);
    };
}
