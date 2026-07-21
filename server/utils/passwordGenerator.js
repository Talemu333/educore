const crypto = require("crypto");

const generateTemporaryPassword = () => {

    return crypto.randomBytes(4).toString("hex");

};

module.exports = generateTemporaryPassword;