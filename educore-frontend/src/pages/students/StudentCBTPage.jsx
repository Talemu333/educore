import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileQuestion,
    Play,
    RotateCcw,
    Send,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const ACTIVE_ATTEMPT_KEY = "educore_active_cbt_attempt";
const attemptAnswersKey = (id) => `educore_cbt_answers_${id}`;

const formatTime = (seconds) => {
    const safe = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safe / 60);
    const remaining = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "—");

function readSavedAttemptId() {
    try {
        const id = Number(window.localStorage.getItem(ACTIVE_ATTEMPT_KEY));
        return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
        return null;
    }
}

function saveActiveAttempt(id) {
    try {
        window.localStorage.setItem(ACTIVE_ATTEMPT_KEY, String(id));
    } catch {}
}

function clearActiveAttempt() {
    try {
        window.localStorage.removeItem(ACTIVE_ATTEMPT_KEY);
    } catch {}
}

function readSavedAnswers(id) {
    try {
        const raw = window.localStorage.getItem(attemptAnswersKey(id));
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveAnswers(id, answers) {
    try {
        window.localStorage.setItem(attemptAnswersKey(id), JSON.stringify(answers));
    } catch {}
}

function clearSavedAnswers(id) {
    try {
        window.localStorage.removeItem(attemptAnswersKey(id));
    } catch {}
}

function StudentCBTPage() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [history, setHistory] = useState([]);
    const [exam, setExam] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const submittingRef = useRef(false);

    const loadPortal = async () => {
        setLoading(true);
        try {
            const [examResponse, historyResponse] = await Promise.all([
                api.get("/cbt/exams/available"),
                api.get("/cbt/my-attempts"),
            ]);
            setExams(examResponse.data?.data || []);
            setHistory(historyResponse.data?.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load CBT examinations.");
        } finally {
            setLoading(false);
        }
    };

    const loadExamForAttempt = async (examId, attemptId) => {
        try {
            const response = await api.get(
                `/cbt/exams/available/${examId}?attemptId=${attemptId}`
            );
            const data = response.data?.data;

            if (!data) {
                throw new Error("The examination could not be loaded.");
            }

            if (!Array.isArray(data.questions) || data.questions.length === 0) {
                throw new Error("The examination attempt has no questions assigned to it.");
            }

            return data;
        } catch (error) {
            console.error("CBT question loading failed", {
                url: error.config?.url,
                status: error.response?.status,
                response: error.response?.data,
                error,
            });
            const message =
                error.response?.data?.message ||
                error.message ||
                "Unable to load the examination questions.";
            throw new Error(message);
        }
    };

    const loadAttempt = async (attemptId) => {
        try {
            const response = await api.get("/cbt/my-attempts");
            const saved = (response.data?.data || []).find(
                (item) => Number(item.id) === Number(attemptId) && item.status === "in_progress"
            );

            if (!saved) {
                clearActiveAttempt();
                return false;
            }

            const expiresAt = Date.parse(saved.expires_at);
            if (!Number.isFinite(expiresAt)) {
                clearActiveAttempt();
                clearSavedAnswers(saved.id);
                return false;
            }

            if (expiresAt <= Date.now()) {
                try {
                    await api.post(`/cbt/attempts/${saved.id}/submit`);
                } catch {}
                clearActiveAttempt();
                clearSavedAnswers(saved.id);
                await loadPortal();
                return false;
            }

            const loadedExam = await loadExamForAttempt(saved.exam_id, saved.id);
            saveActiveAttempt(saved.id);
            setAttempt(saved);
            setExam(loadedExam);
            setAnswers(readSavedAnswers(saved.id));
            setCurrentQuestion(0);
            setRemainingSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
            return true;
        } catch (error) {
            console.error("CBT resume failed", error);
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Unable to resume your CBT attempt."
            );
            return false;
        }
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            await loadPortal();
            if (cancelled) return;

            const savedAttemptId = readSavedAttemptId();
            if (savedAttemptId) {
                await loadAttempt(savedAttemptId);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!attempt?.expires_at) {
            setRemainingSeconds(0);
            return undefined;
        }

        const expiresAt = Date.parse(attempt.expires_at);
        if (!Number.isFinite(expiresAt)) {
            setRemainingSeconds(0);
            return undefined;
        }

        let active = true;
        let timeoutId;

        const update = () => {
            if (!active) return;
            const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
            setRemainingSeconds(seconds);

            if (seconds <= 0 && !submittingRef.current) {
                handleSubmitAttempt(true);
            }
        };

        update();
        const intervalId = window.setInterval(update, 1000);
        const delay = Math.max(0, expiresAt - Date.now()) + 50;
        timeoutId = window.setTimeout(() => {
            if (!submittingRef.current) handleSubmitAttempt(true);
        }, delay);

        return () => {
            active = false;
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
        };
    }, [attempt?.id, attempt?.expires_at]);

    const answeredCount = useMemo(
        () => Object.values(answers).filter(Boolean).length,
        [answers]
    );

    const inProgressAttemptForExam = (examId) =>
        history.find(
            (item) => Number(item.exam_id) === Number(examId) && item.status === "in_progress"
        );

    const startExam = async (selected) => {
        if (starting || submittingRef.current) return;

        setStarting(true);
        try {
            const existing = inProgressAttemptForExam(selected.id);

            if (existing) {
                const resumed = await loadAttempt(existing.id);
                if (resumed) return;
            }

            const response = await api.post(`/cbt/exams/${selected.id}/start`);
            const newAttempt = response.data?.data;
            const expiresAt = Date.parse(newAttempt?.expires_at);

            // The backend is the source of truth for whether an attempt is valid
            // or expired. The frontend only verifies that the response contains
            // the minimum data required to run the attempt timer safely.
            if (
                !newAttempt ||
                newAttempt.status !== "in_progress" ||
                !newAttempt.expires_at ||
                !Number.isFinite(expiresAt)
            ) {
                throw new Error(
                    "The examination server did not return a valid active attempt. Please try again."
                );
            }

            saveActiveAttempt(newAttempt.id);
            clearSavedAnswers(newAttempt.id);

            let loadedExam = newAttempt.exam;
            if (
                !loadedExam ||
                !Array.isArray(loadedExam.questions) ||
                loadedExam.questions.length === 0
            ) {
                loadedExam = await loadExamForAttempt(selected.id, newAttempt.id);
            }

            setAttempt(newAttempt);
            setExam(loadedExam);
            setAnswers({});
            setCurrentQuestion(0);
            setRemainingSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
        } catch (error) {
            console.error("CBT start flow failed", {
                url: error.config?.url,
                status: error.response?.status,
                response: error.response?.data,
                error,
            });
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Unable to start examination."
            );
        } finally {
            setStarting(false);
        }
    };

    const chooseAnswer = async (question, optionId) => {
        if (!attempt || !question || submittingRef.current) return;

        setAnswers((previous) => {
            const next = { ...previous, [question.id]: optionId };
            saveAnswers(attempt.id, next);
            return next;
        });

        try {
            await api.post(`/cbt/attempts/${attempt.id}/answers`, {
                question_id: question.id,
                selected_option_id: optionId,
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save your answer.");
        }
    };

    async function handleSubmitAttempt(auto = false) {
        if (!attempt || submittingRef.current) return;

        submittingRef.current = true;
        setSubmitting(true);

        try {
            const response = await api.post(`/cbt/attempts/${attempt.id}/submit`);
            clearActiveAttempt();
            clearSavedAnswers(attempt.id);

            setAttempt(null);
            setExam(null);
            setAnswers({});
            setRemainingSeconds(0);

            if (auto) {
                toast("Time is up. Your examination has been submitted automatically.");
            } else {
                toast.success("Examination submitted successfully.");
            }

            if (response.data?.result_available && response.data?.data) {
                setResult(response.data.data);
            } else {
                setResult({ result_available: false });
            }

            await loadPortal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to submit examination.");
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    }

    if (result) {
        if (result.result_available === false) {
            return (
                <div className="w-full space-y-5">
                    <PageHeader
                        title="CBT Result"
                        description="Your examination has been submitted."
                    />
                    <Card>
                        <CardContent className="p-6 text-center sm:p-8">
                            <CheckCircle2 className="mx-auto h-12 w-12" />
                            <h2 className="mt-4 text-2xl font-bold text-slate-900">
                                Examination Submitted
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                                Your examination has been submitted successfully. The school has
                                not released the result yet. You will be able to see your score
                                here when it is released.
                            </p>
                            <Button
                                className="mt-6"
                                onClick={() => {
                                    setResult(null);
                                    loadPortal();
                                }}
                            >
                                Back to CBT
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        const passed =
            Number(result.percentage || 0) >= Number(result.pass_mark ?? 0);
        const totalMarks = Number(result.total_marks || 0);

        return (
            <div className="w-full space-y-5">
                <PageHeader title="CBT Result" description="Your examination has been submitted." />
                <Card>
                    <CardContent className="p-6 sm:p-8">
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto h-12 w-12" />
                            <h2 className="mt-4 text-2xl font-bold text-slate-900">
                                {passed ? "Congratulations!" : "Keep Practising"}
                            </h2>
                            <p className="mt-2 text-slate-500">
                                Attempt #{result.attempt_number}
                            </p>
                            <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    [
                                        "Score",
                                        `${Number(result.score || 0).toFixed(2)} / ${totalMarks.toFixed(2)}`,
                                    ],
                                    ["Percentage", `${Number(result.percentage || 0).toFixed(2)}%`],
                                    ["Correct", result.correct_answers || 0],
                                    ["Wrong", result.wrong_answers || 0],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-xl border bg-slate-50 p-4">
                                        <p className="text-xs uppercase text-slate-500">{label}</p>
                                        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-5 text-sm text-slate-500">
                                Unanswered: {result.unanswered || 0} • Pass mark: {Number(result.pass_mark ?? 0).toFixed(0)}%
                            </p>
                            <div className="mt-6 flex justify-center gap-3">
                                <Button
                                    onClick={() => {
                                        setResult(null);
                                        loadPortal();
                                    }}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Back to CBT
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/student-dashboard")}
                                >
                                    Dashboard
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (exam && attempt) {
        const questions = exam.questions || [];
        const question = questions[currentQuestion];
        const selectedOption = question ? answers[question.id] : null;

        return (
            <div className="w-full space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                            {exam.title}
                        </h1>
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
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                Question {currentQuestion + 1} of {questions.length}
                                            </p>
                                            <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-900">
                                                {question.question_text}
                                            </h2>
                                            {question.image_url && (
                                                <img
                                                    src={question.image_url}
                                                    alt="Question diagram"
                                                    className="mt-5 max-h-80 w-full rounded-xl border bg-white object-contain p-2"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            )}
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
                                                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                                                    selectedOption === option.id
                                                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                                                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                        selectedOption === option.id
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <span className="min-w-0 flex-1 pt-0.5 text-sm leading-6 text-slate-800">
                                                    {option.option_text}
                                                    {option.option_image_url && (
                                                        <img
                                                            src={option.option_image_url}
                                                            alt={`Option ${String.fromCharCode(65 + index)} diagram`}
                                                            className="mt-3 max-h-36 max-w-full rounded-lg border object-contain"
                                                            onError={(event) => {
                                                                event.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                    )}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-7 flex items-center justify-between gap-3">
                                        <Button
                                            variant="outline"
                                            disabled={currentQuestion === 0}
                                            onClick={() => setCurrentQuestion((value) => value - 1)}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Previous
                                        </Button>

                                        {currentQuestion === questions.length - 1 ? (
                                            <Button
                                                disabled={submitting}
                                                onClick={() => handleSubmitAttempt(false)}
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                {submitting ? "Submitting..." : "Submit Exam"}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => setCurrentQuestion((value) => value + 1)}
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="py-8 text-center text-slate-500">
                                    No questions are available for this examination.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <h3 className="font-semibold text-slate-900">Question Navigator</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {answeredCount} of {questions.length} answered
                            </p>
                            <div className="mt-4 grid grid-cols-5 gap-2">
                                {questions.map((item, index) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`h-9 rounded-lg text-xs font-semibold ${
                                            index === currentQuestion
                                                ? "bg-slate-900 text-white"
                                                : answers[item.id]
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-slate-100 text-slate-600"
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
                title="CBT Examinations"
                description="Practice your computer-based examinations."
            />

            {loading ? (
                <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                        Loading examinations...
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div>
                        <h2 className="mb-3 text-lg font-semibold text-slate-900">
                            Available Examinations
                        </h2>

                        {exams.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <FileQuestion className="mx-auto h-10 w-10" />
                                    <h2 className="mt-3 font-semibold">No examinations available</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        There are no published CBT examinations for your class at the moment.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {exams.map((item) => {
                                    const existingAttempt = inProgressAttemptForExam(item.id);
                                    return (
                                        <Card key={item.id}>
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">
                                                            {item.title}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {item.subject_name} • {item.class_name}
                                                            {item.arm_name ? ` • ${item.arm_name}` : ""}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        {item.duration_minutes} min
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                    <div className="rounded-lg bg-slate-50 p-3">
                                                        <p className="text-xs text-slate-500">Questions</p>
                                                        <p className="mt-1 font-semibold text-slate-900">
                                                            {item.question_selection_count || "All"}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-slate-50 p-3">
                                                        <p className="text-xs text-slate-500">Attempts</p>
                                                        <p className="mt-1 font-semibold text-slate-900">
                                                            {item.attempt_count || 0} / {item.max_attempts}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Button
                                                    className="mt-5 w-full"
                                                    disabled={starting}
                                                    onClick={() => startExam(item)}
                                                >
                                                    {existingAttempt ? (
                                                        <>
                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                            Resume Examination
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="mr-2 h-4 w-4" />
                                                            {starting ? "Opening..." : "Start Examination"}
                                                        </>
                                                    )}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="mb-3 text-lg font-semibold text-slate-900">My CBT History</h2>
                        {history.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-sm text-slate-500">
                                    You have not taken any CBT examination yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border bg-white">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Examination</th>
                                            <th className="px-4 py-3">Subject</th>
                                            <th className="px-4 py-3">Attempt</th>
                                            <th className="px-4 py-3">Started</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Result</th>
                                            <th className="px-4 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((item) => {
                                            const isInProgress = item.status === "in_progress";
                                            const resultVisible =
                                                !isInProgress &&
                                                item.score !== undefined &&
                                                item.score !== null;

                                            return (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-4 font-medium text-slate-900">
                                                        {item.exam_title || item.title || "CBT Examination"}
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">
                                                        {item.subject_name || "—"}
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">
                                                        #{item.attempt_number}
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">
                                                        {formatDate(item.started_at)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                isInProgress
                                                                    ? "bg-amber-50 text-amber-700"
                                                                    : "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            {isInProgress ? "In progress" : item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 font-medium text-slate-700">
                                                        {resultVisible
                                                            ? `${Number(item.score || 0).toFixed(2)} / ${Number(item.total_marks || 0).toFixed(2)} (${Number(item.percentage || 0).toFixed(2)}%)`
                                                            : isInProgress
                                                            ? "Not submitted"
                                                            : "Result pending"}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {isInProgress ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={starting}
                                                                onClick={async () => {
                                                                    setStarting(true);
                                                                    try {
                                                                        await loadAttempt(item.id);
                                                                    } finally {
                                                                        setStarting(false);
                                                                    }
                                                                }}
                                                            >
                                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                                Resume
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">Completed</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default StudentCBTPage;
