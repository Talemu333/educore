const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");

const ApiError = require("../utils/ApiError");


const changePassword = async (
    userId,
    oldPassword,
    newPassword
) => {


    const user =
        await userModel.getUserById(userId);


    if (!user) {

        throw new ApiError(
            404,
            "User not found."
        );

    }


    const match =
        await bcrypt.compare(
            oldPassword,
            user.password
        );


    if (!match) {

        throw new ApiError(
            400,
            "Current password is incorrect."
        );

    }


    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            10
        );


    return await userModel.changePassword(

        userId,

        hashedPassword

    );

};


module.exports = {

    changePassword

};