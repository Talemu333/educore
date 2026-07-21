const generateStaffNumber = (prefix, id) => {

    return `${prefix}/${String(id).padStart(6, "0")}`;

};

module.exports = generateStaffNumber;