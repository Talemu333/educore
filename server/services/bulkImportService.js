const bcrypt = require("bcrypt");
const XLSX = require("xlsx-republish");
const crypto = require("crypto");
const pool = require("../config/database");
const teacherModel = require("../models/teacherModel");
const parentModel = require("../models/parentModel");

const clean = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

const key = (value) => clean(value)
    .toLowerCase()
    .replace(/[\s\-\/]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");

const normalizeRows = (buffer) => {
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: false });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("The workbook does not contain a worksheet.");
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    return raw.map(row => Object.fromEntries(Object.entries(row).map(([k, v]) => [key(k), v])));
};

const dateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
    const text = clean(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
};

const boolValue = (value, fallback = false) => {
    const text = clean(value).toLowerCase();
    if (!text) return fallback;
    return ["true", "yes", "1", "y", "primary"].includes(text);
};

const required = (row, fields) => fields.filter(field => !clean(row[field]));

const findOne = async (client, table, column, value, schoolId, extra = "") => {
    const allowed = new Set(["classes", "arms", "states", "nationalities", "relationships", "qualifications", "departments", "subjects"]);
    if (!allowed.has(table)) throw new Error("Invalid lookup table.");
    const result = await client.query(`SELECT * FROM ${table} WHERE LOWER(TRIM(${column})) = LOWER(TRIM($1)) ${extra} LIMIT 1`, [value]);
    return result.rows[0];
};

const lookupClass = async (client, row, schoolId) => {
    if (clean(row.class_id)) {
        const result = await client.query("SELECT * FROM classes WHERE id = $1 AND school_id = $2", [Number(row.class_id), schoolId]);
        return result.rows[0];
    }
    if (!clean(row.class_name)) return null;
    const result = await client.query("SELECT * FROM classes WHERE LOWER(TRIM(class_name)) = LOWER(TRIM($1)) AND school_id = $2", [row.class_name, schoolId]);
    return result.rows[0];
};

const lookupArm = async (client, row, schoolId, classId) => {
    if (clean(row.arm_id)) {
        const result = await client.query("SELECT * FROM arms WHERE id = $1 AND class_id = $2 AND school_id = $3", [Number(row.arm_id), classId, schoolId]);
        return result.rows[0];
    }
    if (!clean(row.arm_name)) return null;
    const result = await client.query("SELECT * FROM arms WHERE LOWER(TRIM(arm_name)) = LOWER(TRIM($1)) AND class_id = $2 AND school_id = $3", [row.arm_name, classId, schoolId]);
    return result.rows[0];
};

const lookupAcademic = async (client, row, schoolId) => {
    const session = clean(row.session_id)
        ? (await client.query("SELECT * FROM academic_sessions WHERE id = $1 AND school_id = $2", [Number(row.session_id), schoolId])).rows[0]
        : (await client.query("SELECT * FROM academic_sessions WHERE LOWER(TRIM(session_name)) = LOWER(TRIM($1)) AND school_id = $2", [row.session_name, schoolId])).rows[0];
    if (!session) return { session: null, term: null };
    const term = clean(row.term_id)
        ? (await client.query("SELECT * FROM terms WHERE id = $1 AND school_id = $2 AND session_id = $3", [Number(row.term_id), schoolId, session.id])).rows[0]
        : (await client.query("SELECT * FROM terms WHERE LOWER(TRIM(term_name)) = LOWER(TRIM($1)) AND school_id = $2 AND session_id = $3", [row.term_name, schoolId, session.id])).rows[0];
    return { session, term };
};

const getRole = async (client, roleName) => {
    const result = await client.query("SELECT id FROM roles WHERE LOWER(role_name) = LOWER($1) LIMIT 1", [roleName]);
    return result.rows[0];
};

const uniqueUsername = async (client, requested, fallback, schoolId) => {
    let base = clean(requested) || fallback;
    base = base.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 45) || `user${Date.now()}`;
    let username = base;
    let counter = 1;
    while ((await client.query("SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) AND school_id = $2 LIMIT 1", [username, schoolId])).rowCount) {
        username = `${base.slice(0, 42)}${counter++}`;
    }
    return username;
};

const tempPassword = () => crypto.randomBytes(5).toString("hex");

