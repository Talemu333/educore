const announcementModel = require("../models/announcementModel");
const ApiError = require("../utils/ApiError");


const createAnnouncement = async (data) => {


    if (!data.title) {

        throw new ApiError(

            400,

            "Announcement title is required."

        );

    }


    if (!data.message) {

        throw new ApiError(

            400,

            "Announcement message is required."

        );

    }


    const announcement =

        await announcementModel.createAnnouncement(data);


    return announcement;


};



const getAnnouncements = async () => {


    const announcements =

        await announcementModel.getAnnouncements();


    return announcements;


};

const updateAnnouncement = async (id, data) => {


    const announcement =

        await announcementModel.updateAnnouncement(

            id,

            data

        );


    if (!announcement) {

        throw new ApiError(

            404,

            "Announcement not found."

        );

    }


    return announcement;

};

const deactivateAnnouncement = async (id) => {


    const announcement =

        await announcementModel.deactivateAnnouncement(id);


    if (!announcement) {

        throw new ApiError(

            404,

            "Announcement not found."

        );

    }


    return announcement;

};


module.exports = {

    createAnnouncement,

    getAnnouncements,
    updateAnnouncement,
    deactivateAnnouncement

};