const pool = require("../config/database");

const feeTypeInUse = async (feeTypeId, schoolId) => {
    const result = await pool.query(`
        SELECT 1 FROM fee_structures fs
        JOIN fee_types ft ON ft.id = fs.fee_type_id
        WHERE fs.fee_type_id = $1 AND ft.school_id = $2 LIMIT 1;
    `, [feeTypeId, schoolId]);
    return result.rowCount > 0;
};

const createFeeStructure = async (data, schoolId, client = pool) => {
    const result = await client.query(`
        INSERT INTO fee_structures (session_id, term_id, class_id, fee_type_id, amount, school_id)
        SELECT $1,$2,$3,$4,$5,$6
        WHERE EXISTS (SELECT 1 FROM academic_sessions s WHERE s.id=$1 AND s.school_id=$6)
          AND EXISTS (SELECT 1 FROM terms t WHERE t.id=$2 AND t.school_id=$6)
          AND EXISTS (SELECT 1 FROM classes c WHERE c.id=$3 AND c.school_id=$6)
          AND EXISTS (SELECT 1 FROM fee_types ft WHERE ft.id=$4 AND ft.school_id=$6)
        RETURNING *;
    `, [data.session_id,data.term_id,data.class_id,data.fee_type_id,data.amount,schoolId]);
    return result.rows[0];
};

const feeStructureExists = async (sessionId,termId,classId,feeTypeId,schoolId) => {
    const result = await pool.query(`
        SELECT 1 FROM fee_structures fs
        JOIN academic_sessions s ON s.id=fs.session_id
        JOIN terms t ON t.id=fs.term_id
        JOIN classes c ON c.id=fs.class_id
        JOIN fee_types ft ON ft.id=fs.fee_type_id
        WHERE fs.session_id=$1 AND fs.term_id=$2 AND fs.class_id=$3 AND fs.fee_type_id=$4
          AND fs.school_id=$5 AND s.school_id=$5 AND t.school_id=$5 AND c.school_id=$5 AND ft.school_id=$5 LIMIT 1;
    `, [sessionId,termId,classId,feeTypeId,schoolId]);
    return result.rowCount > 0;
};

const getFeeStructureById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT fs.* FROM fee_structures fs
        JOIN academic_sessions s ON s.id=fs.session_id
        JOIN terms t ON t.id=fs.term_id
        JOIN classes c ON c.id=fs.class_id
        JOIN fee_types ft ON ft.id=fs.fee_type_id
        WHERE fs.id=$1 AND fs.school_id=$2 AND s.school_id=$2 AND t.school_id=$2 AND c.school_id=$2 AND ft.school_id=$2;
    `, [id,schoolId]);
    return result.rows[0];
};

const getFeeStructures = async (schoolId) => {
    const result = await pool.query(`
        SELECT fs.id,fs.session_id,fs.term_id,fs.class_id,fs.fee_type_id,
               s.session_name,t.term_name,c.class_name,ft.fee_name,fs.amount
        FROM fee_structures fs
        JOIN academic_sessions s ON fs.session_id=s.id
        JOIN terms t ON fs.term_id=t.id
        JOIN classes c ON fs.class_id=c.id
        JOIN fee_types ft ON fs.fee_type_id=ft.id
        WHERE fs.school_id=$1 AND s.school_id=$1 AND t.school_id=$1 AND c.school_id=$1 AND ft.school_id=$1
        ORDER BY s.session_name,t.term_name,c.class_name,ft.fee_name;
    `, [schoolId]);
    return result.rows;
};

const updateFeeStructure = async (id,data,schoolId,client=pool) => {
    const result = await client.query(`
        UPDATE fee_structures fs SET amount=$2
        FROM academic_sessions s, terms t, classes c, fee_types ft
        WHERE fs.id=$1 AND s.id=fs.session_id AND t.id=fs.term_id AND c.id=fs.class_id AND ft.id=fs.fee_type_id
          AND fs.school_id=$3 AND s.school_id=$3 AND t.school_id=$3 AND c.school_id=$3 AND ft.school_id=$3
        RETURNING fs.*;
    `, [id,data.amount,schoolId]);
    return result.rows[0];
};

const getTotalFeesForClass = async (sessionId,termId,classId,schoolId) => {
    const result = await pool.query(`
        SELECT COALESCE(SUM(fs.amount),0) AS total
        FROM fee_structures fs
        JOIN academic_sessions s ON s.id=fs.session_id
        JOIN terms t ON t.id=fs.term_id
        JOIN classes c ON c.id=fs.class_id
        JOIN fee_types ft ON ft.id=fs.fee_type_id
        WHERE fs.session_id=$1 AND fs.term_id=$2 AND fs.class_id=$3
          AND fs.school_id=$4 AND s.school_id=$4 AND t.school_id=$4 AND c.school_id=$4 AND ft.school_id=$4;
    `, [sessionId,termId,classId,schoolId]);
    return Number(result.rows[0].total);
};

module.exports={feeTypeInUse,createFeeStructure,feeStructureExists,getFeeStructureById,getFeeStructures,updateFeeStructure,getTotalFeesForClass};
