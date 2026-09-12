const { AsyncLocalStorage } = require("node:async_hooks");

const storage = new AsyncLocalStorage();

const runWithSchoolDatabase = (pool, callback) =>
    storage.run({ pool }, callback);

const getSchoolDatabaseFromContext = () => storage.getStore()?.pool || null;

module.exports = {
    runWithSchoolDatabase,
    getSchoolDatabaseFromContext,
};
