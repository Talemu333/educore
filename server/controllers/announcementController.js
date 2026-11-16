const service=require("../services/announcementService");
const asyncHandler=require("../middlewares/asyncHandler");
const schoolId=req=>req.schoolDatabaseSchoolId||req.superAdminSchoolContext||req.user?.school_id;
const db=req=>req.schoolDatabase;
const createAnnouncement=asyncHandler(async(req,res)=>{const data=await service.createAnnouncement(req.body,schoolId(req),req.user,db(req));res.status(201).json({success:true,message:"Announcement created successfully.",data});});
const getAnnouncements=asyncHandler(async(req,res)=>{const data=await service.getAnnouncements(schoolId(req),req.user,req.query,db(req));res.json({success:true,data});});
const updateAnnouncement=asyncHandler(async(req,res)=>{const data=await service.updateAnnouncement(req.params.id,req.body,schoolId(req),req.user,db(req));res.json({success:true,message:"Announcement updated successfully.",data});});
const deactivateAnnouncement=asyncHandler(async(req,res)=>{const data=await service.deactivateAnnouncement(req.params.id,schoolId(req),req.user,db(req));res.json({success:true,message:"Announcement deactivated successfully.",data});});
const setPinned=asyncHandler(async(req,res)=>{const data=await service.setPinned(req.params.id,req.body.is_pinned,schoolId(req),req.user,db(req));res.json({success:true,message:data.is_pinned?"Announcement pinned.":"Announcement unpinned.",data});});
const markRead=asyncHandler(async(req,res)=>{const data=await service.markRead(req.params.id,schoolId(req),req.user,db(req));res.json({success:true,message:"Announcement marked as read.",data});});
const getTargetOptions=asyncHandler(async(req,res)=>{const data=await service.getTargetOptions(schoolId(req),req.user,db(req));res.json({success:true,data});});

const uploadAttachments=asyncHandler(async(req,res)=>{const data=await service.uploadAttachments(req.params.id,req.files,schoolId(req),req.user,db(req));res.status(201).json({success:true,message:"Attachments uploaded successfully.",data});});
const downloadAttachment=asyncHandler(async(req,res)=>{const file=await service.getAttachmentForUser(req.params.id,req.params.attachmentId,schoolId(req),req.user,db(req));res.setHeader("Content-Type",file.mime_type);res.setHeader("Content-Disposition",`attachment; filename*=UTF-8''${encodeURIComponent(file.file_name)}`);res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Cache-Control","private, no-store");res.status(200).send(file.file_data);});
const deleteAttachment=asyncHandler(async(req,res)=>{const data=await service.deleteAttachment(req.params.id,req.params.attachmentId,schoolId(req),req.user,db(req));res.json({success:true,message:"Attachment deleted.",data});});

module.exports={createAnnouncement,getAnnouncements,updateAnnouncement,deactivateAnnouncement,setPinned,markRead,getTargetOptions,uploadAttachments,downloadAttachment,deleteAttachment};