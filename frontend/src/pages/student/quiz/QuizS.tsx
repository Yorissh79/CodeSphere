import {useState, useEffect, useCallback} from "react";
import {useGetAllQuizzesQuery} from "../../../services/quizApi";
import {useCheckAuthQuery} from "../../../services/authCheck";
import {useGetQuestionsByQuizQuery} from "../../../services/questionApi";
import {useSubmitAnswersMutation} from "../../../services/answerApi";
import {toast} from "react-hot-toast";
import {XCircle} from "lucide-react";
import QuizList from "./components/QuizList";
import QuestionNavigator from "./components/QuestionNavigator";
import QuestionDisplay from "./components/QuestionDisplay";
import TimeUpModal from "./components/TimeUpModal";
import QuizHeader from "./components/QuizHeader";
import type {Answer} from "./components/types.ts";

const STORAGE_KEY = "quiz_answers";

const QuizS = () => {
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [isQuizStarted, setIsQuizStarted] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
    const [showTimerWarning, setShowTimerWarning] = useState(false);

    const {data: authData, isLoading: isLoadingAuth, error: authError} = useCheckAuthQuery();
    const {data: quizzes, isLoading: isLoadingQuizzes, error: quizzesError} = useGetAllQuizzesQuery();
    const {
        data: questions,
        isFetching: isFetchingQuestions,
        error: questionsError,
    } = useGetQuestionsByQuizQuery(selectedQuizId!, {skip: !selectedQuizId});
    const [submitAnswers, {isLoading: isSubmittingAnswers}] = useSubmitAnswersMutation();

    const studentId = authData?.user?._id;

    // Persist answers to localStorage
    useEffect(() => {
        if (isQuizStarted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        }
    }, [answers, isQuizStarted]);

    // Clear localStorage on quiz submission
    const clearLocalStorage = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Error handling
    useEffect(() => {
        if (authError) {
            toast.error("Failed to authenticate user");
            console.error(authError);
        }
        if (quizzesError) {
            toast.error("Failed to load quizzes");
            console.error(quizzesError);
        }
        if (questionsError) {
            toast.error("Failed to load questions");
            console.error(questionsError);
        }
    }, [authError, quizzesError, questionsError]);

    // Timer logic with warning
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (isQuizStarted && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer!);
                        setIsTimeUpModalOpen(true);
                        handleSubmitQuiz();
                        return 0;
                    }
                    if (prev <= 600 && !showTimerWarning) {
                        setShowTimerWarning(true);
                        toast.error("Less than 10 minutes remaining!", {
                            duration: 4000,
                            style: {background: '#fef2f2', color: '#b91c1c'},
                        });
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isQuizStarted, timeRemaining, showTimerWarning]);

    // Time spent tracking
    useEffect(() => {
        if (isQuizStarted && questions && currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            setAnswers((prev) =>
                prev.map((a) =>
                    a.questionId === currentQuestion._id
                        ? {...a, timeSpent: a.timeSpent + ((Date.now() - a.startTime) / 1000), startTime: Date.now()}
                        : a
                )
            );
            if (!answers.find((a) => a.questionId === currentQuestion._id)) {
                setAnswers((prev) => [
                    ...prev,
                    {
                        questionId: currentQuestion._id,
                        timeSpent: 0,
                        changedCount: 0,
                        startTime: Date.now(),
                    },
                ]);
            }
        }
    }, [currentQuestionIndex, questions, isQuizStarted]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && currentQuestionIndex > 0 && !isSubmittingAnswers) {
                handlePrevQuestion();
            } else if (
                e.key === "ArrowRight" &&
                currentQuestionIndex < (questions?.length || 0) - 1 &&
                !isSubmittingAnswers
            ) {
                handleNextQuestion();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentQuestionIndex, questions, isSubmittingAnswers]);

    // Auto-scroll to current question
    useEffect(() => {
        const questionElement = document.getElementById(`question-${currentQuestionIndex}`);
        if (questionElement) {
            questionElement.scrollIntoView({behavior: "smooth", block: "center"});
        }
    }, [currentQuestionIndex]);

    const handleStartQuiz = (quizId: string) => {
        if (!studentId) {
            toast.error("Please log in to start the quiz");
            return;
        }
        const quiz = quizzes?.find((q: any) => q._id === quizId);
        if (quiz) {
            setSelectedQuizId(quizId);
            setIsQuizStarted(true);
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setTimeRemaining(quiz.timeLimit * 60);
            setShowTimerWarning(false);
            clearLocalStorage();
        }
    };

    const handleAnswerChange = (questionId: string, value: number | string) => {
        setAnswers((prev) => {
            const existingAnswer = prev.find((a) => a.questionId === questionId);
            if (existingAnswer) {
                return prev.map((a) =>
                    a.questionId === questionId
                        ? {
                            ...a,
                            selectedOption: typeof value === "number" ? value : undefined,
                            shortAnswer: typeof value === "string" ? value : undefined,
                            changedCount: a.changedCount + 1,
                            timeSpent: a.timeSpent + ((Date.now() - a.startTime) / 1000),
                            startTime: Date.now(),
                        }
                        : a
                );
            }
            return [
                ...prev,
                {
                    questionId,
                    selectedOption: typeof value === "number" ? value : undefined,
                    shortAnswer: typeof value === "string" ? value : undefined,
                    timeSpent: 0,
                    changedCount: 1,
                    startTime: Date.now(),
                },
            ];
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (questions?.length || 0) - 1) {
            setAnswers((prev) =>
                prev.map((a) =>
                    a.questionId === questions![currentQuestionIndex]._id
                        ? {...a, timeSpent: a.timeSpent + ((Date.now() - a.startTime) / 1000)}
                        : a
                )
            );
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setAnswers((prev) =>
                prev.map((a) =>
                    a.questionId === questions![currentQuestionIndex]._id
                        ? {...a, timeSpent: a.timeSpent + ((Date.now() - a.startTime) / 1000)}
                        : a
                )
            );
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleJumpToQuestion = (index: number) => {
        if (index >= 0 && index < (questions?.length || 0)) {
            setAnswers((prev) =>
                prev.map((a) =>
                    a.questionId === questions![currentQuestionIndex]._id
                        ? {...a, timeSpent: a.timeSpent + ((Date.now() - a.startTime) / 1000)}
                        : a
                )
            );
            setCurrentQuestionIndex(index);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!selectedQuizId || !questions || !studentId) return;

        const finalAnswers = answers.map((a) =>
            a.questionId === questions[currentQuestionIndex]?._id
                ? {...a, timeSpent: a.timeSpent + ((Date.now() - a.startTime) / 1000)}
                : a
        );

        const payload = finalAnswers.map((answer) => ({
            studentId,
            quizId: selectedQuizId,
            questionId: answer.questionId,
            answer: answer.selectedOption ?? answer.shortAnswer ?? "",
            submittedAt: new Date().toISOString(),
            timeSpent: Math.round(answer.timeSpent),
            changedCount: answer.changedCount,
        }));

        try {
            await submitAnswers(payload).unwrap();
            toast.success("Quiz submitted successfully!");
            clearLocalStorage();
        } catch (error) {
            toast.error("Failed to submit quiz");
            console.error(error);
        }

        setIsQuizStarted(false);
        setSelectedQuizId(null);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setTimeRemaining(0);
        setIsTimeUpModalOpen(false);
        setShowTimerWarning(false);
    };

    const handleBackToList = () => {
        setIsQuizStarted(false);
        setSelectedQuizId(null);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setTimeRemaining(0);
        clearLocalStorage();
    };

    const answeredCount = answers.filter(
        (a) => a.selectedOption !== undefined || (a.shortAnswer && a.shortAnswer.trim() !== "")
    ).length;

    const currentQuestion = questions?.[currentQuestionIndex];
    const selectedQuiz = quizzes?.find((q: any) => q._id === selectedQuizId);

    if (isLoadingAuth) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading user...</span>
                </div>
            </div>
        );
    }

    if (authError || !studentId) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
                <div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700 text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-300">Please log in to access the quiz portal.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8 px-4 transition-all duration-300">
            <div className="max-w-5xl mx-auto flex gap-6">
                {isQuizStarted && questions && (
                    <QuestionNavigator
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        answers={answers}
                        handleJumpToQuestion={handleJumpToQuestion}
                    />
                )}
                <div className="flex-1">
                    {!isQuizStarted ? (
                        <QuizList
                            quizzes={quizzes}
                            isLoadingQuizzes={isLoadingQuizzes}
                            quizzesError={quizzesError}
                            handleStartQuiz={handleStartQuiz}
                        />
                    ) : (
                        <div className="space-y-8">
                            <QuizHeader
                                selectedQuiz={selectedQuiz}
                                timeRemaining={timeRemaining}
                                currentQuestionIndex={currentQuestionIndex}
                                questions={questions}
                                answeredCount={answeredCount}
                                isSubmittingAnswers={isSubmittingAnswers}
                                handleBackToList={handleBackToList}
                            />
                            {isFetchingQuestions ? (
                                <div className="flex items-center justify-center py-12">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading question...</span>
                                </div>
                            ) : (
                                <QuestionDisplay
                                    currentQuestion={currentQuestion}
                                    currentQuestionIndex={currentQuestionIndex}
                                    questions={questions}
                                    answers={answers}
                                    isSubmittingAnswers={isSubmittingAnswers}
                                    handleAnswerChange={handleAnswerChange}
                                    handlePrevQuestion={handlePrevQuestion}
                                    handleNextQuestion={handleNextQuestion}
                                    handleSubmitQuiz={handleSubmitQuiz}
                                />
                            )}
                        </div>
                    )}
                    <TimeUpModal
                        isTimeUpModalOpen={isTimeUpModalOpen}
                        setIsTimeUpModalOpen={setIsTimeUpModalOpen}
                        isSubmittingAnswers={isSubmittingAnswers}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuizS;