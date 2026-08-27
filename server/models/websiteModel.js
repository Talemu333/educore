const pool = require("../config/database");

const getSchoolByDomain = async (domain) => {
    const result = await pool.query(
        `SELECT id, school_name, school_code, domain, logo, is_active
         FROM schools WHERE LOWER(domain)=LOWER($1) AND is_active=TRUE LIMIT 1`,
        [domain]
    );
    return result.rows[0];
};

const getPublishedPages = async (schoolId) => {
    const r = await pool.query(`SELECT id,page_slug,page_title,page_content,meta_title,meta_description,is_published FROM website_pages WHERE school_id=$1 AND is_published=TRUE ORDER BY id`,[schoolId]); return r.rows;
};
const getPageBySlug = async (slug,schoolId) => {
    const r=await pool.query(`SELECT id,page_slug,page_title,page_content,meta_title,meta_description,is_published FROM website_pages WHERE page_slug=$1 AND school_id=$2 AND is_published=TRUE LIMIT 1`,[slug,schoolId]); return r.rows[0];
};
const getPageSections = async (pageId,schoolId) => {
    const r=await pool.query(`SELECT ws.id,ws.page_id,ws.section_key,ws.section_title,ws.section_subtitle,ws.section_content,ws.image_url,ws.button_text,ws.button_url,ws.display_order,ws.is_active FROM website_sections ws JOIN website_pages wp ON wp.id=ws.page_id AND wp.school_id=$2 WHERE ws.page_id=$1 AND ws.school_id=$2 AND ws.is_active=TRUE ORDER BY ws.display_order,ws.id`,[pageId,schoolId]); return r.rows;
};
const getCompletePage = async (slug,schoolId) => { const p=await getPageBySlug(slug,schoolId); return p?{...p,sections:await getPageSections(p.id,schoolId)}:null; };
const getAllPages = async (schoolId) => { const r=await pool.query(`SELECT id,page_slug,page_title,page_content,meta_title,meta_description,is_published,created_at,updated_at FROM website_pages WHERE school_id=$1 ORDER BY id`,[schoolId]); return r.rows; };

