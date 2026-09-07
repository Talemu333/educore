import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, FileQuestion, Play, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const ACTIVE_ATTEMPT_KEY="educore_active_cbt_attempt";
const attemptAnswersKey=id=>`educore_cbt_answers_${id}`;
const formatTime=seconds=>{const safe=Math.max(0,Number(seconds)||0),minutes=Math.floor(safe/60),remaining=safe%60;return `${String(minutes).padStart(2,"0")}:${String(remaining).padStart(2,"0")}`;};
const formatDate=value=>value?new Date(value).toLocaleString():"—";
function readSavedAttemptId(){try{const id=Number(window.localStorage.getItem(ACTIVE_ATTEMPT_KEY));return Number.isInteger(id)&&id>0?id:null;}catch{return null;}}
function saveActiveAttempt(id){try{window.localStorage.setItem(ACTIVE_ATTEMPT_KEY,String(id));}catch{}}
function clearActiveAttempt(){try{window.localStorage.removeItem(ACTIVE_ATTEMPT_KEY);}catch{}}
function readSavedAnswers(id){try{const raw=window.localStorage.getItem(attemptAnswersKey(id));return raw?JSON.parse(raw):{};}catch{return {};}}
function saveAnswers(id,answers){try{window.localStorage.setItem(attemptAnswersKey(id),JSON.stringify(answers));}catch{}}
function clearSavedAnswers(id){try{window.localStorage.removeItem(attemptAnswersKey(id));}catch{}}

