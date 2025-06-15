import { useState, useEffect, useRef, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal} from "react";
import {useGetQuizByIdQuery, useSubmitAnswersMutation} from "../../services/quizApi";
import {toast} from "react-hot-toast";
import {motion, AnimatePresence} from "framer-motion";
import {ArrowLeft, ArrowRight, CheckCircle, Clock, FileText, Send, XCircle} from "lucide-react";
import {jsPDF} from "jspdf";
import io from "socket.io-client";

// Types
interface Answer {
    questionId: string;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
}

interface QuizSProps {
    quizId: string; // Passed as a prop
}

const QuizS: React.FC<QuizSProps> = ({quizId}) => {
    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, Answer>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [socket, setSocket] = useState<any>(null);
    const startTimeRef = useRef<number>(0);
    const answerChangeCountRef = useRef<Record<string, number>>({});

    // RTK Query
    const {data: quiz, isLoading, error} = useGetQuizByIdQuery(quizId);
    const [submitAnswers, {isLoading: isSubmitting}] = useSubmitAnswersMutation();

    // LocalStorage key
    const storageKey = `quiz_${quizId}_state`;

    // Initialize from localStorage
    useEffect(() => {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
            const {answers: savedAnswers, timeLeft: savedTime} = JSON.parse(savedState);
            setAnswers(savedAnswers || {});
            setTimeLeft(savedTime || quiz?.timeLimit * 60);
        } else if (quiz) {
            setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
        }
    }, [quiz, storageKey]);

    // Timer logic
    useEffect(() => {
        if (timeLeft === null || isSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                const newTime = prev - 1;
                localStorage.setItem(storageKey, JSON.stringify({answers, timeLeft: newTime}));
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted, answers, storageKey]);

    // Socket.IO mock (replace with real Socket.IO in production)
    useEffect(() => {
        const mockSocket = {
            on: (event: string, callback: (data: any) => void) => {
                // Mock timer sync event
                if (event === "timerSync") {
                    setTimeout(() => callback({timeLeft}), 1000);
                }
            },
            emit: () => {
            },
        };
        setSocket(mockSocket);

        return () => {
            // Cleanup socket
        };
    }, [timeLeft]);

    // Prevent page unload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isSubmitted) {
                e.preventDefault();
                e.returnValue = "You have unsaved answers. Are you sure you want to leave?";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isSubmitted]);

    // Track time spent per question
    useEffect(() => {
        if (!quiz?.questions[currentQuestionIndex]) return;
        startTimeRef.current = Date.now();
        return () => {
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setAnswers((prev) => ({
                ...prev,
                [quiz.questions[currentQuestionIndex]._id]: {
                    ...prev[quiz.questions[currentQuestionIndex]._id],
                    timeSpent: (prev[quiz.questions[currentQuestionIndex]._id]?.timeSpent || 0) + timeSpent,
                },
            }));
        };
    }, [currentQuestionIndex, quiz]);

    // Handle answer change
    const handleAnswerChange = (questionId: string, answer: string | number | string[]) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                answer,
                timeSpent: prev[questionId]?.timeSpent || 0,
                changedCount: (answerChangeCountRef.current[questionId] || 0) + 1,
            },
        }));
        answerChangeCountRef.current = {
            ...answerChangeCountRef.current,
            [questionId]: (answerChangeCountRef.current[questionId] || 0) + 1,
        };
        localStorage.setItem(storageKey, JSON.stringify({answers, timeLeft}));
    };

    // Navigation
    const handleNext = () => {
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNavClick = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    // Auto-submit when timer ends
    const handleAutoSubmit = async () => {
        if (isSubmitted) return;
        await handleSubmit();
    };

    // Manual submit
    const handleSubmit = async () => {
        if (!quiz) return;
        try {
            const payload = Object.entries(answers).map(([questionId, ans]) => ({
                studentId: "mock-student-id", // Replace with real student ID
                quizId,
                questionId,
                answer: ans.answer,
                timeSpent: ans.timeSpent,
                changedCount: ans.changedCount,
            }));
            await submitAnswers(payload).unwrap();
            setIsSubmitted(true);
            localStorage.removeItem(storageKey);
            toast.success("Quiz submitted successfully!");
        } catch (err) {
            toast.error("Failed to submit quiz");
            console.error(err);
        }
    };

    // Export PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Quiz: ${quiz?.title}`, 20, 20);
        doc.setFontSize(12);
        quiz?.questions.forEach((q, i) => {
            const answer = answers[q._id]?.answer;
            doc.text(
                `${i + 1}. ${q.questionText} (${q.type})`,
                20,
                30 + i * 20
            );
            doc.text(
                `Answer: ${Array.isArray(answer) ? answer.join(", ") : answer || "Not answered"}`,
                20,
                40 + i * 20
            );
        });
        doc.save(`${quiz?.title}_summary.pdf`);
    };

    // Render loading and error states
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-600">
                <XCircle className="w-5 h-5 mr-2"/>
                Error loading quiz
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {!showSummary ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
                            <div className="flex items-center gap-4">
                                <Clock className="w-5 h-5 text-indigo-600"/>
                                <span className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.floor(timeLeft! / 60)}:{(timeLeft! % 60).toString().padStart(2, "0")}
                </span>
                            </div>
                        </div>

                        {/* Navigation Panel */}
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-wrap gap-2">
                                {quiz.questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleNavClick(index)}
                                        className={`w-10 h-10 rounded-full text-sm font-medium ${
                                            index === currentQuestionIndex
                                                ? "bg-indigo-500 text-white"
                                                : answers[quiz.questions[index]._id]
                                                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        }`}
                                        disabled={isSubmitted}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion._id}
                                initial={{opacity: 0, x: 50}}
                                animate={{opacity: 1, x: 0}}
                                exit={{opacity: 0, x: -50}}
                                transition={{duration: 0.3}}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    {currentQuestionIndex + 1}. {currentQuestion.questionText} ({currentQuestion.type})
                                </h2>

                                {currentQuestion.type === "mcq" && (
                                    <div className="space-y-3">
                                        {currentQuestion.options?.map((opt: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, idx: Key | readonly string[] | null | undefined) => (
                                            <label
                                                className="flex items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                <input
                                                    type="radio"
                                                    name={currentQuestion._id}
                                                    // value={idx}
                                                    checked={answers[currentQuestion._id]?.answer === idx}
                                                    onChange={() => handleAnswerChange(currentQuestion._id, idx)}
                                                    disabled={isSubmitted}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <span className="ml-3 text-gray-900 dark:text-white">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.type === "truefalse" && (
                                    <div className="flex gap-4">
                                        <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                                            <input
                                                type="radio"
                                                name={currentQuestion._id}
                                                value={0}
                                                checked={answers[currentQuestion._id]?.answer === 0}
                                                onChange={() => handleAnswerChange(currentQuestion._id, 0)}
                                                disabled={isSubmitted}
                                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                            />
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-2 mr-2" />
                                            <span className="text-gray-900 dark:text-white">True</span>
                                        </label>
                                        <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                                            <input
                                                type="radio"
                                                name={currentQuestion._id}
                                                value={1}
                                                checked={answers[currentQuestion._id]?.answer === 1}
                                                onChange={() => handleAnswerChange(currentQuestion._id, 1)}
                                                disabled={isSubmitted}
                                                className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                                            />
                                            <XCircle className="w-5 h-5 text-red-500 ml-2 mr-2" />
                                            <span className="text-gray-900 dark:text-white">False</span>
                                        </label>
                                    </div>
                                )}

                                {currentQuestion.type === "short" && (
                                    <textarea
                                        rows={4}
                                        value={(answers[currentQuestion._id]?.answer as string) || ""}
                                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                                        disabled={isSubmitted}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter your answer here..."
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0 || isSubmitted}
                                className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Previous
                            </button>
                            {currentQuestionIndex < quiz.questions.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitted}
                                    className="flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSummary(true)}
                                    disabled={isSubmitted}
                                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Review Answers
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review Your Answers</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {quiz.questions.map((q, i) => (
                                <div
                                    key={q._id}
                                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {i + 1}. {q.questionText}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Answer: {answers[q._id]?.answer ? (
                                        Array.isArray(answers[q._id].answer)
                                            ? answers[q._id].answer.join(", ")
                                            : q.type === "truefalse"
                                                ? answers[q._id].answer === 0
                                                    ? "True"
                                                    : "False"
                                                : answers[q._id].answer
                                    ) : "Not answered"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Time Spent: {answers[q._id]?.timeSpent || 0} seconds
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Answer Changes: {answers[q._id]?.changedCount || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setShowSummary(false)}
                                className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Quiz
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Export PDF
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isSubmitted}
                                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizS;