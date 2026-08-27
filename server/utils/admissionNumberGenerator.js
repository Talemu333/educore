const generateAdmissionNumber = async (client, schoolId) => {
    const year = new Date().getFullYear();

    const schoolResult = await client.query(`
        SELECT admission_prefix
        FROM school_settings
        WHERE school_id = $1
        LIMIT 1
    `, [schoolId]);

    if (schoolResult.rows.length === 0) {
        const error = new Error("School settings not found.");
        error.statusCode = 404;
        throw error;
    }

    const prefix = schoolResult.rows[0].admission_prefix;

    const sequenceResult = await client.query(`
        SELECT COALESCE(MAX(admission_sequence), 0) + 1 AS next_sequence
        FROM students
        WHERE school_id = $1
    `, [schoolId]);

    const sequence = Number(sequenceResult.rows[0].next_sequence);
    const formattedSequence = String(sequence).padStart(4, "0");

    return {
        admissionNumber: `${prefix}/${year}/${formattedSequence}`,
        admissionSequence: sequence
    };
};

module.exports = generateAdmissionNumber;