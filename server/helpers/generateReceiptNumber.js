const paymentModel = require("../models/paymentModel");

const generateReceiptNumber = async () => {

    const year = new Date().getFullYear();

    const nextNumber =
        await paymentModel.getNextReceiptSequence();

    return `RCP-${year}-${String(nextNumber).padStart(6,"0")}`;

};

const getNextReceiptSequence = async () => {

    const query = `

        SELECT COUNT(*) + 1 AS next_number

        FROM student_payments;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].next_number);

};

module.exports = {
    generateReceiptNumber,
    getNextReceiptSequence
}