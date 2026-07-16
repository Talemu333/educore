const pool = require("../config/database");

const generateAdmissionNumber = async () => {

    const year = new Date().getFullYear();

    // Get admission prefix
    const schoolResult = await pool.query(`
        SELECT admission_prefix
        FROM school_settings
        LIMIT 1
    `);

    const prefix = schoolResult.rows[0].admission_prefix;

    // Get next sequence
    const sequenceResult = await pool.query(`
        SELECT COALESCE(MAX(admission_sequence), 0) + 1 AS next_sequence
        FROM students
    `);

    const sequence = sequenceResult.rows[0].next_sequence;

    const formattedSequence = String(sequence).padStart(4, "0");

    return {
        admissionNumber: `${prefix}/${year}/${formattedSequence}`,
        admissionSequence: sequence
    };
};

module.exports = generateAdmissionNumber;