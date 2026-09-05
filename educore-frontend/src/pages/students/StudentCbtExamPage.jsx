import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock3, Flag, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import {
    getStudentCbtExam,
    getMyCbtAttempts,
    startCbtAttempt,
    saveCbtAnswer,
    submitCbtAttempt,
} from "@/api/cbtApi";

const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

function StudentCbtExamPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const examId = searchParams.get("examId");

    const examQuery = useQuery({
        queryKey: ["student-cbt-exam", examId],
        queryFn: () => getStudentCbtExam(examId),
        enabled: Boolean(examId),
    });

    const attemptsQuery = useQuery({
        queryKey: ["student-cbt-attempts"],
        queryFn: getMyCbtAttempts,
    });

    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [marked, setMarked] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(null);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const exam = examQuery.data;
    const existingAttempt = useMemo(
        () => (attemptsQuery.data || []).find(
            (item) => Number(item.exam_id) === Number(examId) && item.status === "in_progress"
        ),
        [attemptsQuery.data, examId]
    );

    const questions = useMemo(() => {
        if (!exam?.questions) return [];
        const base = exam.questions.map((question) => ({
            ...question,
            options: exam.randomize_options ? shuffle(question.options || []) : (question.options || []),
        }));
        return exam.randomize_questions ? shuffle(base) : base;
    }, [exam]);

    useEffect(() => {
        if (!existingAttempt || attempt) return;
        setAttempt(existingAttempt);
        const expiry = new Date(existingAttempt.expires_at).getTime();
        setSecondsLeft(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
    }, [existingAttempt, attempt]);

    useEffect(() => {
        if (!attempt || secondsLeft === null) return undefined;
        if (secondsLeft <= 0) {
            handleSubmit(true);
            return undefined;
        }
        const timer = window.setInterval(() => {
            setSecondsLeft((value) => Math.max(0, value - 1));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [attempt, secondsLeft]);

    const currentQuestion = questions[currentIndex];

    const formatTime = (value) => {
        const minutes = Math.floor(value / 60).toString().padStart(2, "0");
        const seconds = (value % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const handleStart = async () => {
        setStarting(true);
        try {
            const created = await startCbtAttempt(examId);
            setAttempt(created);
            setSecondsLeft(Math.max(0, Math.floor((new Date(created.expires_at).getTime() - Date.now()) / 1000)));
            await queryClient.invalidateQueries({ queryKey: ["student-cbt-attempts"] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to start this test.");
        } finally {
            setStarting(false);
        }
    };

    const handleAnswer = async (optionId) => {
        if (!attempt || !currentQuestion || submitting) return;
        setAnswers((previous) => ({ ...previous, [currentQuestion.id]: optionId }));
        try {
            await saveCbtAnswer(attempt.id, currentQuestion.id, optionId);
        } catch (error) {
            toast.error(error.response?.data?.message || "Answer could not be saved.");
        }
    };

    async function handleSubmit(auto = false) {
        if (!attempt || submitting) return;
        if (!auto && !window.confirm("Submit this test now? You will not be able to change your answers afterward.")) return;
        setSubmitting(true);
        try {
            const result = await submitCbtAttempt(attempt.id);
            toast.success(auto ? "Time is up. Your test was submitted." : "Test submitted successfully.");
            await queryClient.invalidateQueries({ queryKey: ["student-cbt-attempts"] });
            navigate(`/student-cbt?result=${result?.id || attempt.id}`, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to submit the test.");
            setSubmitting(false);
        }
    }

    if (!examId) {
        return <div className="p-6 text-sm text-red-600">No examination was selected.</div>;
    }

    if (examQuery.isLoading || attemptsQuery.isLoading) {
        return <div className="py-12 text-center text-sm text-slate-500">Loading examination...</div>;
    }

    if (examQuery.error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-700">Unable to load examination</h2>
                <p className="mt-2 text-sm text-red-600">{examQuery.error?.response?.data?.message || "This examination is unavailable."}</p>
                <Button className="mt-4" onClick={() => navigate("/student-cbt")}>Back to CBT</Button>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="w-full space-y-6">
                <Button variant="ghost" onClick={() => navigate("/student-cbt")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to CBT
                </Button>
                <PageHeader title={exam.title} description={exam.subject_name} />
                <div className="app-surface mx-auto max-w-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-slate-900">Before you begin</h2>
                    <ul className="mt-5 space-y-3 text-sm text-slate-600">
                        <li className="flex gap-3"><Clock3 className="h-5 w-5 shrink-0 text-blue-700" /> You have {exam.duration_minutes} minutes.</li>
                        <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-blue-700" /> Your answers are saved as you select them.</li>
                        <li className="flex gap-3"><Flag className="h-5 w-5 shrink-0 text-blue-700" /> You can move between questions before submitting.</li>
                    </ul>
                    {exam.description && <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{exam.description}</p>}
                    <Button className="mt-6 w-full sm:w-auto" onClick={handleStart} disabled={starting}>
                        {starting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</> : "Start Test"}
                    </Button>
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return <div className="app-surface p-8 text-center text-sm text-slate-600">This test has no questions yet. Please contact your school administrator.</div>;
    }

    return (
        <div className="w-full space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
                    <p className="text-sm text-slate-500">{exam.subject_name} · Question {currentIndex + 1} of {questions.length}</p>
                </div>
                <div className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold ${secondsLeft < 60 ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                    <Clock3 className="h-5 w-5" /> {formatTime(secondsLeft || 0)}
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
                <div className="app-surface p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg font-semibold leading-7 text-slate-900">{currentQuestion.question_text}</h2>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{currentQuestion.marks} mark(s)</span>
                    </div>

                    {currentQuestion.image_url && <img src={currentQuestion.image_url} alt="Question" className="mt-5 max-h-72 rounded-lg border object-contain" />}

                    <div className="mt-6 space-y-3">
                        {(currentQuestion.options || []).map((option, index) => {
                            const selected = Number(answers[currentQuestion.id]) === Number(option.id);
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleAnswer(option.id)}
                                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${selected ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
                                >
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${selected ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="pt-0.5 text-sm leading-6 text-slate-800">{option.option_text}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button variant="outline" onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))} disabled={currentIndex === 0}>Previous</Button>
                        {currentIndex < questions.length - 1 ? (
                            <Button onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}>Next</Button>
                        ) : (
                            <Button onClick={() => handleSubmit(false)} disabled={submitting}>{submitting ? "Submitting..." : "Submit Test"}</Button>
                        )}
                    </div>
                </div>

                <aside className="app-surface h-fit p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Questions</h2>
                        <span className="text-xs text-slate-500">{Object.keys(answers).length}/{questions.length}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-5 gap-2">
                        {questions.map((question, index) => (
                            <button
                                key={question.id}
                                type="button"
                                onClick={() => setCurrentIndex(index)}
                                className={`h-9 rounded-lg text-xs font-semibold ${index === currentIndex ? "bg-blue-700 text-white" : answers[question.id] ? "bg-green-100 text-green-700" : marked[question.id] ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={() => setMarked((previous) => ({ ...previous, [currentQuestion.id]: !previous[currentQuestion.id] }))} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Flag className="h-4 w-4" /> {marked[currentQuestion.id] ? "Unmark Question" : "Mark for Review"}
                    </button>
                </aside>
            </div>
        </div>
    );
}

export default StudentCbtExamPage;
