import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedGallery } from "@/api/galleryApi";
import { usePublishedNews, usePublishedEvents, useWebsitePage } from "@/hooks/useWebsite";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import Loading from "@/components/common/Loading";

const fallbackValues = [
    { section_title: "Excellence", section_content: "In all we do", section_icon: "🏆" },
    { section_title: "Integrity", section_content: "In our actions", section_icon: "♥" },
    { section_title: "Compassion", section_content: "In our relationships", section_icon: "✦" },
    { section_title: "Innovation", section_content: "In our approach", section_icon: "✧" },
    { section_title: "Service", section_content: "To our community", section_icon: "◎" }
];

function Home() {
    const { data: page, isLoading, isError } = useWebsitePage("home");
    const { data: settings } = useSchoolSettings();
    const { data: news = [] } = usePublishedNews();
    const { data: events = [] } = usePublishedEvents();
    const [gallery, setGallery] = useState([]);
    const [slide, setSlide] = useState(0);
    const [paused, setPaused] = useState(false);

    const primary = settings?.primary_color || "#082b59";
    const secondary = settings?.secondary_color || "#f6b91a";
    const schoolName = settings?.school_name || "Our School";
    const sections = useMemo(() => (page?.sections || []).filter(item => item.is_active !== false), [page]);
    const section = key => sections.find(item => item.section_key === key) || {};
    const hero = section("hero");
    const about = section("welcome");
    const programmes = section("school_levels");
    const why = section("why_choose");
    const facilities = section("facilities");
    const testimonials = sections.filter(item => item.section_key?.startsWith("testimonial_"));
    const values = sections.filter(item => item.section_key?.startsWith("core_value_"));
    const programmeCards = sections.filter(item =>
        item.section_key?.startsWith("school_level_") ||
        ["primary", "junior_secondary", "senior_secondary"].includes(item.section_key)
    );
    const features = sections.filter(item =>
        item.section_key?.startsWith("why_choose_") ||
        ["quality_education", "caring_environment", "critical_thinking", "character_development"].includes(item.section_key)
    );

    useEffect(() => {
        let mounted = true;
        getPublishedGallery()
            .then(items => { if (mounted) setGallery(Array.isArray(items) ? items : []); })
            .catch(() => { if (mounted) setGallery([]); });
        return () => { mounted = false; };
    }, []);

    const slides = useMemo(() => {
        const images = gallery.filter(item => item.image_url).slice(0, 5);
        if (images.length) return images;
        return hero.image_url ? [{ id: "hero-image", image_url: hero.image_url, title: schoolName }] : [];
    }, [gallery, hero.image_url, schoolName]);

    useEffect(() => { setSlide(0); }, [slides.length]);
    useEffect(() => {
        if (slides.length < 2 || paused) return undefined;
        const timer = window.setInterval(() => setSlide(value => (value + 1) % slides.length), 5500);
        return () => window.clearInterval(timer);
    }, [slides.length, paused]);

    if (isLoading) return <Loading message="Loading website..." />;

    const valuesToShow = values.length ? values : fallbackValues;
    const programmesToShow = programmeCards.length ? programmeCards : [
        { id: "p1", section_title: "Nursery & Primary", section_content: "Building strong educational foundations." },
        { id: "p2", section_title: "Secondary Education", section_content: "Preparing students for future success." },
        { id: "p3", section_title: "Science & Technology", section_content: "Encouraging innovation and discovery." },
        { id: "p4", section_title: "Sports & Extracurricular", section_content: "Developing talents beyond the classroom." }
    ];
    const featuresToShow = features.length ? features : [
        { id: "f1", section_title: "Qualified Teachers", section_content: "Highly qualified and experienced teachers." },
        { id: "f2", section_title: "Modern Facilities", section_content: "Modern and well-equipped facilities." },
        { id: "f3", section_title: "Safe Environment", section_content: "A safe and secure learning environment." },
        { id: "f4", section_title: "Academic Excellence", section_content: "Excellent academic standards and support." }
    ];
    const latestNews = news.slice(0, 3);
    const latestEvents = events.slice(0, 3);
    const facilityImages = gallery.filter(item => item.image_url && !slides.slice(0, 1).some(heroItem => heroItem.id === item.id)).slice(0, 6);
    const formatDate = value => value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

    return (
        <div className="eduprow-reference-home w-full overflow-hidden bg-white" style={{ "--home-primary": primary, "--home-secondary": secondary }}>
            {isError && <p className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">Some homepage content is shown using editable defaults.</p>}

            <section className="relative min-h-[430px] overflow-hidden bg-slate-950 text-white sm:min-h-[500px] lg:min-h-[540px]"
                onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                {slides.length > 0 ? slides.map((item, index) => (
                    <img key={item.id || item.image_url} src={item.image_url} alt={item.title || schoolName}
                        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${index === slide ? "opacity-100" : "opacity-0"}`} />
                )) : <div className="absolute inset-0" style={{ background: `linear-gradient(110deg, ${primary}, #06172f)` }} />}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/10" />
                <div className="relative mx-auto flex min-h-[430px] max-w-7xl items-center px-5 py-16 sm:min-h-[500px] sm:px-8 lg:min-h-[540px] lg:px-12">
                    <div className="max-w-2xl">
                        <p className="text-sm font-bold text-amber-300 sm:text-base">{hero.section_subtitle || `Welcome to ${schoolName}`}</p>
                        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                            {hero.section_title || <>Building Bright Minds.<br /><span style={{ color: secondary }}>Shaping a Better Future.</span></>}
                        </h1>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-white/90 sm:text-lg sm:leading-8">
                            {hero.section_content || "We provide quality education, inspire excellence, and develop tomorrow's leaders."}
                        </p>
                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link to={hero.button_url || "/about"} className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition hover:-translate-y-0.5" style={{ backgroundColor: secondary }}>
                                {hero.button_text || "Explore Our School"} <span className="ml-2">→</span>
                            </Link>
                            <Link to="/admissions" className="inline-flex items-center justify-center rounded-full border border-white/80 px-7 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-slate-900">Apply for Admission</Link>
                        </div>
                    </div>
                </div>
                {slides.length > 1 && <div className="absolute bottom-5 right-5 z-10 flex gap-2 sm:right-8">
                    <button type="button" aria-label="Previous slide" onClick={() => setSlide(value => (value + slides.length - 1) % slides.length)} className="h-10 w-10 rounded-full border border-amber-300 text-xl text-white hover:bg-white/15">‹</button>
                    <button type="button" aria-label="Next slide" onClick={() => setSlide(value => (value + 1) % slides.length)} className="h-10 w-10 rounded-full border border-amber-300 text-xl text-white hover:bg-white/15">›</button>
                </div>}
            </section>

            <section className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:px-8 lg:grid-cols-[1.05fr_1.45fr_.7fr] lg:items-stretch lg:px-8">
                <div className="flex flex-col justify-center py-3">
                    <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: secondary }}>{about.section_subtitle || "About Our School"}</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl" style={{ color: primary }}>{about.section_title || "A Tradition of Excellence in Education"}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{about.section_content || "We are committed to academic excellence, strong values and the holistic development of every learner."}</p>
                    <Link to={about.button_url || "/about"} className="mt-4 inline-flex w-fit rounded-full px-5 py-2.5 text-xs font-bold text-white" style={{ backgroundColor: primary }}>{about.button_text || "Learn More About Us"} →</Link>
                </div>
                {about.image_url ? <img src={about.image_url} alt={about.section_title || schoolName} className="h-64 w-full rounded-lg object-cover shadow-md sm:h-80 lg:h-full lg:min-h-[270px]" /> :
                    <div className="flex min-h-64 items-center justify-center rounded-lg p-6 text-center text-sm text-white" style={{ background: `linear-gradient(135deg, ${primary}, #42658b)` }}>Add a school or campus photograph to the About section</div>}
                <aside className="rounded-lg bg-slate-100 p-5">
                    <h3 className="border-b-2 pb-2 text-lg font-black" style={{ color: primary, borderColor: secondary }}>Our Core Values</h3>
                    <div className="mt-3 space-y-3">
                        {valuesToShow.slice(0, 5).map((item, index) => <div key={item.id || item.section_key || index} className="flex items-center gap-3">
                            <span className="text-xl" style={{ color: secondary }}>{item.section_icon || ["🏆", "♥", "✦", "✧", "◎"][index]}</span>
                            <div><p className="text-sm font-bold text-slate-900">{item.section_title}</p><p className="text-xs text-slate-600">{item.section_content}</p></div>
                        </div>)}
                    </div>
                </aside>
            </section>

            <section className="bg-slate-50 px-5 py-9 sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center">
                        <h2 className="text-2xl font-black sm:text-3xl" style={{ color: primary }}>{programmes.section_title || "Our Academic Programmes"}</h2>
                        <p className="mt-2 text-sm text-slate-600">{programmes.section_content || "From early years to higher education, we provide a complete learning journey."}</p>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {programmesToShow.slice(0, 4).map((item, index) => <article key={item.id || item.section_key || index} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            {item.image_url ? <img src={item.image_url} alt={item.section_title} className="h-32 w-full object-cover sm:h-36" /> : <div className="flex h-32 items-center justify-center text-4xl" style={{ backgroundColor: `${primary}12` }}>{["📚", "🎓", "🔬", "⚽"][index]}</div>}
                            <div className="p-4 text-center"><span className="mx-auto -mt-9 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-xl" style={{ backgroundColor: secondary }}>{["👥", "🎓", "⚗", "⚽"][index]}</span>
                                <h3 className="mt-2 text-base font-extrabold" style={{ color: primary }}>{item.section_title || "Academic Programme"}</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-600">{item.section_content || "Discover this learning programme."}</p>
                                <Link to={item.button_url || "/academics"} className="mt-3 inline-block text-xs font-bold" style={{ color: primary }}>{item.button_text || "Learn More"} →</Link>
                            </div>
                        </article>)}
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:px-8 lg:grid-cols-2 lg:px-8">
                <div className="relative overflow-hidden rounded-lg p-6 text-white sm:p-8" style={{ background: `linear-gradient(110deg, ${primary}, #06172f)` }}>
                    <h2 className="text-2xl font-black" style={{ color: secondary }}>{why.section_title || "Why Choose Us?"}</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/80">{why.section_content || "A supportive environment where learners are challenged, encouraged and prepared for the future."}</p>
                    <ul className="mt-4 space-y-2">{featuresToShow.slice(0, 5).map((item, index) => <li key={item.id || item.section_key || index} className="flex items-start gap-2 text-sm"><span className="font-black" style={{ color: secondary }}>✓</span><span>{item.section_title || item.section_content}</span></li>)}</ul>
                    <Link to={why.button_url || "/about"} className="mt-5 inline-flex rounded-full px-5 py-2.5 text-xs font-extrabold text-slate-950" style={{ backgroundColor: secondary }}>{why.button_text || "Discover More"} →</Link>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 sm:p-5">
                    <h2 className="text-xl font-black" style={{ color: primary }}>{facilities.section_title || "Our Facilities"}</h2>
                    <p className="mt-1 text-xs text-slate-600">{facilities.section_content || "Facilities that support learning, creativity and development."}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {facilityImages.length ? facilityImages.map((item, index) => <div key={item.id || index} className="overflow-hidden rounded-md bg-white shadow-sm"><img src={item.image_url} alt={item.title || "School facility"} className="h-20 w-full object-cover" /><p className="px-2 py-2 text-center text-[11px] font-bold text-slate-800">{item.title || "School Facility"}</p></div>) :
                            ["Modern Classrooms", "Science Laboratories", "Computer Labs", "Library", "Sports Complex", "Hostel"].map((label, index) => <div key={label} className="flex h-20 items-center justify-center rounded-md bg-white p-2 text-center text-xs font-bold text-slate-700 shadow-sm"><span className="mr-1">{["🏫", "🔬", "💻", "📚", "⚽", "🏠"][index]}</span>{label}</div>)}
                    </div>
                </div>
            </section>

            {(latestNews.length > 0 || latestEvents.length > 0) && <section className="bg-slate-50 px-5 py-8 sm:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[.8fr_2.2fr]">
                    <div><h2 className="text-2xl font-black" style={{ color: primary }}>Latest News & Events</h2><p className="mt-2 text-sm leading-6 text-slate-600">Stay updated with our latest news, events and school activities.</p><Link to="/news" className="mt-4 inline-flex rounded-full px-5 py-2 text-xs font-bold text-white" style={{ backgroundColor: primary }}>View All News →</Link></div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {[...latestNews.map(item => ({ ...item, itemType: "news" })), ...latestEvents.map(item => ({ ...item, itemType: "event", published_at: item.event_date }))].slice(0, 3).map((item, index) => <article key={`${item.itemType}-${item.id}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            {item.image_url && <img src={item.image_url} alt={item.title} className="h-24 w-full object-cover" />}
                            <div className="p-3"><p className="text-[10px] font-bold uppercase" style={{ color: secondary }}>{formatDate(item.published_at)}</p><h3 className="mt-1 line-clamp-2 text-sm font-extrabold" style={{ color: primary }}>{item.title}</h3><Link to={item.itemType === "event" ? `/events/${item.slug}` : `/news/${item.slug}`} className="mt-2 inline-block text-[11px] font-bold" style={{ color: primary }}>Read More →</Link></div>
                        </article>)}
                    </div>
                </div>
            </section>}

            {testimonials.length > 0 && <section className="px-5 py-8 sm:px-8" style={{ backgroundColor: primary }}>
                <div className="mx-auto max-w-7xl"><h2 className="text-2xl font-black text-white">What Parents and Students Say</h2><p className="mt-1 text-sm text-white/75">Our community's trust inspires us to do more.</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">{testimonials.slice(0, 3).map((item, index) => <article key={item.id || item.section_key || index} className="rounded-lg bg-white p-4 text-slate-800 shadow"><p className="text-sm italic">“{item.section_content}”</p><p className="mt-3 text-xs font-extrabold">{item.section_title}</p></article>)}</div>
                </div>
            </section>}
        </div>
    );
}

export default Home;