const importStudents = async (client, rows, schoolId, result) => {
    let nextSequence = Number((await client.query("SELECT COALESCE(MAX(admission_sequence),0) AS value FROM students WHERE school_id = $1", [schoolId])).rows[0].value) + 1;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const missing = required(row, ["surname", "first_name", "gender", "date_of_birth", "admission_date"]);
            if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
            const cls = await lookupClass(client, row, schoolId);
            if (!cls) throw new Error("Class not found.");
            const arm = await lookupArm(client, row, schoolId, cls.id);
            if (!arm) throw new Error("Arm not found for the selected class.");
            const admissionNumber = clean(row.admission_number) || `IMP/${new Date().getFullYear()}/${String(nextSequence).padStart(4, "0")}`;
            const duplicate = await client.query("SELECT id FROM students WHERE school_id = $1 AND admission_number = $2", [schoolId, admissionNumber]);
            if (duplicate.rowCount) { result.skipped++; result.messages.push(`Row ${i + 2}: ${admissionNumber} already exists.`); continue; }
            const state = clean(row.state_id) ? (await client.query("SELECT id FROM states WHERE id = $1", [Number(row.state_id)])).rows[0] : (clean(row.state_name) ? await findOne(client, "states", "state_name", row.state_name) : null);
            const nationality = clean(row.nationality_id) ? (await client.query("SELECT id FROM nationalities WHERE id = $1", [Number(row.nationality_id)])).rows[0] : (clean(row.nationality_name) ? await findOne(client, "nationalities", "nationality_name", row.nationality_name) : null);
            await client.query(`INSERT INTO students (school_id, admission_number, admission_sequence, surname, first_name, middle_name, gender, date_of_birth, state_id, nationality_id, religion, blood_group, genotype, residential_address, class_id, arm_id, admission_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`, [schoolId, admissionNumber, Number(row.admission_sequence) || nextSequence++, clean(row.surname), clean(row.first_name), clean(row.middle_name) || null, clean(row.gender), dateValue(row.date_of_birth), state?.id || null, nationality?.id || null, clean(row.religion) || null, clean(row.blood_group) || null, clean(row.genotype) || null, clean(row.residential_address) || null, cls.id, arm.id, dateValue(row.admission_date), clean(row.status) || "Active"]);
            result.imported++;
        } catch (error) { result.failed++; result.errors.push({ row: i + 2, message: error.message }); }
    }
};

const importTeachers = async (client, rows, schoolId, result) => {
    const role = await getRole(client, "Teacher");
    if (!role) throw new Error("Teacher role is not configured.");
    const settings = (await client.query("SELECT teacher_prefix FROM school_settings WHERE school_id = $1 LIMIT 1", [schoolId])).rows[0];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const missing = required(row, ["surname", "first_name", "gender"]);
            if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
            if (clean(row.staff_number)) {
                const existing = await client.query("SELECT id FROM teachers WHERE school_id = $1 AND staff_number = $2", [schoolId, row.staff_number]);
                if (existing.rowCount) { result.skipped++; continue; }
            }
            const userId = (await client.query("SELECT nextval(pg_get_serial_sequence('users','id')) AS id")).rows[0].id;
            const username = await uniqueUsername(client, row.username, `${clean(row.first_name)}.${clean(row.surname)}`, schoolId);
            const password = clean(row.password) || tempPassword();
            const hashed = await bcrypt.hash(password, 10);
            await client.query("INSERT INTO users (id, username, email, password, role_id, school_id, must_change_password, is_active) VALUES ($1,$2,$3,$4,$5,$6,TRUE,TRUE)", [userId, username, clean(row.email) || null, hashed, role.id, schoolId]);
            const teacherId = await teacherModel.getNextTeacherId(client);
            const staffNumber = clean(row.staff_number) || `${settings?.teacher_prefix || "TCH"}/${String(teacherId).padStart(6, "0")}`;
            const qualification = clean(row.qualification_id) ? (await client.query("SELECT id FROM qualifications WHERE id = $1", [Number(row.qualification_id)])).rows[0] : (clean(row.qualification_name) ? await findOne(client, "qualifications", "qualification_name", row.qualification_name) : null);
            const department = clean(row.department_id) ? (await client.query("SELECT id FROM departments WHERE id = $1", [Number(row.department_id)])).rows[0] : (clean(row.department_name) ? await findOne(client, "departments", "department_name", row.department_name) : null);
            const state = clean(row.state_name) ? await findOne(client, "states", "state_name", row.state_name) : null;
            const nationality = clean(row.nationality_name) ? await findOne(client, "nationalities", "nationality_name", row.nationality_name) : null;
            await teacherModel.createTeacher(client, { id: teacherId, user_id: userId, staff_number: staffNumber, surname: clean(row.surname), first_name: clean(row.first_name), middle_name: clean(row.middle_name) || null, gender: clean(row.gender), date_of_birth: dateValue(row.date_of_birth), phone_number: clean(row.phone_number) || null, email: clean(row.email) || null, address: clean(row.address) || null, marital_status: clean(row.marital_status) || null, qualification_id: qualification?.id || null, department_id: department?.id || null, employment_date: dateValue(row.employment_date), state_id: state?.id || null, nationality_id: nationality?.id || null, next_of_kin_name: clean(row.next_of_kin_name) || null, next_of_kin_phone: clean(row.next_of_kin_phone) || null, emergency_contact_name: clean(row.emergency_contact_name) || null, emergency_contact_phone: clean(row.emergency_contact_phone) || null }, schoolId);
            result.imported++;
            result.credentials.push({ row: i + 2, name: `${row.surname} ${row.first_name}`, username, temporary_password: password, staff_number: staffNumber });
        } catch (error) { result.failed++; result.errors.push({ row: i + 2, message: error.message }); }
    }
};

