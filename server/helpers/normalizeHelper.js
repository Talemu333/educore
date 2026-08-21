const normalizeGender = (gender) => {

    if (!gender) return gender;

    return gender
        .trim()
        .toLowerCase()
        .replace(
            /^./,
            char => char.toUpperCase()
        );

};


module.exports = {
    normalizeGender
};