const passwordService =
    require("../services/passwordService");

const asyncHandler =
    require("../middlewares/asyncHandler");


const changePassword = asyncHandler(
async (req, res) => {


    const result =
        await passwordService.changePassword(

            req.user.id,

            req.body.oldPassword,

            req.body.newPassword

        );


    res.json({

        success:true,

        message:"Password changed successfully.",

        data: result

    });


});


module.exports = {

    changePassword

};