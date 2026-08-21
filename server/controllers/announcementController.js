const announcementService =
    require("../services/announcementService");

const asyncHandler =
    require("../middlewares/asyncHandler");



const createAnnouncement = asyncHandler(async (req, res) => {


    const announcement =

        await announcementService.createAnnouncement({

            title: req.body.title,

            message: req.body.message,

            audience: req.body.audience,

            created_by: req.user.id,

            expiry_date: req.body.expiry_date

        });


    res.status(201).json({

        success: true,

        message: "Announcement created successfully.",

        data: announcement

    });


});




const getAnnouncements = asyncHandler(async (req, res) => {


    const announcements =

        await announcementService.getAnnouncements();


    res.status(200).json({

        success: true,

        data: announcements

    });


});

const updateAnnouncement = asyncHandler(async (req, res) => {


    const announcement =

        await announcementService.updateAnnouncement(

            req.params.id,

            {

                title: req.body.title,

                message: req.body.message,

                audience: req.body.audience,

                expiry_date: req.body.expiry_date

            }

        );


    res.json({

        success:true,

        message:"Announcement updated successfully.",

        data: announcement

    });


});

const deactivateAnnouncement = asyncHandler(async (req, res) => {


    const announcement =

        await announcementService.deactivateAnnouncement(

            req.params.id

        );


    res.json({

        success: true,

        message: "Announcement deactivated successfully.",

        data: announcement

    });


});


module.exports = {

    createAnnouncement,

    getAnnouncements,
    updateAnnouncement,
    deactivateAnnouncement

};