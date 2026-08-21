const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const { withTransaction } = require("./transactionService");
const parentModel = require("../models/parentModel");
const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");
const generateTemporaryPassword = require("../utils/passwordGenerator");
const ROLE_NAMES = require("../config/roleNames");


const createParent = async (parentData) => {

    return await withTransaction(async (client) => {

        const existingUser = await userModel.getUserByUsername(
            parentData.username
        );

        if (existingUser) {

            throw new ApiError(
                409,
                "Username already exists."
            );

        }

        const temporaryPassword = generateTemporaryPassword();

        const hashedPassword = await bcrypt.hash(
            temporaryPassword,
            10
        );

        const parentRole = await roleModel.getRoleByName(
            ROLE_NAMES.PARENT
        );

        if (!parentRole) {

            throw new ApiError(
                500,
                "Parent role is not configured."
            );

        }

        const parentId = await parentModel.getNextParentId(client);

        const user = await userModel.createUser(client, {

            username: parentData.username,

            password: hashedPassword,

            role_id: parentRole.id

        });

        const parent = await parentModel.createParent(client, {

            id: parentId,

            user_id: user.id,

            ...parentData

        });

        if (parentData.is_primary_contact) {

            await parentModel.clearPrimaryContact(

                client,

                parentData.student_id

            );

        }

        await parentModel.linkParentToStudent(

            client,

            parentData.student_id,

            parent.id,

            parentData.relationship_id,

            parentData.is_primary_contact || false

        );

        return {

            parent,

            temporaryPassword

        };

    });

};

const updateParent = async (

    id,

    parentData

) => {

    return await withTransaction(async (client) => {

        // Update parent information
        const parent = await parentModel.updateParent(

            client,

            id,

            parentData

        );

        // Ensure only one primary contact
        if (parentData.is_primary_contact) {

            await parentModel.clearPrimaryContact(

                client,

                parentData.student_id

            );

        }

        // Update relationship + primary contact
        await parentModel.updateStudentParent(

            client,

            parentData.student_id,

            id,

            parentData.relationship_id,

            parentData.is_primary_contact

        );

        return parent;

    });

};

const unlinkParent = async (studentId, parentId) => {

    return await withTransaction(async (client) => {

        // Remove the relationship
        const link = await parentModel.unlinkParentFromStudent(

            client,

            studentId,

            parentId

        );

        if (!link) {

            throw new ApiError(

                404,

                "Parent link not found."

            );

        }

        // Check if parent still has other students
        const totalLinks = await parentModel.countParentLinks(

            client,

            parentId

        );

        if (totalLinks === 0) {

            // Get parent record
            const parent = await parentModel.getParentById(

                client,

                parentId

            );

            if (parent) {

                // Delete parent
                await parentModel.deleteParent(

                    client,

                    parentId

                );

                // Delete login account
                await userModel.deleteUser(

                    client,

                    parent.user_id

                );

            }

        }

        return true;

    });

};

const getParents = async () => {

    return await parentModel.getParents();

};

const linkExistingParent = async (data) => {

    return await withTransaction(async (client) => {

         if (data.is_primary_contact) {

            await parentModel.clearPrimaryContact(

                client,

                data.student_id

            );

        }

        const link = await parentModel.linkParentToStudent(

            client,

            data.student_id,

            data.parent_id,

            data.relationship_id,

            data.is_primary_contact || false

        );

        return link;

    });

};

const getParentDashboard = async (userId) => {

    const parent =
        await parentModel.getParentByUserId(
            userId
        );

    if (!parent) {

        throw new ApiError(
            404,
            "Parent profile not found."
        );

    }

    const children =
        await parentModel.getChildrenByParentUserId(
            userId
        );

    return {

        parent,

        children,

        totalChildren:
            children.length

    };

};

const getParentPaymentSummary = async (
    userId,
    studentId,
    sessionId,
    termId
) => {

    const isParent =
        await parentModel.isParentOfStudent(
            userId,
            studentId
        );

    if (!isParent) {

        throw new ApiError(
            403,
            "You are not authorized to view this student's financial information."
        );

    }

    const summary =
        await parentModel.getParentStudentPaymentSummary(
            userId,
            studentId,
            sessionId,
            termId
        );

    if (!summary) {

        throw new ApiError(
            404,
            "Financial information not found."
        );

    }

    const totalFees =
        Number(summary.total_fees || 0);

    const totalPaid =
        Number(summary.total_paid || 0);

    const balance =
        totalFees - totalPaid;

    let status;

    if (totalPaid === 0) {

        status = "UNPAID";

    } else if (balance === 0) {

        status = "PAID";

    } else {

        status = "PARTLY PAID";

    }

    return {

        ...summary,

        total_fees: totalFees,

        total_paid: totalPaid,

        balance,

        status

    };

};


const getParentPaymentHistory = async (
    userId,
    studentId,
    sessionId,
    termId
) => {

    const isParent =
        await parentModel.isParentOfStudent(
            userId,
            studentId
        );

    if (!isParent) {

        throw new ApiError(
            403,
            "You are not authorized to view this student's payments."
        );

    }

    return await parentModel.getParentStudentPayments(
        userId,
        studentId,
        sessionId,
        termId
    );

};

const getParentFeeBreakdown = async (
    userId,
    studentId
) => {

    const children =
        await parentModel.getChildrenByParentUserId(
            userId
        );

    const child = children.find(
        student =>
            Number(student.id) === Number(studentId)
    );

    if (!child) {

        throw new ApiError(
            403,
            "You are not authorized to view this student's fee information."
        );

    }

    return await parentModel.getStudentFeeBreakdown(
        studentId
    );

};

const getParentFinancialOverview = async (
    sessionId,
    termId
) => {

    return await parentModel.getParentFinancialOverview(
        sessionId,
        termId
    );

};

const getParentFinancialDetails = async (
    parentId,
    sessionId,
    termId
) => {

    return await parentModel.getParentFinancialDetails(
        parentId,
        sessionId,
        termId
    );

};

module.exports = {

    createParent,
    updateParent,
    unlinkParent,
    getParents,
    linkExistingParent,
    getParentDashboard,
    getParentPaymentSummary,
    getParentPaymentHistory,
    getParentFeeBreakdown,
    getParentFinancialOverview,
    getParentFinancialDetails


};