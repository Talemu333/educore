import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, FileQuestion, Play, Send } from "lucide-react";
import toast from "react-hot-toast";

import api from "@/api/axios";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const ACTIVE_ATTEMPT_KEY = "educore_active_cbt_attempt";
const attemptAnswersKey = (attemptId) => `educore_cbt_answers_${attemptId}`;

function formatTime(seconds) {
    const safe = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safe / 60);
    const remaining = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function readSavedAttemptId() {
    try {
        const value = window.localStorage.getItem(ACTIVE_ATTEMPT_KEY);
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
        return null;
    }
}

function saveActiveAttempt(attemptId) {
    try {
        window.localStorage.setItem(ACTIVE_ATTEMPT_KEY, String(attemptId));
    } catch {
        // Local storage may be unavailable; the server remains authoritative.
    }
}

function clearActiveAttempt() {
    try {
        window.localStorage.removeItem(ACTIVE_ATTEMPT_KEY);
    } catch {
        // Ignore storage failures.
    }
}

function readSavedAnswers(attemptId) {
    try {
        const raw = window.localStorage.getItem(attemptAnswersKey(attemptId));
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveAnswers(attemptId, answers) {
    try {
        window.localStorage.setItem(attemptAnswersKey(attemptId), JSON.stringify(answers));
    } catch {
        // Server-side answer saving remains authoritative.
    }
}

function clearSavedAnswers(attemptId) {
    try {
        window.localStorage.removeItem(attemptAnswersKey(attemptId));
    } catch {
        // Ignore storage failures.
    }
}

function StudentCBTPage() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [exam, setExam] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    const loadExams = async () => {
        setLoading(true);
        try {
            const response = await api.get("/cbt/exams/available");
            setExams(response.data?.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load CBT examinations.");
        } finally {
            setLoading(false);
        }
    };

    const loadAttempt = async (attemptId) => {
        try {
            const attemptsResponse = await api.get("/cbt/my-attempts");
            const attempts = attemptsResponse.data?.data || [];
            const savedAttempt = attempts.find(
                (item) => Number(item.id) === Number(attemptId) && item.status === "in_progress"
            );

            if (!savedAttempt) {
                clearActiveAttempt();
                return false;
            }

            if (savedAttempt.expires_at && new Date(savedAttempt.expires_at) <= new Date()) {
                try {
                    await api.post(`/cbt/attempts/${savedAttempt.id}/submit`);
                } catch {
                    // The backend will remain authoritative about an expired attempt.
                }
                clearActiveAttempt();
                clearSavedAnswers(savedAttempt.id);
                return false;
            }

            const examResponse = await api.get(
                `/cbt/exams/available/${savedAttempt.exam_id}?attemptId=${savedAttempt.id}`
            );
            const resumedExam = examResponse.data?.data;
            if (!resumedExam) {
                clearActiveAttempt();
                return false;
            }

            setAttempt(savedAttempt);
            setExam(resumedExam);
            setAnswers(readSavedAnswers(savedAttempt.id));
            setCurrentQuestion(0);
            return true;
        } catch (error) {
            clearActiveAttempt();
            toast.error(error.response?.data?.message || "Unable to resume your CBT attempt.");
            return false;
        }
    };

    useEffect(() => {
        const initialize = async () => {
            await loadExams();
            const savedAttemptId = readSavedAttemptId();
            if (savedAttemptId) {
                await loadAttempt(savedAttemptId);
            }
        };
        initialize();
    }, []);

    useEffect(() => {
        if (!attempt?.expires_at) return undefined;

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.floor((new Date(attempt.expires_at).getTime() - Date.now()) / 1000)
            );
            setRemainingSeconds(remaining);
        };

        updateTimer();
        const timer = window.setInterval(updateTimer, 1000);
        return () => window.clearInterval(timer);
    }, [attempt]);

    useEffect(() => {
        if (!attempt || remainingSeconds !== 0 || submitting) return;
        handleSubmitAttempt(true);
    }, [remainingSeconds, attempt, submitting]);

    const answeredCount = useMemo(
        () => Object.values(answers).filter(Boolean).length,
        [answers]
    );

    const startExam = async (selectedExam) => {
        setStarting(true);
        try {
            const attemptsResponse = await api.get("/cbt/my-attempts");
            const existingAttempt = (attemptsResponse.data?.data || []).find(
                (item) => Number(item.exam_id) === Number(selectedExam.id) && item.status === "in_progress"
            );

            if (existingAttempt) {
                saveActiveAttempt(existingAttempt.id);
                await loadAttempt(existingAttempt.id);
                return;
            }

            const attemptResponse = await api.post(`/cbt/exams/${selectedExam.id}/start`);
            const newAttempt = attemptResponse.data?.data;
            saveActiveAttempt(newAttempt.id);
            clearSavedAnswers(newAttempt.id);
            const examResponse = await api.get(
                `/cbt/exams/available/${selectedExam.id}?attemptId=${newAttempt.id}`
            );
            setAttempt(newAttempt);
            setExam(examResponse.data?.data);
            setAnswers({});
            setCurrentQuestion(0);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to start examination.");
        } finally {
            setStarting(false);
        }
    };

    const chooseAnswer = async (question, optionId) => {
        if (!attempt || !question) return;

        setAnswers((previous) => {
            const next = { ...previous, [question.id]: optionId };
            saveAnswers(attempt.id, next);
            return next;
        });

        try {
            await api.post(`/cbt/attempts/${attempt.id}/answers`, {
                question_id: question.id,
                selected_option_id: optionId
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save your answer.");
        }
    };

    async function handleSubmitAttempt(autoSubmitted = false) {
        if (!attempt || submitting) return;
        setSubmitting(true);

        try {
            const response = await api.post(`/cbt/attempts/${attempt.id}/submit`);
            const result = response.data?.data;

            clearActiveAttempt();
            clearSavedAnswers(attempt.id);

            if (autoSubmitted) {
                alert("Time is up. Your examination has been submitted automatically.");
            } else {
                toast.success("Examination submitted successfully.");
            }

            setAttempt(null);
            setExam(null);
            setAnswers({});
            setRemainingSeconds(0);
            await loadExams();

            if (result) {
                toast.success(`Score: ${Number(result.percentage || 0).toFixed(2)}%`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to submit examination.");
        } finally {
            setSubmitting(false);
        }
    }

    if (exam && attempt) {
        const questions = exam.questions || [];
        const question = questions[currentQuestion];
        const selectedOption = question ? answers[question.id] : null;

        return (
            <div className="w-full space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{exam.title}</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {exam.subject_name} • {questions.length} question{questions.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">
                        <Clock3 className="h-4 w-4" />
                        {formatTime(remainingSeconds)}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                    <Card>
                        <CardContent className="p-5 sm:p-7">
                            {question ? (
                                <>
                                    <div className="mb-6 flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                Question {currentQuestion + 1} of {questions.length}
                                            </p>
                                            <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-900">
                                                {question.question_text}
                                            </h2>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                            {question.marks} mark{Number(question.marks) === 1 ? "" : "s"}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {(question.options || []).map((option, index) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => chooseAnswer(question, option.id)}
                                                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${selectedOption === option.id
                                                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selectedOption === option.id
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <span className="pt-0.5 text-sm leading-6 text-slate-800">
                                                    {option.option_text}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                                        <Button
                                            variant="outline"
                                            disabled={currentQuestion === 0}
                                            onClick={() => setCurrentQuestion((value) => value - 1)}
                                        >
                                            Previous
                                        </Button>
                                        {currentQuestion < questions.length - 1 ? (
                                            <Button onClick={() => setCurrentQuestion((value) => value + 1)}>
                                                Next
                                            </Button>
                                        ) : (
                                            <Button
                                                disabled={submitting}
                                                onClick={() => handleSubmitAttempt(false)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                {submitting ? "Submitting..." : "Submit Examination"}
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="py-12 text-center">
                                    <FileQuestion className="mx-auto h-10 w-10 text-slate-300" />
                                    <p className="mt-3 text-sm text-slate-500">No questions have been added to this examination.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="h-fit lg:sticky lg:top-5">
                        <CardContent className="p-5">
                            <h3 className="font-semibold text-slate-900">Questions</h3>
                            <p className="mt-1 text-xs text-slate-500">{answeredCount} answered</p>
                            <div className="mt-4 grid grid-cols-5 gap-2">
                                {questions.map((item, index) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`h-9 rounded-lg text-xs font-semibold ${currentQuestion === index
                                            ? "bg-blue-600 text-white"
                                            : answers[item.id]
                                                ? "bg-green-100 text-green-700"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title="CBT Practice"
                description="Take computer-based tests assigned to your class."
            />

            {loading ? (
                <Card>
                    <CardContent className="py-12 text-center text-sm text-slate-500">Loading available examinations...</CardContent>
                </Card>
            ) : exams.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileQuestion className="mx-auto h-10 w-10 text-slate-300" />
                        <h2 className="mt-3 font-semibold text-slate-900">No examinations available</h2>
                        <p className="mt-1 text-sm text-slate-500">There are no published CBT examinations available for your class right now.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {exams.map((item) => {
                        const attemptsLeft = Math.max(0, Number(item.max_attempts) - Number(item.attempt_count));
                        return (
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                            <ClipboardIcon />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="font-semibold text-slate-900">{item.title}</h2>
                                            <p className="mt-1 text-xs text-slate-500">{item.subject_name} • {item.class_name}</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                                        {item.description || "Computer-based examination."}
                                    </p>
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                        <div className="rounded-lg bg-slate-50 p-2.5">Duration: <strong>{item.duration_minutes} min</strong></div>
                                        <div className="rounded-lg bg-slate-50 p-2.5">Attempts left: <strong>{attemptsLeft}</strong></div>
                                    </div>
                                    <Button
                                        className="mt-4 w-full"
                                        disabled={starting || attemptsLeft <= 0}
                                        onClick={() => startExam(item)}
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        {attemptsLeft <= 0 ? "No Attempts Left" : starting ? "Starting..." : "Start Examination"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <button
                type="button"
                onClick={() => navigate("/student-dashboard")}
                className="inline-flex items-center text-sm font-medium text-blue-700 hover:underline"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
            </button>
        </div>
    );
}

function ClipboardIcon() {
    return <CheckCircle2 className="h-5 w-5" />;
}

export default StudentCBTPage;
