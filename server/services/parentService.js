const pool = require("../config/database");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const { withTransaction } = require("./transactionService");
const parentModel = require("../models/parentModel");
const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");
const studentModel = require("../models/studentModel");
const generateTemporaryPassword = require("../utils/passwordGenerator");
const ROLE_NAMES = require("../config/roleNames");

const createParent = async (parentData, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return await withTransaction(async (client) => {
        const existingUser = await userModel.getUserByUsername(parentData.username, schoolId);
        if (existingUser) throw new ApiError(409, "Username already exists.");
        const student = await studentModel.getStudentById(parentData.student_id, schoolId);
        if (!student) throw new ApiError(404, "Student not found in this school.");
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const parentRole = await roleModel.getRoleByName(ROLE_NAMES.PARENT);
        if (!parentRole) throw new ApiError(500, "Parent role is not configured.");
        const parentId = await parentModel.getNextParentId(client);
        const user = await userModel.createUser(client, { username: parentData.username, password: hashedPassword, role_id: parentRole.id }, schoolId);
        const parent = await parentModel.createParent(client, { id: parentId, user_id: user.id, ...parentData });
        if (parentData.is_primary_contact) await parentModel.clearPrimaryContact(client, parentData.student_id);
        await parentModel.linkParentToStudent(client, parentData.student_id, parent.id, parentData.relationship_id, parentData.is_primary_contact || false);
        return { parent, temporaryPassword };
    });
};

const updateParent = async (id, parentData, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return await withTransaction(async (client) => {
        const existingParent = await parentModel.getParentById(client, id);
        if (!existingParent) throw new ApiError(404, "Parent not found.");
        if (!(await userModel.getUserById(existingParent.user_id, schoolId))) throw new ApiError(404, "Parent does not belong to this school.");
        if (!(await studentModel.getStudentById(parentData.student_id, schoolId))) throw new ApiError(404, "Student not found in this school.");
        const parent = await parentModel.updateParent(client, id, parentData);
        if (!parent) throw new ApiError(404, "Parent not found.");
        if (parentData.is_primary_contact) await parentModel.clearPrimaryContact(client, parentData.student_id);
        await parentModel.updateStudentParent(client, parentData.student_id, id, parentData.relationship_id, parentData.is_primary_contact);
        return parent;
    });
};

const unlinkParent = async (studentId, parentId, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return await withTransaction(async (client) => {
        if (!(await studentModel.getStudentById(studentId, schoolId))) throw new ApiError(404, "Student not found in this school.");
        const parent = await parentModel.getParentById(client, parentId);
        if (!parent) throw new ApiError(404, "Parent not found.");
        if (!(await userModel.getUserById(parent.user_id, schoolId))) throw new ApiError(404, "Parent does not belong to this school.");
        const link = await parentModel.unlinkParentFromStudent(client, studentId, parentId);
        if (!link) throw new ApiError(404, "Parent link not found.");
        if ((await parentModel.countParentLinks(client, parentId)) === 0) {
            await parentModel.deleteParent(client, parentId);
            await userModel.deleteUser(client, parent.user_id, schoolId);
        }
        return true;
    });
};

const getParents = async (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return userModel.getParents(schoolId);
};

const linkExistingParent = async (data, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return withTransaction(async (client) => {
        if (!(await studentModel.getStudentById(data.student_id, schoolId))) throw new ApiError(404, "Student not found in this school.");
        const parent = await parentModel.getParentById(client, data.parent_id);
        if (!parent) throw new ApiError(404, "Parent not found.");
        if (!(await userModel.getUserById(parent.user_id, schoolId))) throw new ApiError(404, "Parent does not belong to this school.");
        if (data.is_primary_contact) await parentModel.clearPrimaryContact(client, data.student_id);
        return parentModel.linkParentToStudent(client, data.student_id, data.parent_id, data.relationship_id, data.is_primary_contact || false);
    });
};

const getParentDashboard = async (userId, schoolId) => {
    if (!(await userModel.getUserById(userId, schoolId))) throw new ApiError(403, "Parent does not belong to this school.");
    const parent = await parentModel.getParentByUserId(userId);
    if (!parent) throw new ApiError(404, "Parent profile not found.");
    const children = await parentModel.getChildrenByParentUserId(userId);
    return { parent, children, totalChildren: children.length };
};

const getParentPaymentSummary = async (userId, studentId, sessionId, termId, schoolId) => {
    if (!(await studentModel.getStudentById(studentId, schoolId)) || !(await parentModel.isParentOfStudent(userId, studentId))) throw new ApiError(403, "You are not authorized to view this student's financial information.");
    const summary = await parentModel.getParentStudentPaymentSummary(userId, studentId, sessionId, termId);
    if (!summary) throw new ApiError(404, "Financial information not found.");
    const totalFees = Number(summary.total_fees || 0), totalPaid = Number(summary.total_paid || 0), balance = totalFees - totalPaid;
    return { ...summary, total_fees: totalFees, total_paid: totalPaid, balance, status: totalPaid === 0 ? "UNPAID" : balance === 0 ? "PAID" : "PARTLY PAID" };
};

const getParentPaymentHistory = async (userId, studentId, sessionId, termId, schoolId) => {
    if (!(await studentModel.getStudentById(studentId, schoolId)) || !(await parentModel.isParentOfStudent(userId, studentId))) throw new ApiError(403, "You are not authorized to view this student's payments.");
    return parentModel.getParentStudentPayments(userId, studentId, sessionId, termId);
};

const getParentFeeBreakdown = async (userId, studentId, schoolId) => {
    if (!(await studentModel.getStudentById(studentId, schoolId))) throw new ApiError(403, "You are not authorized to view this student's fee information.");
    const children = await parentModel.getChildrenByParentUserId(userId);
    if (!children.some(item => Number(item.id) === Number(studentId))) throw new ApiError(403, "You are not authorized to view this student's fee information.");
    return parentModel.getStudentFeeBreakdown(studentId);
};

const getParentFinancialOverview = async (sessionId, termId, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return parentModel.getParentFinancialOverview(sessionId, termId);
};

const getParentFinancialDetails = async (parentId, sessionId, termId, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const result = await pool.query(`SELECT p.id FROM parents p JOIN users u ON u.id = p.user_id WHERE p.id = $1 AND u.school_id = $2`, [parentId, schoolId]);
    if (!result.rows[0]) throw new ApiError(404, "Parent not found in this school.");
    return parentModel.getParentFinancialDetails(parentId, sessionId, termId);
};

module.exports = { createParent, updateParent, unlinkParent, getParents, linkExistingParent, getParentDashboard, getParentPaymentSummary, getParentPaymentHistory, getParentFeeBreakdown, getParentFinancialOverview, getParentFinancialDetails };
