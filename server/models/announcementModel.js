const pool = require("../config/database");
const resolveDb = (db) => db || pool;

const createAnnouncement = async (data, schoolId, db) => {
  const result = await resolveDb(db).query("INSERT INTO announcements (school_id,title,message,audience,created_by,is_active,publish_date,expiry_date,is_pinned,attachment_url,attachment_name,class_ids,arm_ids,student_ids,parent_ids) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *", [schoolId,data.title,data.message,data.audience,data.created_by,data.is_active,data.publish_date,data.expiry_date,data.is_pinned,data.attachment_url,data.attachment_name,data.class_ids,data.arm_ids,data.student_ids,data.parent_ids]);
  return result.rows[0];
};

const listForManagement = async (schoolId, options, db) => {
  const client = resolveDb(db), values = [schoolId], where = ["a.school_id=$1"];
  const add = (sql, value) => { values.push(value); where.push(sql.replace("?", "$" + values.length)); };
  if (options.q) { values.push(options.q); where.push("(a.title ILIKE '%' || $" + values.length + " || '%' OR a.message ILIKE '%' || $" + values.length + " || '%')"); }
  if (options.audience) add("a.audience=?", options.audience);
  if (options.status==="active") where.push("a.is_active=TRUE AND a.publish_date<=CURRENT_DATE AND (a.expiry_date IS NULL OR a.expiry_date>=CURRENT_DATE)");
  if (options.status==="inactive") where.push("a.is_active=FALSE");
  if (options.status==="scheduled") where.push("a.is_active=TRUE AND a.publish_date>CURRENT_DATE");
  if (options.status==="expired") where.push("a.is_active=TRUE AND a.expiry_date<CURRENT_DATE");
  if (options.pinned==="true") where.push("a.is_pinned=TRUE");
  if (options.pinned==="false") where.push("a.is_pinned=FALSE");
  const condition = where.join(" AND "), count = await client.query("SELECT COUNT(*)::int AS total FROM announcements a WHERE " + condition, values);
  const paged = values.concat([options.limit,(options.page-1)*options.limit]);
  const result = await client.query("SELECT a.*,u.username AS created_by_username FROM announcements a LEFT JOIN users u ON u.id=a.created_by AND u.school_id=a.school_id WHERE " + condition + " ORDER BY a.is_pinned DESC,a.created_at DESC,a.id DESC LIMIT $" + (paged.length-1) + " OFFSET $" + paged.length, paged);
  return {items:result.rows,total:count.rows[0].total};
};

