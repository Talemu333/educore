const websiteService=require("../services/websiteService");
const publicWebsiteModel=require("../models/publicWebsiteModel");
const ApiError=require("../utils/ApiError");
const asyncHandler=require("../middlewares/asyncHandler");

const publicSchool=async req=>{
    if(req.query.schoolSlug){
        const school=await publicWebsiteModel.getSchoolBySlug(req.query.schoolSlug);
        if(!school) throw new ApiError(404,"School website not found.");
        return school.school_id;
    }
    return websiteService.resolveDomain(req.hostname);
};
const adminSchool=req=>req.user?.school_id;
const send=(res,data,message,status=200)=>res.status(status).json({success:true,...(message?{message}:{}),data});
const getPublishedPages=asyncHandler(async(req,res)=>send(res,await websiteService.getPublishedPages(await publicSchool(req))));
const getPage=asyncHandler(async(req,res)=>send(res,await websiteService.getPage(req.params.slug,await publicSchool(req))));
const getAllPages=asyncHandler(async(req,res)=>send(res,await websiteService.getAllPages(adminSchool(req))));
const updatePage=asyncHandler(async(req,res)=>send(res,await websiteService.updatePage(req.params.id,req.body,adminSchool(req)),"Website page updated successfully."));
const getPageSections=asyncHandler(async(req,res)=>send(res,await websiteService.getSectionsByPageId(req.params.pageId,adminSchool(req))));
const createSection=asyncHandler(async(req,res)=>send(res,await websiteService.createSection({...req.body,page_id:req.params.pageId},adminSchool(req)),"Website section created successfully.",201));
const updateSection=asyncHandler(async(req,res)=>send(res,await websiteService.updateSection(req.params.id,req.body,adminSchool(req)),"Website section updated successfully."));
const deleteSection=asyncHandler(async(req,res)=>{await websiteService.deleteSection(req.params.id,adminSchool(req));res.json({success:true,message:"Website section deleted successfully."});});
const getPublishedNews=asyncHandler(async(req,res)=>send(res,await websiteService.getPublishedNews(await publicSchool(req))));
const getNewsBySlug=asyncHandler(async(req,res)=>send(res,await websiteService.getNewsBySlug(req.params.slug,await publicSchool(req))));
const getAllNews=asyncHandler(async(req,res)=>send(res,await websiteService.getAllNews(adminSchool(req))));
const createNews=asyncHandler(async(req,res)=>send(res,await websiteService.createNews(req.body,adminSchool(req)),"News article created successfully.",201));
const updateNews=asyncHandler(async(req,res)=>send(res,await websiteService.updateNews(req.params.id,req.body,adminSchool(req)),"News article updated successfully."));
const deleteNews=asyncHandler(async(req,res)=>{await websiteService.deleteNews(req.params.id,adminSchool(req));res.json({success:true,message:"News article deleted successfully."});});
const getPublishedEvents=asyncHandler(async(req,res)=>send(res,await websiteService.getPublishedEvents(await publicSchool(req))));
const getEventBySlug=asyncHandler(async(req,res)=>send(res,await websiteService.getEventBySlug(req.params.slug,await publicSchool(req))));
const getAllEvents=asyncHandler(async(req,res)=>send(res,await websiteService.getAllEvents(adminSchool(req))));
const getEventById=asyncHandler(async(req,res)=>send(res,await websiteService.getEventById(req.params.id,adminSchool(req))));
const createEvent=asyncHandler(async(req,res)=>send(res,await websiteService.createEvent(req.body,adminSchool(req)),"Event created successfully.",201));
const updateEvent=asyncHandler(async(req,res)=>send(res,await websiteService.updateEvent(req.params.id,req.body,adminSchool(req)),"Event updated successfully."));
const deleteEvent=asyncHandler(async(req,res)=>{await websiteService.deleteEvent(req.params.id,adminSchool(req));res.json({success:true,message:"Event deleted successfully."});});
const getPublishedGallery=asyncHandler(async(req,res)=>send(res,await websiteService.getPublishedGallery(await publicSchool(req))));
const getAllGallery=asyncHandler(async(req,res)=>send(res,await websiteService.getAllGallery(adminSchool(req))));
const getGalleryById=asyncHandler(async(req,res)=>send(res,await websiteService.getGalleryById(req.params.id,adminSchool(req))));
const createGallery=asyncHandler(async(req,res)=>send(res,await websiteService.createGallery(req.body,adminSchool(req)),"Gallery item created successfully.",201));
const updateGallery=asyncHandler(async(req,res)=>send(res,await websiteService.updateGallery(req.params.id,req.body,adminSchool(req)),"Gallery item updated successfully."));
const deleteGallery=asyncHandler(async(req,res)=>{await websiteService.deleteGallery(req.params.id,adminSchool(req));res.json({success:true,message:"Gallery item deleted successfully."});});
module.exports={getPublishedPages,getPage,getAllPages,updatePage,getPageSections,createSection,updateSection,deleteSection,getPublishedNews,getNewsBySlug,getAllNews,createNews,updateNews,deleteNews,getPublishedGallery,getAllGallery,getGalleryById,createGallery,updateGallery,deleteGallery,getPublishedEvents,getEventBySlug,getAllEvents,getEventById,createEvent,updateEvent,deleteEvent};
