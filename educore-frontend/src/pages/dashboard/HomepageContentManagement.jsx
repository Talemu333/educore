import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, MessageSquareQuote, Building2, Heart } from "lucide-react";
import { getHomepageContent, createHomepageContent, updateHomepageContent, deleteHomepageContent } from "@/api/websiteApi";

const MODULES = {
    testimonials: { label: "Testimonials", singular: "Testimonial", icon: MessageSquareQuote, fields: [
        ["author_name","Name of person","text",true],["author_role","Relationship / designation","text"],["testimonial_text","Testimonial","textarea",true],["image_url","Photo URL","url"],["rating","Rating (1–5)","number"],["display_order","Display order","number"]
    ]},
    facilities: { label: "Facilities", singular: "Facility", icon: Building2, fields: [
        ["facility_name","Facility name","text",true],["description","Description","textarea"],["image_url","Image URL","url"],["display_order","Display order","number"]
    ]},
    coreValues: { label: "Core Values", singular: "Core Value", icon: Heart, fields: [
        ["value_title","Value title","text",true],["description","Description","textarea"],["icon","Icon name (optional)","text"],["display_order","Display order","number"]
    ]}
};
const emptyForm = type => Object.fromEntries([...MODULES[type].fields.map(([key]) => [key, key === "display_order" ? 0 : ""]),["is_published",false]]);

export default function HomepageContentManagement() {
    const [type,setType] = useState("testimonials");
    const [editing,setEditing] = useState(null);
    const [form,setForm] = useState(emptyForm("testimonials"));
    const queryClient = useQueryClient();
    const {data:items=[],isLoading,isError} = useQuery({queryKey:["homepage-content-admin",type],queryFn:()=>getHomepageContent(type)});
    const save = useMutation({
        mutationFn:()=>editing ? updateHomepageContent(type,editing,form) : createHomepageContent(type,form),
        onSuccess:()=>{queryClient.invalidateQueries({queryKey:["homepage-content-admin",type]});queryClient.invalidateQueries({queryKey:["homepage-content"]});setEditing(null);setForm(emptyForm(type));toast.success("Homepage content saved.");},
        onError:error=>toast.error(error?.response?.data?.message || "Could not save this item.")
    });
    const remove = useMutation({
        mutationFn:id=>deleteHomepageContent(type,id),
        onSuccess:()=>{queryClient.invalidateQueries({queryKey:["homepage-content-admin",type]});toast.success("Item deleted.");},
        onError:()=>toast.error("Could not delete this item.")
    });
    const chooseType = next => {setType(next);setEditing(null);setForm(emptyForm(next));};
    const edit = item => {setEditing(item.id);setForm(Object.fromEntries([...MODULES[type].fields.map(([key])=>[key,item[key] ?? (key==="display_order"?0:"")]),["is_published",item.is_published===true]]));};
    const submit = event => {event.preventDefault();const payload={...form};MODULES[type].fields.forEach(([key,,kind])=>{if(kind==="number" && payload[key] !== "")payload[key]=Number(payload[key]);});save.mutate(payload);};
    const config=MODULES[type];
    return <div className="space-y-6">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">School website</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Homepage Content</h1><p className="mt-1 text-sm text-slate-600">Manage the testimonials, facilities and core values displayed on your school's homepage.</p></div>
        <div className="flex flex-wrap gap-2">{Object.entries(MODULES).map(([key,module])=>{const Icon=module.icon;return <button key={key} onClick={()=>chooseType(key)} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${type===key?"border-blue-800 bg-blue-900 text-white":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><Icon size={16}/>{module.label}</button>;})}</div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900">Saved {config.label}</h2><span className="text-xs text-slate-500">{items.length} item(s)</span></div>
                {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading content…</p> : isError ? <p className="py-8 text-center text-sm text-red-600">Could not load this content. Refresh and try again.</p> : items.length===0 ? <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">No {config.label.toLowerCase()} have been added yet.</p> :
                <div className="space-y-3">{items.map(item=><article key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-slate-900">{item.author_name || item.facility_name || item.value_title}</h3><p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-slate-600">{item.testimonial_text || item.description || item.author_role || "No description added."}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.is_published?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{item.is_published?"Published":"Draft"}</span></div><div className="flex shrink-0 gap-1"><button title="Edit" onClick={()=>edit(item)} className="rounded-md p-2 text-blue-700 hover:bg-blue-50"><Pencil size={16}/></button><button title="Delete" onClick={()=>{if(window.confirm("Delete this item?"))remove.mutate(item.id);}} className="rounded-md p-2 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div></div>
                </article>)}</div>}
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900">{editing?"Edit":"Add"} {config.singular}</h2>{editing && <button onClick={()=>{setEditing(null);setForm(emptyForm(type));}} className="text-xs font-semibold text-slate-500">Cancel edit</button>}</div>
                <form onSubmit={submit} className="space-y-4">
                    {config.fields.map(([key,label,kind,required])=><label key={key} className="block"><span className="mb-1 block text-sm font-medium text-slate-700">{label}{required?" *":""}</span>{kind==="textarea"?<textarea required={required} rows={4} value={form[key]??""} onChange={e=>setForm(old=>({...old,[key]:e.target.value}))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"/>:<input required={required} type={kind} min={key==="rating"?1:undefined} max={key==="rating"?5:undefined} value={form[key]??""} onChange={e=>setForm(old=>({...old,[key]:e.target.value}))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"/>}</label>)}
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.is_published===true} onChange={e=>setForm(old=>({...old,is_published:e.target.checked}))}/> Publish on school homepage</label>
                    <button disabled={save.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"><Plus size={16}/>{save.isPending?"Saving…":editing?"Update item":"Save item"}</button>
                </form>
            </section>
        </div>
    </div>;
}