const listForAudience = async (schoolId,user,options,db) => {
  const client=resolveDb(db), role=String(user.role_name||user.role||"").toLowerCase();
  const audience=role==="student"?"students":role==="teacher"?"teachers":role==="parent"?"parents":"administrators";
  const values=[schoolId,user.id,audience];
  const target="((cardinality(a.class_ids)=0 AND cardinality(a.arm_ids)=0 AND cardinality(a.student_ids)=0 AND cardinality(a.parent_ids)=0) OR EXISTS (SELECT 1 FROM users ru JOIN students s ON s.id=ru.student_id AND s.school_id=ru.school_id WHERE ru.id=$2 AND ru.school_id=$1 AND s.school_id=a.school_id AND cardinality(a.parent_ids)=0 AND (cardinality(a.class_ids)=0 OR s.class_id=ANY(a.class_ids)) AND (cardinality(a.arm_ids)=0 OR s.arm_id=ANY(a.arm_ids)) AND (cardinality(a.student_ids)=0 OR s.id=ANY(a.student_ids))) OR EXISTS (SELECT 1 FROM parents p JOIN student_parents sp ON sp.parent_id=p.id JOIN students s ON s.id=sp.student_id AND s.school_id=p.school_id WHERE p.user_id=$2 AND p.school_id=$1 AND s.school_id=a.school_id AND (cardinality(a.parent_ids)=0 OR p.id=ANY(a.parent_ids)) AND (cardinality(a.class_ids)=0 OR s.class_id=ANY(a.class_ids)) AND (cardinality(a.arm_ids)=0 OR s.arm_id=ANY(a.arm_ids)) AND (cardinality(a.student_ids)=0 OR s.id=ANY(a.student_ids))))";
  const where=["a.school_id=$1","a.is_active=TRUE","a.publish_date<=CURRENT_DATE","(a.expiry_date IS NULL OR a.expiry_date>=CURRENT_DATE)","(a.audience='all' OR a.audience=$3)",target];
  if(options.q){values.push(options.q);where.push("(a.title ILIKE '%' || $"+values.length+" || '%' OR a.message ILIKE '%' || $"+values.length+" || '%')");}
  if(options.audience){values.push(options.audience);where.push("a.audience=$"+values.length);}
  if(options.pinned==="true")where.push("a.is_pinned=TRUE");
  if(options.pinned==="false")where.push("a.is_pinned=FALSE");
  if(options.read==="read")where.push("ar.read_at IS NOT NULL");
  if(options.read==="unread")where.push("ar.read_at IS NULL");
  const condition=where.join(" AND "), joins="LEFT JOIN announcement_reads ar ON ar.announcement_id=a.id AND ar.school_id=a.school_id AND ar.user_id=$2";
  const count=await client.query("SELECT COUNT(*)::int AS total FROM announcements a "+joins+" WHERE "+condition,values);
  const unread=await client.query("SELECT COUNT(*)::int AS total FROM announcements a "+joins+" WHERE a.school_id=$1 AND a.is_active=TRUE AND a.publish_date<=CURRENT_DATE AND (a.expiry_date IS NULL OR a.expiry_date>=CURRENT_DATE) AND (a.audience='all' OR a.audience=$3) AND "+target+" AND ar.read_at IS NULL",values.slice(0,3));
  const paged=values.concat([options.limit,(options.page-1)*options.limit]);
  const result=await client.query("SELECT a.id,a.title,a.message,a.audience,a.publish_date,a.expiry_date,a.created_at,a.is_pinned,a.attachment_url,a.attachment_name,a.class_ids,a.arm_ids,a.student_ids,(ar.read_at IS NOT NULL) AS is_read,ar.read_at FROM announcements a "+joins+" WHERE "+condition+" ORDER BY a.is_pinned DESC,a.publish_date DESC,a.created_at DESC,a.id DESC LIMIT $"+(paged.length-1)+" OFFSET $"+paged.length,paged);
  return {items:result.rows,total:count.rows[0].total,unread_count:unread.rows[0].total};
};

