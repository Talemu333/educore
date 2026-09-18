const DB_NAME = "eduprow-offline";
const DB_VERSION = 1;

const STORES = {
    auth: { keyPath: "key" },
    syncQueue: { keyPath: "id", autoIncrement: true },
    attendanceStudents: { keyPath: "key" },
    attendanceByDate: { keyPath: "key" }
};

let dbPromise = null;

function openDatabase() {
    if (typeof indexedDB === "undefined") {
        return Promise.reject(new Error("IndexedDB is not available in this browser."));
    }

    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            Object.entries(STORES).forEach(([name, options]) => {
                if (!db.objectStoreNames.contains(name)) {
                    db.createObjectStore(name, options);
                }
            });

            const transaction = request.transaction;

            const syncQueue = transaction.objectStore("syncQueue");
            if (!syncQueue.indexNames.contains("status")) {
                syncQueue.createIndex("status", "status", { unique: false });
            }
            if (!syncQueue.indexNames.contains("type")) {
                syncQueue.createIndex("type", "type", { unique: false });
            }
            if (!syncQueue.indexNames.contains("schoolId")) {
                syncQueue.createIndex("schoolId", "schoolId", { unique: false });
            }

            const attendanceStudents = transaction.objectStore("attendanceStudents");
            if (!attendanceStudents.indexNames.contains("schoolId")) {
                attendanceStudents.createIndex("schoolId", "schoolId", { unique: false });
            }

            const attendanceByDate = transaction.objectStore("attendanceByDate");
            if (!attendanceByDate.indexNames.contains("schoolId")) {
                attendanceByDate.createIndex("schoolId", "schoolId", { unique: false });
            }
        };

        request.onsuccess = () => {
            const db = request.result;

            db.onversionchange = () => {
                db.close();
            };

            resolve(db);
        };

        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };
    });

    return dbPromise;
}

export async function putRecord(storeName, value) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        transaction.objectStore(storeName).put(value);

        transaction.oncomplete = () => resolve(value);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
    });
}

export async function getRecord(storeName, key) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const request = db
            .transaction(storeName, "readonly")
            .objectStore(storeName)
            .get(key);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllRecords(storeName) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const request = db
            .transaction(storeName, "readonly")
            .objectStore(storeName)
            .getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteRecord(storeName, key) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        transaction.objectStore(storeName).delete(key);

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
    });
}

export async function clearStore(storeName) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        transaction.objectStore(storeName).clear();

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
    });
}

export async function getRecordsByIndex(storeName, indexName, value) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const request = db
            .transaction(storeName, "readonly")
            .objectStore(storeName)
            .index(indexName)
            .getAll(value);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteRecordsByIndex(storeName, indexName, value) {
    const records = await getRecordsByIndex(storeName, indexName, value);

    if (!records.length) return 0;

    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        records.forEach((record) => {
            store.delete(record.key ?? record.id);
        });

        transaction.oncomplete = () => resolve(records.length);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
    });
}

export { DB_NAME, DB_VERSION, STORES };
