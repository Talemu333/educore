const DB_NAME = "eduprow-offline";
const DB_VERSION = 1;

let dbPromise;

function openDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains("auth")) {
                db.createObjectStore("auth", { keyPath: "key" });
            }

            if (!db.objectStoreNames.contains("attendance")) {
                const store = db.createObjectStore("attendance", { keyPath: "key" });
                store.createIndex("status", "status", { unique: false });
            }

            if (!db.objectStoreNames.contains("syncQueue")) {
                const store = db.createObjectStore("syncQueue", {
                    keyPath: "id",
                    autoIncrement: true,
                });
                store.createIndex("status", "status", { unique: false });
                store.createIndex("createdAt", "createdAt", { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

async function runTransaction(storeName, mode, operation) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        let result;

        try {
            result = operation(store);
        } catch (error) {
            reject(error);
            return;
        }

        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
    });
}

export async function putRecord(storeName, value) {
    return runTransaction(storeName, "readwrite", store => store.put(value));
}

export async function getRecord(storeName, key) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const request = transaction.objectStore(storeName).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllRecords(storeName) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const request = transaction.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteRecord(storeName, key) {
    return runTransaction(storeName, "readwrite", store => store.delete(key));
}