const updatePage = async (pageId,data,schoolId) => {
    const client=await pool.connect();
    try {
        await client.query("BEGIN");
        const p=await client.query(`UPDATE website_pages SET page_title=$2,page_content=$3,meta_title=$4,meta_description=$5,is_published=$6,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$7 RETURNING *`,[pageId,data.page_title||"",data.page_content||"",data.meta_title||"",data.meta_description||"",data.is_published!==false,schoolId]);
        if(!p.rows.length){await client.query("ROLLBACK");return null;}
        const sections=Array.isArray(data.sections)?data.sections:[];
        const ids=sections.filter(s=>s.id).map(s=>Number(s.id));
        if(ids.length) await client.query(`DELETE FROM website_sections WHERE page_id=$1 AND school_id=$2 AND NOT(id=ANY($3::integer[]))`,[pageId,schoolId,ids]);
        else await client.query(`DELETE FROM website_sections WHERE page_id=$1 AND school_id=$2`,[pageId,schoolId]);
        for(let i=0;i<sections.length;i++){
            const s=sections[i],o=s.display_order??i;
            if(s.id) await client.query(`UPDATE website_sections SET section_key=$2,section_title=$3,section_subtitle=$4,section_content=$5,image_url=$6,button_text=$7,button_url=$8,display_order=$9,is_active=$10,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND page_id=$11 AND school_id=$12`,[Number(s.id),s.section_key||null,s.section_title||"",s.section_subtitle||null,s.section_content||null,s.image_url||null,s.button_text||null,s.button_url||null,o,s.is_active!==false,pageId,schoolId]);
            else await client.query(`INSERT INTO website_sections(page_id,school_id,section_key,section_title,section_subtitle,section_content,image_url,button_text,button_url,display_order,is_active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,[pageId,schoolId,s.section_key||null,s.section_title||"",s.section_subtitle||null,s.section_content||null,s.image_url||null,s.button_text||null,s.button_url||null,o,s.is_active!==false]);
        }
        await client.query("COMMIT");
        const updated=await client.query(`SELECT * FROM website_pages WHERE id=$1 AND school_id=$2`,[pageId,schoolId]);
        const sec=await client.query(`SELECT id,page_id,section_key,section_title,section_subtitle,section_content,image_url,button_text,button_url,display_order,is_active FROM website_sections WHERE page_id=$1 AND school_id=$2 ORDER BY display_order,id`,[pageId,schoolId]);
        return {...updated.rows[0],sections:sec.rows};
    } catch(e){await client.query("ROLLBACK");throw e;} finally{client.release();}
};
const getSectionsByPageId=async(pageId,schoolId)=>{const r=await pool.query(`SELECT ws.* FROM website_sections ws JOIN website_pages wp ON wp.id=ws.page_id AND wp.school_id=$2 WHERE ws.page_id=$1 AND ws.school_id=$2 ORDER BY ws.display_order,ws.id`,[pageId,schoolId]);return r.rows;};
const createSection=async(data,schoolId)=>{const r=await pool.query(`INSERT INTO website_sections(page_id,school_id,section_key,section_title,section_subtitle,section_content,image_url,button_text,button_url,display_order,is_active) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11 WHERE EXISTS(SELECT 1 FROM website_pages WHERE id=$1 AND school_id=$2) RETURNING *`,[data.page_id,schoolId,data.section_key,data.section_title||null,data.section_subtitle||null,data.section_content||null,data.image_url||null,data.button_text||null,data.button_url||null,data.display_order||0,data.is_active!==false]);return r.rows[0];};
const updateSection=async(id,data,schoolId)=>{const r=await pool.query(`UPDATE website_sections ws SET section_key=$2,section_title=$3,section_subtitle=$4,section_content=$5,image_url=$6,button_text=$7,button_url=$8,display_order=$9,is_active=$10,updated_at=CURRENT_TIMESTAMP WHERE ws.id=$1 AND ws.school_id=$11 AND EXISTS(SELECT 1 FROM website_pages wp WHERE wp.id=ws.page_id AND wp.school_id=$11) RETURNING ws.*`,[id,data.section_key,data.section_title||null,data.section_subtitle||null,data.section_content||null,data.image_url||null,data.button_text||null,data.button_url||null,data.display_order||0,data.is_active!==false,schoolId]);return r.rows[0];};
const deleteSection=async(id,schoolId)=>{const r=await pool.query(`DELETE FROM website_sections ws WHERE ws.id=$1 AND ws.school_id=$2 AND EXISTS(SELECT 1 FROM website_pages wp WHERE wp.id=ws.page_id AND wp.school_id=$2) RETURNING ws.*`,[id,schoolId]);return r.rows[0];};

const getPublishedNews=async(schoolId)=>{const r=await pool.query(`SELECT id,title,slug,excerpt,content,image_url,author,published_at,is_published,created_at,updated_at FROM news WHERE school_id=$1 AND is_published=TRUE ORDER BY published_at DESC NULLS LAST,created_at DESC,id DESC`,[schoolId]);return r.rows;};
const getNewsBySlug=async(slug,schoolId)=>{const r=await pool.query(`SELECT id,title,slug,excerpt,content,image_url,author,published_at,is_published,created_at,updated_at FROM news WHERE slug=$1 AND school_id=$2 AND is_published=TRUE LIMIT 1`,[slug,schoolId]);return r.rows[0];};
const getAllNews=async(schoolId)=>{const r=await pool.query(`SELECT id,title,slug,excerpt,content,image_url,author,published_at,is_published,created_at,updated_at FROM news WHERE school_id=$1 ORDER BY created_at DESC,id DESC`,[schoolId]);return r.rows;};
const createNews=async(data,schoolId)=>{const r=await pool.query(`INSERT INTO news(school_id,title,slug,excerpt,content,image_url,author,published_at,is_published) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[schoolId,data.title,data.slug,data.excerpt||null,data.content,data.image_url||null,data.author||null,data.published_at||null,data.is_published===true]);return r.rows[0];};
const updateNews=async(id,data,schoolId)=>{const r=await pool.query(`UPDATE news SET title=$2,slug=$3,excerpt=$4,content=$5,image_url=$6,author=$7,published_at=$8,is_published=$9,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$10 RETURNING *`,[id,data.title,data.slug,data.excerpt||null,data.content,data.image_url||null,data.author||null,data.published_at||null,data.is_published===true,schoolId]);return r.rows[0];};
const deleteNews=async(id,schoolId)=>{const r=await pool.query(`DELETE FROM news WHERE id=$1 AND school_id=$2 RETURNING *`,[id,schoolId]);return r.rows[0];};

const getPublishedEvents=async(schoolId)=>{const r=await pool.query(`SELECT id,title,slug,description,content,image_url,event_date,start_time,end_time,venue,organizer,is_published,created_at,updated_at FROM events WHERE school_id=$1 AND is_published=TRUE ORDER BY event_date,start_time`,[schoolId]);return r.rows;};
const getEventBySlug=async(slug,schoolId)=>{const r=await pool.query(`SELECT id,title,slug,description,content,image_url,event_date,start_time,end_time,venue,organizer,is_published,created_at,updated_at FROM events WHERE slug=$1 AND school_id=$2 AND is_published=TRUE LIMIT 1`,[slug,schoolId]);return r.rows[0];};
const getAllEvents=async(schoolId)=>{const r=await pool.query(`SELECT id,title,slug,description,content,image_url,event_date,start_time,end_time,venue,organizer,is_published,created_at,updated_at FROM events WHERE school_id=$1 ORDER BY event_date,start_time`,[schoolId]);return r.rows;};
const getEventById=async(id,schoolId)=>{const r=await pool.query(`SELECT id,title,slug,description,content,image_url,event_date,start_time,end_time,venue,organizer,is_published,created_at,updated_at FROM events WHERE id=$1 AND school_id=$2 LIMIT 1`,[id,schoolId]);return r.rows[0];};
const createEvent=async(data,schoolId)=>{const r=await pool.query(`INSERT INTO events(school_id,title,slug,description,content,image_url,event_date,start_time,end_time,venue,organizer,is_published) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[schoolId,data.title,data.slug,data.description||null,data.content||null,data.image_url||null,data.event_date,data.start_time||null,data.end_time||null,data.venue||null,data.organizer||null,data.is_published??false]);return r.rows[0];};
const updateEvent=async(id,data,schoolId)=>{const r=await pool.query(`UPDATE events SET title=$1,slug=$2,description=$3,content=$4,image_url=$5,event_date=$6,start_time=$7,end_time=$8,venue=$9,organizer=$10,is_published=$11,updated_at=CURRENT_TIMESTAMP WHERE id=$12 AND school_id=$13 RETURNING *`,[data.title,data.slug,data.description||null,data.content||null,data.image_url||null,data.event_date,data.start_time||null,data.end_time||null,data.venue||null,data.organizer||null,data.is_published??false,id,schoolId]);return r.rows[0];};
const deleteEvent=async(id,schoolId)=>{const r=await pool.query(`DELETE FROM events WHERE id=$1 AND school_id=$2 RETURNING *`,[id,schoolId]);return r.rows[0];};

const getPublishedGallery=async(schoolId)=>{const r=await pool.query(`SELECT id,title,description,image_url,category,display_order,is_published,created_at,updated_at FROM gallery WHERE school_id=$1 AND is_published=TRUE ORDER BY display_order,id`,[schoolId]);return r.rows;};
const getAllGallery=async(schoolId)=>{const r=await pool.query(`SELECT id,title,description,image_url,category,display_order,is_published,created_at,updated_at FROM gallery WHERE school_id=$1 ORDER BY display_order,id`,[schoolId]);return r.rows;};
const getGalleryById=async(id,schoolId)=>{const r=await pool.query(`SELECT id,title,description,image_url,category,display_order,is_published,created_at,updated_at FROM gallery WHERE id=$1 AND school_id=$2 LIMIT 1`,[id,schoolId]);return r.rows[0];};
const createGallery=async(data,schoolId)=>{const r=await pool.query(`INSERT INTO gallery(school_id,title,description,image_url,category,display_order,is_published) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[schoolId,data.title,data.description||null,data.image_url,data.category||null,data.display_order??0,data.is_published!==false]);return r.rows[0];};
const updateGallery=async(id,data,schoolId)=>{const r=await pool.query(`UPDATE gallery SET title=$2,description=$3,image_url=$4,category=$5,display_order=$6,is_published=$7,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$8 RETURNING *`,[id,data.title,data.description||null,data.image_url,data.category||null,data.display_order??0,data.is_published!==false,schoolId]);return r.rows[0];};
const deleteGallery=async(id,schoolId)=>{const r=await pool.query(`DELETE FROM gallery WHERE id=$1 AND school_id=$2 RETURNING *`,[id,schoolId]);return r.rows[0];};

module.exports={getSchoolByDomain,getPublishedPages,getPageBySlug,getPageSections,getCompletePage,getAllPages,updatePage,getSectionsByPageId,createSection,updateSection,deleteSection,getPublishedNews,getNewsBySlug,getAllNews,createNews,updateNews,deleteNews,getPublishedEvents,getEventBySlug,getAllEvents,getEventById,createEvent,updateEvent,deleteEvent,getPublishedGallery,getAllGallery,getGalleryById,createGallery,updateGallery,deleteGallery};