const importParents = async (client, rows, schoolId, result) => {
    const role = await getRole(client, "Parent");
    if (!role) throw new Error("Parent role is not configured.");
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const missing = required(row, ["surname", "first_name", "phone_number", "residential_address", "student_admission_number", "relationship"]);
            if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
            const student = (await client.query("SELECT id FROM students WHERE school_id = $1 AND LOWER(admission_number) = LOWER($2)", [schoolId, clean(row.student_admission_number)])).rows[0];
            if (!student) throw new Error("Student admission number not found.");
            const relationship = clean(row.relationship_id) ? (await client.query("SELECT id FROM relationships WHERE id = $1", [Number(row.relationship_id)])).rows[0] : await findOne(client, "relationships", "relationship_name", row.relationship);
            if (!relationship) throw new Error("Relationship not found.");
            const username = await uniqueUsername(client, row.username, `parent.${clean(row.phone_number)}`, schoolId);
            const password = clean(row.password) || tempPassword();
            const hashed = await bcrypt.hash(password, 10);
            const userId = (await client.query("SELECT nextval(pg_get_serial_sequence('users','id')) AS id")).rows[0].id;
            await client.query("INSERT INTO users (id, username, email, password, role_id, school_id, must_change_password, is_active) VALUES ($1,$2,$3,$4,$5,$6,TRUE,TRUE)", [userId, username, clean(row.email) || null, hashed, role.id, schoolId]);
            const parentId = await parentModel.getNextParentId(client);
            const parent = await parentModel.createParent(client, { id: parentId, user_id: userId, surname: clean(row.surname), first_name: clean(row.first_name), middle_name: clean(row.middle_name) || null, gender: clean(row.gender) || null, phone_number: clean(row.phone_number), alternate_phone: clean(row.alternate_phone) || null, email: clean(row.email) || null, occupation: clean(row.occupation) || null, residential_address: clean(row.residential_address) });
            if (boolValue(row.is_primary_contact)) await parentModel.clearPrimaryContact(client, student.id);
            await parentModel.linkParentToStudent(client, student.id, parent.id, relationship.id, boolValue(row.is_primary_contact));
            result.imported++;
            result.credentials.push({ row: i + 2, name: `${row.surname} ${row.first_name}`, username, temporary_password: password });
        } catch (error) { result.failed++; result.errors.push({ row: i + 2, message: error.message }); }
    }
};

const importPayments = async (client, rows, schoolId, userId, result) => {
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const missing = required(row, ["student_admission_number", "session_name", "term_name", "amount_paid", "payment_date"]);
            if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
            const student = (await client.query("SELECT id FROM students WHERE school_id=$1 AND LOWER(admission_number)=LOWER($2)", [schoolId, row.student_admission_number])).rows[0];
            if (!student) throw new Error("Student not found.");
            const { session, term } = await lookupAcademic(client, row, schoolId);
            if (!session || !term) throw new Error("Academic session or term not found.");
            const amount = Number(row.amount_paid);
            if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount paid must be greater than zero.");
            await client.query(`INSERT INTO student_payments (student_id, session_id, term_id, amount_paid, payment_date, payment_method, reference_number, received_by, remarks, school_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [student.id, session.id, term.id, amount, dateValue(row.payment_date), clean(row.payment_method) || "CASH", clean(row.reference_number) || null, userId, clean(row.remarks) || null, schoolId]);
            result.imported++;
        } catch (error) { result.failed++; result.errors.push({ row: i + 2, message: error.message }); }
    }
};

const importExpenses = async (client, rows, schoolId, userId, result) => {
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const missing = required(row, ["expense_date", "category", "description", "amount"]);
            if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
            const amount = Number(row.amount);
            if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than zero.");
            await client.query(`INSERT INTO expenses (school_id, expense_date, category, description, amount, payment_method, vendor, reference_number, notes, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [schoolId, dateValue(row.expense_date), clean(row.category), clean(row.description), amount, clean(row.payment_method).toUpperCase() || "CASH", clean(row.vendor) || null, clean(row.reference_number) || null, clean(row.notes) || null, userId]);
            result.imported++;
        } catch (error) { result.failed++; result.errors.push({ row: i + 2, message: error.message }); }
    }
};

