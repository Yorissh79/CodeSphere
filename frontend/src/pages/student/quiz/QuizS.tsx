import {useState, useEffect, useCallback} from "react";
import {useGetAllQuizzesQuery} from "../../../services/quizApi";
import {useCheckAuthQuery} from "../../../services/authCheck.ts";
import {useGetQuestionsByQuizQuery} from "../../../services/questionApi";
import {useSubmitAnswersMutation} from "../../../services/answerApi";
import {toast} from "react-hot-toast";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    FileText,
    PlayCircle,
    Send,
    XCircle,
    Circle,
} from "lucide-react";

interface Answer {
    questionId: string;
    selectedOption?: number; // For MCQ and True/False
    shortAnswer?: string; // For Short Answer
    timeSpent: number; // Time spent on this question in seconds
    changedCount: number; // Number of answer changes
    startTime: number; // Timestamp when question was displayed
}

const STORAGE_KEY = "quiz_answers";

const QuizS = () => {
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>(() => {
        // Initialize from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [isQuizStarted, setIsQuizStarted] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0); // In seconds
    const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
    const [showTimerWarning, setShowTimerWarning] = useState(false);

    const {data: authData, isLoading: isLoadingAuth, error: authError} = useCheckAuthQuery();
    const {data: quizzes, isLoading: isLoadingQuizzes, error: quizzesError} = useGetAllQuizzesQuery();
    const {
        data: questions,
        isFetching: isFetchingQuestions,
        error: questionsError
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

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
                    <div
                        className="w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 sticky top-8 h-fit max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Questions</h3>
                        <div className="space-y-2">
                            {questions.map((q: any, idx: number) => {
                                const isAnswered =
                                    answers.find((a) => a.questionId === q._id)?.selectedOption !== undefined ||
                                    (answers.find((a) => a.questionId === q._id)?.shortAnswer &&
                                        answers.find((a) => a.questionId === q._id)?.shortAnswer?.trim() !== "");
                                return (
                                    <button
                                        key={q._id}
                                        onClick={() => handleJumpToQuestion(idx)}
                                        className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                                            idx === currentQuestionIndex
                                                ? "bg-indigo-500 text-white"
                                                : isAnswered
                                                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        <span
                                            className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                                isAnswered ? "bg-green-500 text-white" : "bg-gray-300 dark:bg-gray-600"
                                            }`}
                                        >
                                            {isAnswered ? <CheckCircle className="w-4 h-4"/> :
                                                <Circle className="w-4 h-4"/>}
                                        </span>
                                        <span>Question {idx + 1}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            {answeredCount} of {questions.length} answered
                        </p>
                    </div>
                )}
                <div className="flex-1">
                    {!isQuizStarted ? (
                        <div className="flex flex-col items-center justify-center space-y-8">
                            <div className="text-center space-y-4">
                                <div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg mb-4">
                                    <FileText className="w-8 h-8 text-white"/>
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Student Quiz Portal
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 text-lg">
                                    Select an open quiz to start answering questions
                                </p>
                            </div>
                            <div
                                className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Available Quizzes
                                    </h3>
                                </div>
                                {isLoadingQuizzes && (
                                    <div className="flex items-center justify-center py-8">
                                        <div
                                            className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                        <span
                                            className="ml-3 text-gray-600 dark:text-gray-400">Loading quizzes...</span>
                                    </div>
                                )}
                                {quizzesError && (
                                    <div
                                        className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
                                        <XCircle className="w-5 h-5 mr-2"/>
                                        Error loading quizzes
                                    </div>
                                )}
                                {quizzes?.filter((q: any) => q.opened).length === 0 && !isLoadingQuizzes && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                        <p>No open quizzes available</p>
                                        <p className="text-sm">Check back later for new quizzes!</p>
                                    </div>
                                )}
                                <div className="space-y-4 max-h-64 overflow-y-auto">
                                    {quizzes?.filter((q: any) => q.opened).map((quiz: any) => (
                                        <div
                                            key={quiz._id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {quiz.title}
                                                    </span>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Time Limit: {quiz.timeLimit} minutes
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleStartQuiz(quiz._id)}
                                                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors duration-200"
                                            >
                                                <PlayCircle className="w-4 h-4 mr-2"/>
                                                Start Quiz
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {selectedQuiz?.title}
                                    </h2>
                                    <p
                                        className={`font-medium flex items-center gap-2 ${
                                            timeRemaining <= 600 ? "text-red-600 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400"
                                        }`}
                                    >
                                        <Clock className="w-4 h-4"/> Time Remaining: {formatTime(timeRemaining)} •
                                        Question {currentQuestionIndex + 1} of {questions?.length || 0} •
                                        {answeredCount} of {questions?.length || 0} answered
                                    </p>
                                </div>
                                <button
                                    onClick={handleBackToList}
                                    className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                                    disabled={isSubmittingAnswers}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Back to Quizzes
                                </button>
                            </div>
                            {isFetchingQuestions ? (
                                <div className="flex items-center justify-center py-12">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading question...</span>
                                </div>
                            ) : !currentQuestion ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                    <p>No questions available for this quiz</p>
                                </div>
                            ) : (
                                <div
                                    id={`question-${currentQuestionIndex}`}
                                    className={`rounded-2xl shadow-xl p-8 border transition-all duration-200 ${
                                        answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption !==
                                        undefined ||
                                        (answers.find((a) => a.questionId === currentQuestion._id)?.shortAnswer &&
                                            answers
                                                .find((a) => a.questionId === currentQuestion._id)
                                                ?.shortAnswer?.trim() !== "")
                                            ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                                            : "border-red-500 bg-red-50/50 dark:bg-red-900/10"
                                    }`}
                                >
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span
                                                className="flex items-center justify-center w-8 h-8 bg-indigo-500 text-white rounded-full text-sm font-bold">
                                                {currentQuestionIndex + 1}
                                            </span>
                                            <span
                                                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium uppercase">
                                                {currentQuestion.type}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {currentQuestion.questionText}
                                        </h3>
                                        {currentQuestion.type === "mcq" && (
                                            <div className="space-y-3">
                                                {currentQuestion.options?.map((option: string, idx: number) => (
                                                    <label
                                                        key={idx}
                                                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                                                            answers.find((a) => a.questionId === currentQuestion._id)
                                                                ?.selectedOption === idx
                                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                                                : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${currentQuestion._id}`}
                                                            checked={
                                                                answers.find((a) => a.questionId === currentQuestion._id)
                                                                    ?.selectedOption === idx
                                                            }
                                                            onChange={() => handleAnswerChange(currentQuestion._id, idx)}
                                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-3"
                                                            disabled={isSubmittingAnswers}
                                                        />
                                                        <span className="font-medium">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {currentQuestion.type === "truefalse" && (
                                            <div className="flex gap-4">
                                                <label
                                                    className={`flex items-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                                                        answers.find((a) => a.questionId === currentQuestion._id)
                                                            ?.selectedOption === 0
                                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                                            : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${currentQuestion._id}`}
                                                        checked={
                                                            answers.find((a) => a.questionId === currentQuestion._id)
                                                                ?.selectedOption === 0
                                                        }
                                                        onChange={() => handleAnswerChange(currentQuestion._id, 0)}
                                                        className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                        disabled={isSubmittingAnswers}
                                                    />
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2"/>
                                                    <span className="font-medium">True</span>
                                                </label>
                                                <label
                                                    className={`flex items-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                                                        answers.find((a) => a.questionId === currentQuestion._id)
                                                            ?.selectedOption === 1
                                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                                            : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${currentQuestion._id}`}
                                                        checked={
                                                            answers.find((a) => a.questionId === currentQuestion._id)
                                                                ?.selectedOption === 1
                                                        }
                                                        onChange={() => handleAnswerChange(currentQuestion._id, 1)}
                                                        className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                        disabled={isSubmittingAnswers}
                                                    />
                                                    <XCircle className="w-5 h-5 text-red-500 mr-2"/>
                                                    <span className="font-medium">False</span>
                                                </label>
                                            </div>
                                        )}
                                        {currentQuestion.type === "short" && (
                                            <textarea
                                                rows={4}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                                                value={
                                                    answers.find((a) => a.questionId === currentQuestion._id)?.shortAnswer ||
                                                    ""
                                                }
                                                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                                                placeholder="Enter your answer here..."
                                                disabled={isSubmittingAnswers}
                                            />
                                        )}
                                        <div className="flex justify-between mt-6">
                                            <button
                                                onClick={handlePrevQuestion}
                                                disabled={currentQuestionIndex === 0 || isSubmittingAnswers}
                                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            {currentQuestionIndex < (questions?.length || 0) - 1 ? (
                                                <button
                                                    onClick={handleNextQuestion}
                                                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                                                    disabled={isSubmittingAnswers}
                                                >
                                                    Next
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleSubmitQuiz}
                                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-colors duration-200"
                                                    disabled={isSubmittingAnswers}
                                                >
                                                    <Send className="w-4 h-4 mr-2"/>
                                                    {isSubmittingAnswers ? "Submitting..." : "Submit Quiz"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {isTimeUpModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-center mb-4">
                                    <Clock className="w-12 h-12 text-red-500"/>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                                    Time's Up!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                                    The quiz has ended. Your answers have been submitted.
                                </p>
                                <button
                                    onClick={() => setIsTimeUpModalOpen(false)}
                                    className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                                    disabled={isSubmittingAnswers}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizS;