const model=require("../models/announcementModel");
const ApiError=require("../utils/ApiError");
const ALLOWED=new Set(["all","students","teachers","parents","administrators"]);
const requireSchool=id=>{if(!id)throw new ApiError(403,"School context is required.");};
const canManageAnnouncements=user=>{const role=String(user?.role_name||user?.role||"").trim().toLowerCase();const type=String(user?.admin_type||"").trim().toLowerCase();return role==="principal"||(role==="admin"&&["proprietor","principal","vice_principal"].includes(type));};
const requireManager=user=>{if(!canManageAnnouncements(user))throw new ApiError(403,"You do not have permission to manage announcements.");};
const ids=(value,label)=>{if(value===undefined||value===null)return [];if(!Array.isArray(value))throw new ApiError(400,label+" must be a list.");const result=[...new Set(value.map(Number))];if(result.some(id=>!Number.isInteger(id)||id<1))throw new ApiError(400,label+" contains an invalid ID.");return result;};
const normalize=data=>{const title=String(data.title||"").trim(),message=String(data.message||"").trim(),audience=String(data.audience||"all").trim().toLowerCase(),publish=data.publish_date||new Date().toISOString().slice(0,10),expiry=data.expiry_date||null,isActive=data.is_active===undefined?true:data.is_active,isPinned=data.is_pinned===undefined?false:data.is_pinned,attachmentUrl=String(data.attachment_url||"").trim()||null,attachmentName=String(data.attachment_name||"").trim().slice(0,255)||null,classIds=ids(data.class_ids,"Class targets"),armIds=ids(data.arm_ids,"Arm targets"),studentIds=ids(data.student_ids,"Student targets");
if(!title)throw new ApiError(400,"Announcement title is required.");if(title.length>200)throw new ApiError(400,"Announcement title must be 200 characters or fewer.");if(!message)throw new ApiError(400,"Announcement message is required.");if(!ALLOWED.has(audience))throw new ApiError(400,"Please select a valid audience.");if(!/^\d{4}-\d{2}-\d{2}$/.test(String(publish)))throw new ApiError(400,"A valid publication date is required.");if(expiry&&!/^\d{4}-\d{2}-\d{2}$/.test(String(expiry)))throw new ApiError(400,"Please provide a valid expiry date.");if(expiry&&expiry<publish)throw new ApiError(400,"The expiry date cannot be earlier than the publication date.");if(typeof isActive!=="boolean"||typeof isPinned!=="boolean")throw new ApiError(400,"Announcement status must be active or inactive.");
if(attachmentUrl){let parsed;try{parsed=new URL(attachmentUrl);}catch{throw new ApiError(400,"Attachment must be a valid web link.");}if(!["https:","http:"].includes(parsed.protocol)||parsed.username||parsed.password)throw new ApiError(400,"Attachment must be a valid HTTP or HTTPS link.");}
if((classIds.length||armIds.length||studentIds.length)&&!["students","parents","all"].includes(audience))throw new ApiError(400,"Targeting is only available for students, parents, or everyone.");
return {title,message,audience,publish_date:publish,expiry_date:expiry,is_active:isActive,is_pinned:isPinned,attachment_url:attachmentUrl,attachment_name:attachmentName,class_ids:classIds,arm_ids:armIds,student_ids:studentIds};};
const createAnnouncement=async(data,schoolId,user,db)=>{requireSchool(schoolId);requireManager(user);const item=normalize(data);await model.validateTargets(item,schoolId,db);return model.createAnnouncement({...item,created_by:user.id},schoolId,db);};
const getAnnouncements=async(schoolId,user,query={},db)=>{requireSchool(schoolId);const options={q:String(query.q||"").trim().slice(0,120),audience:String(query.audience||"").trim().toLowerCase(),status:String(query.status||"").trim().toLowerCase(),read:String(query.read||"").trim().toLowerCase(),pinned:String(query.pinned||"").trim().toLowerCase(),page:Math.max(1,parseInt(query.page,10)||1),limit:Math.max(1,Math.min(50,parseInt(query.limit,10)||10))};if(canManageAnnouncements(user))return {...await model.getAnnouncementsForManagement(schoolId,options,db),page:options.page,limit:options.limit};return {...await model.getAnnouncementsForAudience(schoolId,user,options,db),page:options.page,limit:options.limit};};
const updateAnnouncement=async(id,data,schoolId,user,db)=>{requireSchool(schoolId);requireManager(user);const item=normalize(data);await model.validateTargets(item,schoolId,db);const result=await model.updateAnnouncement(id,item,schoolId,db);if(!result)throw new ApiError(404,"Announcement not found.");return result;};
const deactivateAnnouncement=async(id,schoolId,user,db)=>{requireSchool(schoolId);requireManager(user);const result=await model.deactivateAnnouncement(id,schoolId,db);if(!result)throw new ApiError(404,"Announcement not found.");return result;};
const setPinned=async(id,value,schoolId,user,db)=>{requireSchool(schoolId);requireManager(user);if(typeof value!=="boolean")throw new ApiError(400,"Pinned status must be true or false.");const result=await model.setPinned(id,value,schoolId,db);if(!result)throw new ApiError(404,"Announcement not found.");return result;};
const markRead=async(id,schoolId,user,db)=>{requireSchool(schoolId);const result=await model.markRead(id,user.id,schoolId,db);if(!result)throw new ApiError(404,"Announcement not found or no longer available.");return result;};
const getTargetOptions=async(schoolId,user,db)=>{requireSchool(schoolId);requireManager(user);return model.getTargetOptions(schoolId,db);};

const ALLOWED_FILE_TYPES = new Map([
  [".pdf", ["application/pdf"]],
  [".jpg", ["image/jpeg"]],
  [".jpeg", ["image/jpeg"]],
  [".png", ["image/png"]],
  [".txt", ["text/plain"]],
  [".csv", ["text/csv", "application/vnd.ms-excel"]],
  [".doc", ["application/msword"]],
  [".docx", ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]],
  [".xls", ["application/vnd.ms-excel"]],
  [".xlsx", ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]],
  [".ppt", ["application/vnd.ms-powerpoint"]],
  [".pptx", ["application/vnd.openxmlformats-officedocument.presentationml.presentation"]]
]);

const uploadAttachments = async (announcementId, files, schoolId, user, db) => {
  requireSchool(schoolId);
  requireManager(user);
  const announcement = await model.getAnnouncementById(announcementId, schoolId, db);
  if (!announcement) throw new ApiError(404, "Announcement not found.");
  if (!Array.isArray(files) || files.length === 0) throw new ApiError(400, "Choose at least one file to upload.");
  const existingCount = await model.countAttachments(announcementId, schoolId, db);
  if (existingCount + files.length > 5) throw new ApiError(400, "An announcement can have at most 5 file attachments.");
  const validated = [];
  for (const file of files) {
    const fileName = String(file.originalname || "").split("").filter(ch => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127).join("").trim().slice(0, 255);
    const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase() : "";
    const allowedMimes = ALLOWED_FILE_TYPES.get(extension);
    if (!fileName || !allowedMimes || !allowedMimes.includes(file.mimetype)) {
      throw new ApiError(400, "An attachment has an unsupported type. Use PDF, JPG, PNG, TXT, CSV, Word, Excel or PowerPoint files.");
    }
    if (!file.buffer || !file.size || file.size > 5 * 1024 * 1024) throw new ApiError(400, "Each attachment must be no larger than 5 MB.");
    validated.push({ file_name: fileName, mime_type: file.mimetype, file_size: file.size, file_data: file.buffer });
  }
  const saved = [];
  for (const file of validated) saved.push(await model.createAttachment(announcementId, schoolId, user.id, file, db));
  return saved;
};

const getAttachmentForUser = async (announcementId, attachmentId, schoolId, user, db) => {
  requireSchool(schoolId);
  if (canManageAnnouncements(user)) {
    if (!(await model.getAnnouncementById(announcementId, schoolId, db))) throw new ApiError(404, "Announcement not found.");
  } else {
    const result = await model.getAnnouncementsForAudience(schoolId, user, { id: Number(announcementId), page: 1, limit: 1 }, db);
    if (!result.items.some(item => Number(item.id) === Number(announcementId))) throw new ApiError(404, "Announcement not found.");
  }
  const attachment = await model.getAttachment(announcementId, attachmentId, schoolId, db);
  if (!attachment) throw new ApiError(404, "Attachment not found.");
  return attachment;
};

const deleteAttachment = async (announcementId, attachmentId, schoolId, user, db) => {
  requireSchool(schoolId);
  requireManager(user);
  if (!(await model.getAnnouncementById(announcementId, schoolId, db))) throw new ApiError(404, "Announcement not found.");
  const deleted = await model.deleteAttachment(announcementId, attachmentId, schoolId, db);
  if (!deleted) throw new ApiError(404, "Attachment not found.");
  return deleted;
};

module.exports={createAnnouncement,getAnnouncements,updateAnnouncement,deactivateAnnouncement,setPinned,markRead,getTargetOptions,canManageAnnouncements,uploadAttachments,getAttachmentForUser,deleteAttachment};