const getAssignment = async (client, row, schoolId) => {
    if (clean(row.teacher_assignment_id)) return (await client.query("SELECT ta.* FROM teacher_assignments ta JOIN teachers t ON t.id=ta.teacher_id AND t.school_id=$2 WHERE ta.id=$1", [Number(row.teacher_assignment_id), schoolId])).rows[0];
    const teacher = clean(row.teacher_staff_number) ? (await client.query("SELECT id FROM teachers WHERE school_id=$1 AND LOWER(staff_number)=LOWER($2)", [schoolId, row.teacher_staff_number])).rows[0] : null;
    const subject = clean(row.subject_id) ? (await client.query("SELECT id FROM subjects WHERE id=$1 AND school_id=$2", [Number(row.subject_id), schoolId])).rows[0] : (clean(row.subject_name) ? await findOne(client, "subjects", "subject_name", row.subject_name) : null);
    const cls = await lookupClass(client, row, schoolId);
    const arm = cls ? await lookupArm(client, row, schoolId, cls.id) : null;
    const { session, term } = await lookupAcademic(client, row, schoolId);
    if (!teacher || !subject || !cls || !session || !term) return null;
    const existing = (await client.query(`SELECT * FROM teacher_assignments WHERE teacher_id=$1 AND subject_id=$2 AND class_id=$3 AND arm_id IS NOT DISTINCT FROM $4 AND session_id=$5 AND term_id=$6`, [teacher.id, subject.id, cls.id, arm?.id || null, session.id, term.id])).rows[0];
    if (existing) return existing;
    return (await client.query(`INSERT INTO teacher_assignments (teacher_id, subject_id, class_id, arm_id, session_id, term_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [teacher.id, subject.id, cls.id, arm?.id || null, session.id, term.id])).rows[0];
};

const importResults = async (client, rows, schoolId, result) => {
    const grading = (await client.query("SELECT min_score, max_score, grade, remark FROM grading_systems WHERE school_id=$1 ORDER BY min_score", [schoolId])).rows;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const missing = required(row, ["student_admission_number", "session_name", "term_name", "ca_score", "exam_score"]);
            if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
            const student = (await client.query("SELECT id FROM students WHERE school_id=$1 AND LOWER(admission_number)=LOWER($2)", [schoolId, row.student_admission_number])).rows[0];
            if (!student) throw new Error("Student not found.");
            const assignment = await getAssignment(client, row, schoolId);
            if (!assignment) throw new Error("Teacher assignment could not be resolved. Provide teacher_staff_number, subject_name, class_name, arm_name, session_name and term_name.");
            const ca = Number(row.ca_score); const exam = Number(row.exam_score); const total = ca + exam;
            if (!Number.isFinite(ca) || ca < 0 || ca > 30) throw new Error("CA score must be between 0 and 30.");
            if (!Number.isFinite(exam) || exam < 0 || exam > 70) throw new Error("Exam score must be between 0 and 70.");
            const grade = grading.find(g => total >= Number(g.min_score) && total <= Number(g.max_score));
            const existing = (await client.query("SELECT id FROM student_results WHERE student_id=$1 AND teacher_assignment_id=$2 AND session_id=$3 AND term_id=$4", [student.id, assignment.id, assignment.session_id, assignment.term_id])).rows[0];
            if (existing) { result.skipped++; continue; }
            await client.query(`INSERT INTO student_results (student_id, teacher_assignment_id, session_id, term_id, ca_score, exam_score, total_score, grade, remark) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [student.id, assignment.id, assignment.session_id, assignment.term_id, ca, exam, total, grade?.grade || null, grade?.remark || null]);
            result.imported++;
        } catch (error) { result.failed++; result.errors.push({ row: i + 2, message: error.message }); }
    }
};

const importFile = async ({ buffer, type, schoolId, userId }) => {
    if (!schoolId) throw new Error("School context is required.");
    const rows = normalizeRows(buffer);
    if (!rows.length) throw new Error("The uploaded spreadsheet is empty.");
    if (rows.length > 5000) throw new Error("A single import is limited to 5,000 rows. Split larger files into batches.");
    const result = { type, total: rows.length, imported: 0, skipped: 0, failed: 0, errors: [], messages: [], credentials: [] };
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (type === "students") await importStudents(client, rows, schoolId, result);
        else if (type === "teachers") await importTeachers(client, rows, schoolId, result);
        else if (type === "parents") await importParents(client, rows, schoolId, result);
        else if (type === "payments") await importPayments(client, rows, schoolId, userId, result);
        else if (type === "expenses") await importExpenses(client, rows, schoolId, userId, result);
        else if (type === "results") await importResults(client, rows, schoolId, result);
        else throw new Error("Unsupported import type.");
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally { client.release(); }
};

module.exports = { importFile, normalizeRows };