function StudentCBTPage(){
 const navigate=useNavigate();
 const [exams,setExams]=useState([]),[history,setHistory]=useState([]),[exam,setExam]=useState(null),[attempt,setAttempt]=useState(null),[answers,setAnswers]=useState({}),[result,setResult]=useState(null);
 const [loading,setLoading]=useState(true),[starting,setStarting]=useState(false),[submitting,setSubmitting]=useState(false),[currentQuestion,setCurrentQuestion]=useState(0),[remainingSeconds,setRemainingSeconds]=useState(0);
 const submittingRef=useRef(false);

 const loadPortal=async()=>{setLoading(true);try{const[er,ar]=await Promise.all([api.get("/cbt/exams/available"),api.get("/cbt/my-attempts")]);setExams(er.data?.data||[]);setHistory(ar.data?.data||[]);}catch(e){toast.error(e.response?.data?.message||"Unable to load CBT examinations.");}finally{setLoading(false);}};

 const loadExamForAttempt=async(examId,attemptId)=>{
   try{
     const response=await api.get(`/cbt/exams/available/${examId}?attemptId=${attemptId}`);
     const data=response.data?.data;
     if(!data)return null;
     if(!Array.isArray(data.questions)||data.questions.length===0){
       throw new Error("The examination attempt was created, but no questions were returned.");
     }
     return data;
   }catch(e){
     console.error("CBT question loading failed",{url:e.config?.url,status:e.response?.status,response:e.response?.data,error:e});
     const message=e.response?.data?.message||e.message||"Unable to load the examination questions.";
     throw new Error(`Exam started, but the questions could not be loaded: ${message}`);
   }
 };

 const loadAttempt=async(id)=>{
   try{
     const r=await api.get("/cbt/my-attempts"),saved=(r.data?.data||[]).find(x=>Number(x.id)===Number(id)&&x.status==="in_progress");
     if(!saved){clearActiveAttempt();return false;}
     const expiresAt=Date.parse(saved.expires_at);
     if(!Number.isFinite(expiresAt)){clearActiveAttempt();clearSavedAnswers(saved.id);return false;}
     if(expiresAt<=Date.now()){try{await api.post(`/cbt/attempts/${saved.id}/submit`);}catch{}clearActiveAttempt();clearSavedAnswers(saved.id);await loadPortal();return false;}
     const loadedExam=await loadExamForAttempt(saved.exam_id,saved.id);
     if(!loadedExam)return false;
     setAttempt(saved);setExam(loadedExam);setAnswers(readSavedAnswers(saved.id));setCurrentQuestion(0);return true;
   }catch(e){
     console.error("CBT resume failed",e);
     toast.error(e.response?.data?.message||e.message||"Unable to resume your CBT attempt.");
     return false;
   }
 };

 useEffect(()=>{(async()=>{await loadPortal();const id=readSavedAttemptId();if(id)await loadAttempt(id);})();},[]);

 useEffect(()=>{
   if(!attempt?.expires_at){setRemainingSeconds(0);return;}
   const expiresAt=Date.parse(attempt.expires_at);
   if(!Number.isFinite(expiresAt)){setRemainingSeconds(0);return;}
   let active=true;
   let timeoutId;
   const update=()=>{
     if(!active)return;
     const seconds=Math.max(0,Math.ceil((expiresAt-Date.now())/1000));
     setRemainingSeconds(seconds);
     if(seconds<=0&&!submittingRef.current)handleSubmitAttempt(true);
   };
   update();
   const intervalId=window.setInterval(update,1000);
   const delay=Math.max(0,expiresAt-Date.now())+50;
   timeoutId=window.setTimeout(()=>{if(!submittingRef.current)handleSubmitAttempt(true);},delay);
   return()=>{active=false;window.clearInterval(intervalId);window.clearTimeout(timeoutId);};
 },[attempt?.id,attempt?.expires_at]);

 const answeredCount=useMemo(()=>Object.values(answers).filter(Boolean).length,[answers]);

 const startExam=async(selected)=>{
   setStarting(true);
   try{
     const r=await api.get("/cbt/my-attempts");
     const existing=(r.data?.data||[]).find(x=>Number(x.exam_id)===Number(selected.id)&&x.status==="in_progress");
     if(existing){
       saveActiveAttempt(existing.id);
       const resumed=await loadAttempt(existing.id);
       if(resumed)return;
     }

     const ar=await api.post(`/cbt/exams/${selected.id}/start`);
     const a=ar.data?.data;
     if(!a||a.status!=="in_progress"||!a.expires_at||Date.parse(a.expires_at)<=Date.now()){
       throw new Error("The examination server returned an invalid or expired attempt. Please try again.");
     }

     saveActiveAttempt(a.id);
     clearSavedAnswers(a.id);

     // The backend now returns the exact question set with the newly-created attempt.
     // This removes the old start -> second GET race.
     const loadedExam=a.exam;
     if(!loadedExam||!Array.isArray(loadedExam.questions)||loadedExam.questions.length===0){
       const fallback=await loadExamForAttempt(selected.id,a.id);
       if(!fallback)throw new Error("The examination started, but no questions were returned.");
       setAttempt(a);setExam(fallback);setAnswers({});setCurrentQuestion(0);setRemainingSeconds(Math.max(0,Math.ceil((Date.parse(a.expires_at)-Date.now())/1000)));return;
     }

     setAttempt(a);setExam(loadedExam);setAnswers({});setCurrentQuestion(0);setRemainingSeconds(Math.max(0,Math.ceil((Date.parse(a.expires_at)-Date.now())/1000)));
   }catch(e){
     console.error("CBT start flow failed",{url:e.config?.url,status:e.response?.status,response:e.response?.data,error:e});
     toast.error(e.response?.data?.message||e.message||"Unable to start examination.");
   }finally{setStarting(false);}
 };

 const chooseAnswer=async(q,optionId)=>{
   if(!attempt||!q||submittingRef.current)return;
   setAnswers(prev=>{const next={...prev,[q.id]:optionId};saveAnswers(attempt.id,next);return next;});
   try{await api.post(`/cbt/attempts/${attempt.id}/answers`,{question_id:q.id,selected_option_id:optionId});}
   catch(e){toast.error(e.response?.data?.message||"Unable to save your answer.");}
 };

 async function handleSubmitAttempt(auto=false){
   if(!attempt||submittingRef.current)return;
   submittingRef.current=true;
   setSubmitting(true);
   try{
     const r=await api.post(`/cbt/attempts/${attempt.id}/submit`);
     clearActiveAttempt();clearSavedAnswers(attempt.id);
     if(auto)toast("Time is up. Your examination has been submitted automatically.");else toast.success("Examination submitted successfully.");
     setAttempt(null);setExam(null);setAnswers({});setRemainingSeconds(0);
     if(r.data?.result_available&&r.data?.data)setResult(r.data.data);
     else{setResult({result_available:false});toast("Your examination has been submitted. The result will be available when your school releases it.");}
     await loadPortal();
   }catch(e){toast.error(e.response?.data?.message||"Unable to submit examination.");}
   finally{submittingRef.current=false;setSubmitting(false);}
 }

 if(result){
   if(result.result_available===false)return <div className="w-full space-y-5"><PageHeader title="CBT Result" description="Your examination has been submitted."/><Card><CardContent className="p-6 sm:p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12"/><h2 className="mt-4 text-2xl font-bold text-slate-900">Examination Submitted</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Your examination has been submitted successfully. The school has not released the result yet. You will be able to see your score here when it is released.</p><Button className="mt-6" onClick={()=>{setResult(null);loadPortal();}}>Back to CBT</Button></CardContent></Card></div>;
   const passed=Number(result.percentage||0)>=Number(result.pass_mark??0),totalMarks=Number(result.total_marks||0);
   return <div className="w-full space-y-5"><PageHeader title="CBT Result" description="Your examination has been submitted."/><Card><CardContent className="p-6 sm:p-8"><div className="text-center"><CheckCircle2 className="mx-auto h-12 w-12"/><h2 className="mt-4 text-2xl font-bold text-slate-900">{passed?"Congratulations!":"Keep Practising"}</h2><p className="mt-2 text-slate-500">Attempt #{result.attempt_number}</p><div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Score",`${Number(result.score||0).toFixed(2)} / ${totalMarks.toFixed(2)}`],["Percentage",`${Number(result.percentage||0).toFixed(2)}%`],["Correct",result.correct_answers||0],["Wrong",result.wrong_answers||0]].map(([label,value])=><div key={label} className="rounded-xl border bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>)}</div><p className="mt-5 text-sm text-slate-500">Unanswered: {result.unanswered||0} • Pass mark: {Number(result.pass_mark??0).toFixed(0)}%</p><div className="mt-6 flex justify-center gap-3"><Button onClick={()=>{setResult(null);loadPortal();}}><Play className="mr-2 h-4 w-4"/>Back to CBT</Button><Button variant="outline" onClick={()=>navigate("/student-dashboard")}>Dashboard</Button></div></div></CardContent></Card></div>
 }

 if(exam&&attempt){
   const questions=exam.questions||[],q=questions[currentQuestion],selected=q?answers[q.id]:null;
   return <div className="w-full space-y-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{exam.title}</h1><p className="mt-1 text-sm text-slate-500">{exam.subject_name} • {questions.length} question{questions.length===1?"":"s"}</p></div><div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Clock3 className="h-4 w-4"/>{formatTime(remainingSeconds)}</div></div><div className="grid gap-5 lg:grid-cols-[1fr_280px]"><Card><CardContent className="p-5 sm:p-7">{q?<><div className="mb-6 flex items-start justify-between gap-4"><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Question {currentQuestion+1} of {questions.length}</p><h2 className="mt-3 text-lg font-semibold leading-7 text-slate-900">{q.question_text}</h2>{q.image_url&&<img src={q.image_url} alt="Question diagram" className="mt-5 max-h-80 w-full rounded-xl border bg-white object-contain p-2" onError={e=>{e.currentTarget.style.display="none";}}/>}</div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{q.marks} mark{Number(q.marks)===1?"":"s"}</span></div><div className="space-y-3">{(q.options||[]).map((o,i)=><button key={o.id} type="button" onClick={()=>chooseAnswer(q,o.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${selected===o.id?"border-blue-600 bg-blue-50 ring-2 ring-blue-100":"border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selected===o.id?"bg-blue-600 text-white":"bg-slate-100 text-slate-600"}`}>{String.fromCharCode(65+i)}</span><span className="min-w-0 flex-1 pt-0.5 text-sm leading-6 text-slate-800">{o.option_text}{o.option_image_url&&<img src={o.option_image_url} alt={`Option ${String.fromCharCode(65+i)} diagram`} className="mt-3 max-h-36 max-w-full rounded-lg border object-contain" onError={e=>{e.currentTarget.style.display="none";}}/>}</span></button>)}</div><div className="mt-7 flex items-center justify-between gap-3"><Button variant="outline" disabled={currentQuestion===0} onClick={()=>setCurrentQuestion(v=>v-1)}><ArrowLeft className="mr-2 h-4 w-4"/>Previous</Button>{currentQuestion===questions.length-1?<Button disabled={submitting} onClick={()=>handleSubmitAttempt(false)}><Send className="mr-2 h-4 w-4"/>{submitting?"Submitting...":"Submit Exam"}</Button>:<Button onClick={()=>setCurrentQuestion(v=>v+1)}>Next</Button>}</div></>:<p className="py-8 text-center text-slate-500">No questions are available for this examination.</p>}</CardContent></Card><Card><CardContent className="p-5"><h3 className="font-semibold text-slate-900">Question Navigator</h3><p className="mt-1 text-xs text-slate-500">{answeredCount} of {questions.length} answered</p><div className="mt-4 grid grid-cols-5 gap-2">{questions.map((item,i)=><button key={item.id} type="button" onClick={()=>setCurrentQuestion(i)} className={`h-9 rounded-lg text-xs font-semibold ${i===currentQuestion?"bg-slate-900 text-white":answers[item.id]?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-600"}`}>{i+1}</button>)}</div></CardContent></Card></div></div>
 }

 return <div className="w-full space-y-6"><PageHeader title="CBT Examinations" description="Practice your computer-based examinations."/>{loading?<Card><CardContent className="p-8 text-center text-slate-500">Loading examinations...</CardContent></Card>:<><div><h2 className="mb-3 text-lg font-semibold text-slate-900">Available Examinations</h2>{exams.length===0?<Card><CardContent className="p-8 text-center"><FileQuestion className="mx-auto h-10 w-10"/><h2 className="mt-3 font-semibold">No examinations available</h2><p className="mt-1 text-sm text-slate-500">There are no published CBT examinations for your class at the moment.</p></CardContent></Card>:<div className="grid gap-4 md:grid-cols-2">{exams.map(e=><Card key={e.id}><CardContent className="p-5"><h2 className="font-semibold text-slate-900">{e.title}</h2><p className="mt-1 text-sm text-slate-500">{e.subject_name} • {e.duration_minutes} minutes • {e.total_marks} marks</p><p className="mt-2 text-xs text-slate-500">Attempts: {e.attempt_count}/{e.max_attempts}</p><Button className="mt-4" disabled={starting||Number(e.attempt_count)>=Number(e.max_attempts)} onClick={()=>startExam(e)}><Play className="mr-2 h-4 w-4"/>{Number(e.attempt_count)>=Number(e.max_attempts)?"Maximum Attempts Reached":"Start Examination"}</Button></CardContent></Card>)}</div>}</div><Card><CardContent className="p-5 sm:p-6"><h2 className="font-semibold text-slate-900">My CBT History</h2><p className="mt-1 text-sm text-slate-500">Your previous CBT attempts and released results.</p>{history.length===0?<p className="py-6 text-center text-sm text-slate-500">You have not taken any CBT examination yet.</p>:<div className="mt-4 overflow-x-auto rounded-xl border"><table className="min-w-[760px] w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Examination</th><th className="px-4 py-3">Attempt</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Result</th></tr></thead><tbody className="divide-y">{history.map(item=>{const hasResult=item.score!==undefined&&item.score!==null;const passed=hasResult&&Number(item.percentage)>=Number(item.pass_mark);return <tr key={item.id}><td className="px-4 py-3 font-medium text-slate-900">{item.title||"CBT Examination"}<div className="text-xs text-slate-500">{item.subject_name||""}</div></td><td className="px-4 py-3">#{item.attempt_number}</td><td className="px-4 py-3 whitespace-nowrap">{formatDate(item.submitted_at||item.started_at)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status==="in_progress"?"bg-amber-100 text-amber-700":item.status==="expired"?"bg-slate-100 text-slate-700":"bg-blue-100 text-blue-700"}`}>{item.status==="in_progress"?"In progress":item.status==="expired"?"Expired":"Submitted"}</span></td><td className="px-4 py-3">{hasResult?<span className={passed?"font-semibold text-emerald-700":"font-semibold text-red-700"}>{Number(item.score).toFixed(2)} / {Number(item.total_marks||0).toFixed(2)} ({Number(item.percentage||0).toFixed(2)}%)</span>:<span className="text-slate-500">Result pending release</span>}</td></tr>;})}</tbody></table></div>}</CardContent></Card></>}</div>;
}
export default StudentCBTPage;
