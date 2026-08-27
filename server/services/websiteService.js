const ApiError=require("../utils/ApiError");
const websiteModel=require("../models/websiteModel");

const resolveDomain=async(domain)=>{
    if(!domain) throw new ApiError(400,"School domain could not be determined.");
    const school=await websiteModel.getSchoolByDomain(domain);
    if(!school) throw new ApiError(404,"School website not found for this domain.");
    return school.id;
};
const requireSchool=schoolId=>{if(!schoolId) throw new ApiError(403,"School context is required.");return schoolId;};

const getPublishedPages=async(schoolId)=>websiteModel.getPublishedPages(requireSchool(schoolId));
const getPage=async(slug,schoolId)=>{const p=await websiteModel.getCompletePage(slug,requireSchool(schoolId));if(!p)throw new ApiError(404,"Website page not found.");return p;};
const getAllPages=async(schoolId)=>websiteModel.getAllPages(requireSchool(schoolId));
const updatePage=async(id,data,schoolId)=>{const p=await websiteModel.updatePage(id,data,requireSchool(schoolId));if(!p)throw new ApiError(404,"Website page not found.");return p;};
const getSectionsByPageId=async(id,schoolId)=>websiteModel.getSectionsByPageId(id,requireSchool(schoolId));
const createSection=async(data,schoolId)=>{const s=await websiteModel.createSection(data,requireSchool(schoolId));if(!s)throw new ApiError(404,"Website page not found.");return s;};
const updateSection=async(id,data,schoolId)=>{const s=await websiteModel.updateSection(id,data,requireSchool(schoolId));if(!s)throw new ApiError(404,"Website section not found.");return s;};
const deleteSection=async(id,schoolId)=>{const s=await websiteModel.deleteSection(id,requireSchool(schoolId));if(!s)throw new ApiError(404,"Website section not found.");return s;};

const getPublishedNews=async(schoolId)=>websiteModel.getPublishedNews(requireSchool(schoolId));
const getNewsBySlug=async(slug,schoolId)=>{const n=await websiteModel.getNewsBySlug(slug,requireSchool(schoolId));if(!n)throw new ApiError(404,"News article not found.");return n;};
const getAllNews=async(schoolId)=>websiteModel.getAllNews(requireSchool(schoolId));
const createNews=async(data,schoolId)=>{if(!data.title?.trim())throw new ApiError(400,"News title is required.");if(!data.slug?.trim())throw new ApiError(400,"News slug is required.");if(!data.content?.trim())throw new ApiError(400,"News content is required.");return websiteModel.createNews(data,requireSchool(schoolId));};
const updateNews=async(id,data,schoolId)=>{if(!data.title?.trim())throw new ApiError(400,"News title is required.");if(!data.slug?.trim())throw new ApiError(400,"News slug is required.");if(!data.content?.trim())throw new ApiError(400,"News content is required.");const n=await websiteModel.updateNews(id,data,requireSchool(schoolId));if(!n)throw new ApiError(404,"News article not found.");return n;};
const deleteNews=async(id,schoolId)=>{const n=await websiteModel.deleteNews(id,requireSchool(schoolId));if(!n)throw new ApiError(404,"News article not found.");return n;};

const getPublishedEvents=async(schoolId)=>websiteModel.getPublishedEvents(requireSchool(schoolId));
const getEventBySlug=async(slug,schoolId)=>{const e=await websiteModel.getEventBySlug(slug,requireSchool(schoolId));if(!e)throw new ApiError(404,"Event not found.");return e;};
const getAllEvents=async(schoolId)=>websiteModel.getAllEvents(requireSchool(schoolId));
const getEventById=async(id,schoolId)=>{const e=await websiteModel.getEventById(id,requireSchool(schoolId));if(!e)throw new ApiError(404,"Event not found.");return e;};
const createEvent=async(data,schoolId)=>{if(!data.title?.trim())throw new ApiError(400,"Event title is required.");if(!data.slug?.trim())throw new ApiError(400,"Event slug is required.");if(!data.event_date)throw new ApiError(400,"Event date is required.");return websiteModel.createEvent(data,requireSchool(schoolId));};
const updateEvent=async(id,data,schoolId)=>{if(!data.title?.trim())throw new ApiError(400,"Event title is required.");if(!data.slug?.trim())throw new ApiError(400,"Event slug is required.");if(!data.event_date)throw new ApiError(400,"Event date is required.");const e=await websiteModel.updateEvent(id,data,requireSchool(schoolId));if(!e)throw new ApiError(404,"Event not found.");return e;};
const deleteEvent=async(id,schoolId)=>{const e=await websiteModel.deleteEvent(id,requireSchool(schoolId));if(!e)throw new ApiError(404,"Event not found.");return e;};

const getPublishedGallery=async(schoolId)=>websiteModel.getPublishedGallery(requireSchool(schoolId));
const getAllGallery=async(schoolId)=>websiteModel.getAllGallery(requireSchool(schoolId));
const getGalleryById=async(id,schoolId)=>{const g=await websiteModel.getGalleryById(id,requireSchool(schoolId));if(!g)throw new ApiError(404,"Gallery item not found.");return g;};
const createGallery=async(data,schoolId)=>{if(!data.title?.trim())throw new ApiError(400,"Gallery title is required.");if(!data.image_url?.trim())throw new ApiError(400,"Gallery image URL is required.");return websiteModel.createGallery(data,requireSchool(schoolId));};
const updateGallery=async(id,data,schoolId)=>{if(!data.title?.trim())throw new ApiError(400,"Gallery title is required.");if(!data.image_url?.trim())throw new ApiError(400,"Gallery image URL is required.");const g=await websiteModel.updateGallery(id,data,requireSchool(schoolId));if(!g)throw new ApiError(404,"Gallery item not found.");return g;};
const deleteGallery=async(id,schoolId)=>{const g=await websiteModel.deleteGallery(id,requireSchool(schoolId));if(!g)throw new ApiError(404,"Gallery item not found.");return g;};

module.exports={resolveDomain,getPublishedPages,getPage,getAllPages,updatePage,getSectionsByPageId,createSection,updateSection,deleteSection,getPublishedNews,getNewsBySlug,getAllNews,createNews,updateNews,deleteNews,getPublishedEvents,getEventBySlug,getAllEvents,getEventById,createEvent,updateEvent,deleteEvent,getPublishedGallery,getAllGallery,getGalleryById,createGallery,updateGallery,deleteGallery};