const updateAnnouncement=async(id,data,schoolId,db)=>{const r=await resolveDb(db).query("UPDATE announcements SET title=$1,message=$2,audience=$3,is_active=$4,publish_date=$5,expiry_date=$6,is_pinned=$7,attachment_url=$8,attachment_name=$9,class_ids=$10,arm_ids=$11,student_ids=$12,parent_ids=$13,updated_at=CURRENT_TIMESTAMP WHERE id=$14 AND school_id=$15 RETURNING *",[data.title,data.message,data.audience,data.is_active,data.publish_date,data.expiry_date,data.is_pinned,data.attachment_url,data.attachment_name,data.class_ids,data.arm_ids,data.student_ids,data.parent_ids,id,schoolId]);return r.rows[0];};
const deactivateAnnouncement=async(id,schoolId,db)=>{const r=await resolveDb(db).query("UPDATE announcements SET is_active=FALSE,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2 RETURNING *",[id,schoolId]);return r.rows[0];};
const setPinned=async(id,isPinned,schoolId,db)=>{const r=await resolveDb(db).query("UPDATE announcements SET is_pinned=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 AND school_id=$3 RETURNING id,is_pinned",[isPinned,id,schoolId]);return r.rows[0];};
const markRead=async(id,userId,schoolId,db)=>{const r=await resolveDb(db).query("INSERT INTO announcement_reads(school_id,announcement_id,user_id) SELECT $1,a.id,$3 FROM announcements a WHERE a.id=$2 AND a.school_id=$1 AND a.is_active=TRUE AND a.publish_date<=CURRENT_DATE AND (a.expiry_date IS NULL OR a.expiry_date>=CURRENT_DATE) ON CONFLICT(school_id,announcement_id,user_id) DO UPDATE SET read_at=CURRENT_TIMESTAMP RETURNING announcement_id,read_at",[schoolId,id,userId]);return r.rows[0];};
const getTargetOptions=async(schoolId,db)=>{const client=resolveDb(db);const [classes,students,parents]=await Promise.all([client.query("SELECT id,class_name FROM classes WHERE school_id=$1 ORDER BY sort_order NULLS LAST,class_name",[schoolId]),client.query("SELECT s.id,s.surname,s.first_name,s.middle_name,s.admission_number,s.class_id,s.arm_id,c.class_name,ar.arm_name FROM students s LEFT JOIN classes c ON c.id=s.class_id AND c.school_id=s.school_id LEFT JOIN arms ar ON ar.id=s.arm_id AND ar.school_id=s.school_id WHERE s.school_id=$1 AND LOWER(COALESCE(s.status,'active'))='active' ORDER BY c.sort_order NULLS LAST,c.class_name,ar.arm_name,s.surname,s.first_name",[schoolId]),client.query("SELECT p.id,p.surname,p.first_name,p.middle_name,STRING_AGG(DISTINCT CONCAT(s.surname,' ',s.first_name), ', ') AS children_names FROM parents p JOIN users u ON u.id=p.user_id AND u.school_id=p.school_id LEFT JOIN student_parents sp ON sp.parent_id=p.id LEFT JOIN students s ON s.id=sp.student_id AND s.school_id=p.school_id WHERE p.school_id=$1 GROUP BY p.id,p.surname,p.first_name,p.middle_name ORDER BY p.surname,p.first_name",[schoolId])]);const ids=classes.rows.map(x=>x.id);const arms=ids.length?await client.query("SELECT id,class_id,arm_name FROM arms WHERE school_id=$1 AND class_id=ANY($2::int[]) ORDER BY class_id,arm_name",[schoolId,ids]):{rows:[]};return {classes:classes.rows,arms:arms.rows,students:students.rows,parents:parents.rows};};
const validateTargets=async(data,schoolId,db)=>{const client=resolveDb(db);const [c,a,s,p]=await Promise.all([data.class_ids.length?client.query("SELECT id FROM classes WHERE school_id=$1 AND id=ANY($2::int[])",[schoolId,data.class_ids]):{rows:[]},data.arm_ids.length?client.query("SELECT id FROM arms WHERE school_id=$1 AND id=ANY($2::int[])",[schoolId,data.arm_ids]):{rows:[]},data.student_ids.length?client.query("SELECT id FROM students WHERE school_id=$1 AND id=ANY($2::int[])",[schoolId,data.student_ids]):{rows:[]},data.parent_ids.length?client.query("SELECT id FROM parents WHERE school_id=$1 AND id=ANY($2::int[])",[schoolId,data.parent_ids]):{rows:[]}]);if(c.rows.length!==data.class_ids.length||a.rows.length!==data.arm_ids.length||s.rows.length!==data.student_ids.length||p.rows.length!==data.parent_ids.length){const ApiError=require("../utils/ApiError");throw new ApiError(400,"One or more target selections do not belong to this school.");}};
module.exports={createAnnouncement,getAnnouncementsForManagement:listForManagement,getAnnouncementsForAudience:listForAudience,updateAnnouncement,deactivateAnnouncement,setPinned,markRead,getTargetOptions,validateTargets};