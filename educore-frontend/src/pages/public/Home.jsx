import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedGallery } from "@/api/galleryApi";
import { usePublishedNews, usePublishedEvents, useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import Loading from "@/components/common/Loading";
import api from "@/api/axios";

function Home() {
    const { data: page, isLoading } = useWebsitePage("home");
    const { data: settings } = useSchoolSettings();
    const { data: news = [] } = usePublishedNews();
    const { data: events = [] } = usePublishedEvents();
    const [gallery, setGallery] = useState([]);
    const [slide, setSlide] = useState(0);
    const [homepageContent, setHomepageContent] = useState({ testimonials: [], facilities: [], coreValues: [] });

    const primary = settings?.primary_color || "#082b59";
    const gold = settings?.secondary_color || "#f6b91a";
    const schoolName = settings?.school_name || "Our School";
    const sections = useMemo(() => (page?.sections || []).filter(s => s.is_active !== false), [page]);
    const get = key => sections.find(s => s.section_key === key) || {};
    const hero = get("hero");
    const about = get("welcome");
    const programs = get("school_levels");
    const why = get("why_choose");
    const facilities = get("facilities");
    const values = sections.filter(s => s.section_key?.startsWith("core_value_"));
    const programCards = sections.filter(s => s.section_key?.startsWith("school_level_") || ["primary", "junior_secondary", "senior_secondary"].includes(s.section_key));
    const featureCards = sections.filter(s => s.section_key?.startsWith("why_choose_") || ["quality_education", "caring_environment", "critical_thinking", "character_development"].includes(s.section_key));

    useEffect(() => {
        let active = true;
        getPublishedGallery().then(rows => { if (active) setGallery(Array.isArray(rows) ? rows : []); }).catch(() => {});
        Promise.all(["testimonials", "facilities", "coreValues"].map(type =>
            api.get("/website/homepage-content/" + type).then(response => [type, response.data?.data || []]).catch(() => [type, []])
        )).then(entries => { if (active) setHomepageContent(Object.fromEntries(entries)); });
        return () => { active = false; };
    }, []);

    const images = useMemo(() => gallery.filter(x => x.image_url), [gallery]);
    const heroSlides = useMemo(() => {
        if (hero.image_url) return [{ id: "hero", image_url: hero.image_url, title: hero.section_title || schoolName }];
        return images.filter(x => ["hero", "banner"].includes(String(x.category || "").toLowerCase())).slice(0, 5);
    }, [images, hero.image_url, hero.section_title, schoolName]);

    useEffect(() => { setSlide(0); }, [heroSlides.length]);
    useEffect(() => {
        if (heroSlides.length < 2) return undefined;
        const id = window.setInterval(() => setSlide(v => (v + 1) % heroSlides.length), 5000);
        return () => window.clearInterval(id);
    }, [heroSlides.length]);

    if (isLoading) return <Loading message="Loading website..." />;

    const legacyValues = sections.filter(s => s.section_key?.startsWith("core_value_") || ["quality_education","caring_environment","critical_thinking","character_development"].includes(s.section_key));
    const valuesToShow = (homepageContent.coreValues.length ? homepageContent.coreValues.map(v => [v.value_title, v.description, v.icon || "✦"]) : legacyValues.map(v => [v.section_title, v.section_content, "✦"])).slice(0,5);
    const programsToShow = programCards.slice(0,4);
    const featuresToShow = featureCards.slice(0,5).map(x => x.section_title || x.section_content);
    const facilitiesToShow = homepageContent.facilities.slice(0,6);
    const testimonialsToShow = homepageContent.testimonials.slice(0,3);
    const newsItems = news.slice(0, 3).map(x => ({ ...x, kind: "news" }));
    const eventItems = events.slice(0, 3).map(x => ({ ...x, kind: "event", published_at: x.event_date }));
    const updates = [...newsItems, ...eventItems].sort((a,b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)).slice(0,3);
    const dateLabel = value => value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

    return (
        <div className="gh-home" style={{ "--gh-primary": primary, "--gh-gold": gold }}>
            <style>{`
                .gh-home{color:#09234a;font-family:Georgia,'Times New Roman',serif;background:#fff}
                .gh-home *{box-sizing:border-box}
                .gh-wrap{width:min(100% - 48px,1200px);margin-inline:auto}
                .gh-kicker{font-size:14px;font-weight:700;color:var(--gh-gold)}
                .gh-title{font-size:clamp(23px,2.5vw,32px);line-height:1.06;font-weight:800;color:var(--gh-primary);letter-spacing:-.5px}
                .gh-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:30px;padding:10px 19px;font-size:12px;font-weight:800;text-decoration:none;transition:.2s}
                .gh-btn:hover{transform:translateY(-2px);filter:brightness(1.04)}
                .gh-hero{height:clamp(270px,29vw,360px);position:relative;overflow:hidden;background:var(--gh-primary);color:#fff}
                .gh-hero-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 38%}
                .gh-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,26,58,.98) 0%,rgba(3,26,58,.9) 35%,rgba(3,26,58,.28) 68%,rgba(3,26,58,.06) 100%)}
                .gh-hero-inner{position:relative;z-index:1;height:100%;display:flex;align-items:center}
                .gh-hero-copy{max-width:540px;padding:25px 0}
                .gh-hero h1{font-size:clamp(30px,4vw,48px);line-height:.98;font-weight:900;letter-spacing:-1px;margin:8px 0 12px;color:#fff}
                .gh-hero p{font-size:14px;line-height:1.55;max-width:430px;color:#fff}
                .gh-hero-controls{position:absolute;right:28px;bottom:16px;display:flex;gap:9px;z-index:2}
                .gh-arrow{height:34px;width:34px;border:1px solid var(--gh-gold);border-radius:50%;background:#09234a;color:white;font-size:22px;line-height:1}
                .gh-about{display:grid;grid-template-columns:1fr 1.35fr .62fr;gap:18px;align-items:stretch;padding-block:14px}
                .gh-about-copy{padding:5px 0 2px}
                .gh-about-copy p{font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#10294d;margin:9px 0}
                .gh-about-photo{width:100%;height:100%;min-height:215px;object-fit:cover;clip-path:polygon(8% 0,100% 0,100% 100%,0 100%)}
                .gh-values{border-radius:8px;background:#f0f2f7;padding:14px 15px}
                .gh-values h3{font-size:16px;font-weight:800;border-bottom:2px solid var(--gh-gold);padding-bottom:6px;margin:0 0 10px}
                .gh-value{display:flex;align-items:center;gap:10px;margin:9px 0;font-family:Arial,sans-serif}
                .gh-value-icon{font-size:20px;color:var(--gh-gold);width:25px;text-align:center}
                .gh-value strong{display:block;font-family:Georgia,serif;font-size:11px}
                .gh-value small{display:block;font-size:10px;color:#334155}
                .gh-programs{padding:12px 0 15px;background:#fafbfc}
                .gh-section-heading{text-align:center;margin-bottom:12px}
                .gh-heading-line{display:flex;align-items:center;justify-content:center;gap:18px}
                .gh-heading-line:before,.gh-heading-line:after{content:"";height:2px;width:clamp(35px,11vw,115px);background:var(--gh-gold)}
                .gh-section-heading p{font-family:Arial,sans-serif;font-size:11px;margin:6px 0;color:#10294d}
                .gh-program-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
                .gh-program{overflow:hidden;border:1px solid #dbe1e9;border-radius:7px;background:#fff;box-shadow:0 2px 5px #0b244015;text-align:center}
                .gh-program img,.gh-program-blank{display:block;width:100%;height:86px;object-fit:cover}
                .gh-program-blank{display:grid;place-items:center;background:#e8eef7;font-size:30px}
                .gh-program-body{position:relative;padding:20px 10px 9px}
                .gh-program-icon{position:absolute;top:-23px;left:50%;transform:translateX(-50%);height:43px;width:43px;border:4px solid white;border-radius:50%;display:grid;place-items:center;background:var(--gh-gold);font-size:20px}
                .gh-program h3{font-size:14px;font-weight:800;margin:0 0 4px}
                .gh-program p{font-family:Arial,sans-serif;font-size:11px;line-height:1.35;margin:0 auto 6px;max-width:180px}
                .gh-program a{font-size:10px;font-weight:800;color:var(--gh-primary);text-decoration:none}
                .gh-feature-facility{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding-block:0 12px}
                .gh-why{min-height:190px;position:relative;overflow:hidden;border-radius:7px;background:var(--gh-primary);color:#fff;padding:14px 18px}
                .gh-why-photo{position:absolute;right:0;top:0;width:48%;height:100%;object-fit:cover;mask-image:linear-gradient(90deg,transparent,#000 35%)}
                .gh-why-content{position:relative;z-index:1;max-width:65%}
                .gh-why h2{font-size:24px;line-height:1;font-weight:900;color:var(--gh-gold);margin:0 0 10px}
                .gh-why li{font-family:Arial,sans-serif;font-size:11px;line-height:1.65;list-style:none}
                .gh-facility{background:#f1f3f7;border-radius:8px;padding:10px 12px}
                .gh-facility-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}
                .gh-facility-item{background:#fff;border-radius:5px;overflow:hidden;box-shadow:0 1px 4px #0b244020;text-align:center;font-family:Arial,sans-serif;font-size:9px;font-weight:700}
                .gh-facility-item img{width:100%;height:43px;object-fit:cover;display:block}
                .gh-facility-item span{display:block;padding:4px 2px}
                .gh-updates{background:#f2f4f8;padding:13px 0}
                .gh-update-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
                .gh-update{overflow:hidden;background:#fff;border-radius:7px;box-shadow:0 2px 6px #0b24401c}
                .gh-update img{width:100%;height:48px;object-fit:cover;display:block}
                .gh-update-body{padding:7px 9px}
                .gh-update-date{font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#9a6b00}
                .gh-update h3{font-size:11px;line-height:1.2;margin:3px 0 5px;font-weight:800}
                .gh-update a{font-family:Arial,sans-serif;font-size:9px;font-weight:700;color:var(--gh-primary);text-decoration:none}
                .gh-testimonials{background:var(--gh-primary);color:white;padding:14px 0}
                .gh-testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
                .gh-testimonial{display:flex;gap:9px;align-items:center;background:#fff;color:#101f37;border-radius:7px;padding:9px;min-height:78px}
                .gh-testimonial img{height:55px;width:55px;border-radius:6px;object-fit:cover}
                .gh-testimonial p{font-family:Arial,sans-serif;font-size:9px;line-height:1.35;margin:0}
                .gh-testimonial strong{display:block;font-family:Georgia,serif;font-size:10px;margin-top:6px}
                @media(max-width:800px){.gh-wrap{width:min(100% - 30px,680px)}.gh-about{grid-template-columns:1fr 1fr}.gh-values{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,1fr);gap:2px}.gh-values h3{grid-column:1/-1}.gh-program-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.gh-feature-facility{grid-template-columns:1fr}.gh-why{min-height:220px}.gh-update-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
                @media(max-width:700px){.gh-updates .gh-wrap,.gh-testimonials .gh-wrap{grid-template-columns:1fr!important}.gh-testimonial-grid{grid-template-columns:1fr 1fr}}\n                @media(max-width:520px){.gh-wrap{width:calc(100% - 26px)}.gh-hero{height:380px}.gh-hero-shade{background:linear-gradient(90deg,rgba(3,26,58,.95),rgba(3,26,58,.55))}.gh-hero-copy{max-width:92%}.gh-hero h1{font-size:35px}.gh-hero-controls{right:13px;bottom:12px}.gh-about{grid-template-columns:1fr;padding-block:12px}.gh-about-photo{height:205px;min-height:0;clip-path:none;border-radius:6px}.gh-values{grid-template-columns:1fr 1fr}.gh-program-grid{gap:9px}.gh-program img,.gh-program-blank{height:90px}.gh-why-content{max-width:80%}.gh-why-photo{width:55%;opacity:.75}.gh-update-grid{grid-template-columns:1fr}.gh-testimonial-grid{grid-template-columns:1fr}}
            `}</style>

            <section className="gh-hero">
                {heroSlides.length > 0 && heroSlides.map((item, i) => <img key={item.id || item.image_url} src={item.image_url} alt={item.title || schoolName} className="gh-hero-photo" style={{opacity:i===slide?1:0,transition:"opacity .8s ease"}} />)}
                <div className="gh-hero-shade" />
                <div className="gh-wrap gh-hero-inner"><div className="gh-hero-copy">
                    <div className="gh-kicker">{hero.section_subtitle || `Welcome to ${schoolName}`}</div>
                    <h1>{hero.section_title || <>Building Bright Minds.<br/><span style={{color:gold}}>Shaping a Better Future.</span></>}</h1>
                    <p>{hero.section_content || "We provide world-class education, inspire excellence, and develop tomorrow's leaders."}</p>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:15}}>
                        <Link className="gh-btn" to={hero.button_url || "/about"} style={{background:gold,color:"#09234a"}}>{hero.button_text || "Explore Our School"} →</Link>
                        <Link className="gh-btn" to="/admissions" style={{border:"1px solid white",color:"white"}}>Apply for Admission</Link>
                    </div>
                </div></div>
                {heroSlides.length>1 && <div className="gh-hero-controls"><button className="gh-arrow" aria-label="Previous slide" onClick={()=>setSlide(v=>(v+heroSlides.length-1)%heroSlides.length)}>‹</button><button className="gh-arrow" aria-label="Next slide" onClick={()=>setSlide(v=>(v+1)%heroSlides.length)}>›</button></div>}
            </section>

            <section className="gh-wrap gh-about">
                <div className="gh-about-copy"><div className="gh-kicker">{about.section_subtitle || "About Our School"}</div><h2 className="gh-title" style={{marginTop:6}}>{about.section_title || "A Tradition of Excellence in Education"}</h2><p>{about.section_content || "We are committed to academic excellence, moral values, and holistic development. Our goal is to nurture confident, compassionate and outstanding individuals who will make a positive impact in society."}</p><Link className="gh-btn" to={about.button_url || "/about"} style={{background:primary,color:"#fff"}}>{about.button_text || "Learn More About Us"} →</Link></div>
                {about.image_url ? <img className="gh-about-photo" src={about.image_url} alt={about.section_title || schoolName}/> : <div className="gh-about-photo" style={{background:`linear-gradient(135deg,${primary},#8aa6c7)`}}/>}
                {valuesToShow.length > 0 && <aside className="gh-values"><h3>Our Core Values</h3>{valuesToShow.map(([title,desc,icon],i)=><div className="gh-value" key={title+i}><span className="gh-value-icon">{icon}</span><div><strong>{title}</strong><small>{desc}</small></div></div>)}</aside>}
            </section>

            <section className="gh-programs"><div className="gh-wrap"><div className="gh-section-heading"><div className="gh-heading-line"><h2 className="gh-title">{programs.section_title || "Our Academic Programs"}</h2></div><p>{programs.section_content || "From early years to higher education, we provide a complete learning journey."}</p></div>
                <div className="gh-program-grid">{programsToShow.map((item,i)=><article className="gh-program" key={item.id || item.section_key || item.section_title || i}>{item.image_url ? <img src={item.image_url} alt={item.section_title}/> : <div className="gh-program-blank">{item.icon || ["📚","🎓","🔬","⚽"][i]}</div>}<div className="gh-program-body"><span className="gh-program-icon">{["👥","🎓","⚗","⚽"][i]}</span><h3>{item.section_title}</h3><p>{item.section_content}</p><Link to={item.button_url || "/academics"}>{item.button_text || "Learn More"} →</Link></div></article>)}</div>
            </div></section>

            <section className="gh-wrap gh-feature-facility">
                <div className="gh-why"><h2>{why.section_title || "Why Choose Us?"}</h2>{why.image_url && <img className="gh-why-photo" src={why.image_url} alt="Students at school"/>}<div className="gh-why-content"><ul style={{padding:0,margin:0}}>{featuresToShow.map((label,i)=><li key={i}><span style={{color:gold,fontWeight:900,marginRight:7}}>●</span>{label}</li>)}</ul><Link className="gh-btn" to={why.button_url || "/about"} style={{background:gold,color:"#09234a",marginTop:12}}>{why.button_text || "Discover More"} →</Link></div></div>
                {facilitiesToShow.length > 0 && <div className="gh-facility"><h2 className="gh-title" style={{fontSize:22}}>{facilities.section_title || "Our Facilities"}</h2><p style={{fontFamily:"Arial,sans-serif",fontSize:11,margin:"4px 0"}}>{facilities.section_content || "Explore the facilities available at our school."}</p><div className="gh-facility-grid">{facilitiesToShow.map(item=><div className="gh-facility-item" key={item.id}>{item.image_url && <img src={item.image_url} alt={item.facility_name}/>}<span>{item.facility_name}</span></div>)}</div></div>}
            </section>

            {updates.length>0 && <section className="gh-updates"><div className="gh-wrap" style={{display:"grid",gridTemplateColumns:"minmax(150px,.75fr) 2.25fr",gap:15,alignItems:"center"}}><div><h2 className="gh-title">Latest News & Events</h2><p style={{fontFamily:"Arial,sans-serif",fontSize:11,lineHeight:1.5,margin:"7px 0"}}>Stay updated with our latest news, events and school activities.</p><Link className="gh-btn" to="/news" style={{background:primary,color:"#fff"}}>View All News →</Link></div><div className="gh-update-grid">{updates.map((item,i)=><article className="gh-update" key={item.kind+item.id}>{item.image_url && <img src={item.image_url} alt={item.title}/>}<div className="gh-update-body"><div className="gh-update-date">{dateLabel(item.published_at)}</div><h3>{item.title}</h3><Link to={item.kind==="event" ? `/events/${item.slug}` : `/news/${item.slug}`}>Read More →</Link></div></article>)}</div></div></section>}

            {testimonialsToShow.length>0 && <section className="gh-testimonials"><div className="gh-wrap" style={{display:"grid",gridTemplateColumns:"minmax(170px,.75fr) 2.25fr",gap:14,alignItems:"center"}}><div><h2 style={{fontSize:22,lineHeight:1.05,fontWeight:800}}>What Our Community Says</h2><p style={{fontFamily:"Arial,sans-serif",fontSize:11,marginTop:6,color:"#dbeafe"}}>Experiences shared by our school community.</p></div><div className="gh-testimonial-grid">{testimonialsToShow.map(item=><article className="gh-testimonial" key={item.id}>{item.image_url && <img src={item.image_url} alt={item.author_name}/>}<div><p>“{item.testimonial_text}”</p><strong>{item.author_name}</strong>{item.author_role && <small>{item.author_role}</small>}</div></article>)}</div></div></section>}
        </div>
    );
}
export default Home;
