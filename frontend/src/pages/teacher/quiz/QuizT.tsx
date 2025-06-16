import {useState, useRef, useEffect} from "react";
import {
    useCreateQuizMutation,
    useDeleteQuizMutation,
    useGetAllQuizzesQuery,
    useUpdateQuizMutation
} from "../../../services/quizApi";
import {
    useCreateQuestionMutation,
    useDeleteQuestionMutation,
    useGetQuestionsByQuizQuery
} from "../../../services/questionApi";
import Papa from "papaparse";
import {toast} from "react-hot-toast";
import {
    ArrowLeft,
    CheckCircle,
    Edit3,
    FileText,
    PlusCircle,
    RotateCcw,
    Trash2,
    Undo,
    Upload,
    XCircle
} from "lucide-react";
import TimeEditModal from '../../admin/quiz/TimeEditModal';

const QuestionTypes = [
    {label: "Multiple Choice", value: "mcq", icon: "📋"},
    {label: "True/False", value: "truefalse", icon: "✓"},
    {label: "Short Answer", value: "short", icon: "📝"},
] as const;

interface QuestionPayload {
    quizId: string;
    type: "mcq" | "truefalse" | "short";
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

interface ImportedQuestion {
    type: "mcq" | "truefalse" | "short";
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

const QuizT = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [quizId, setQuizId] = useState<string | null>(null);
    const [quizCreated, setQuizCreated] = useState(false);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [quizOpened, setQuizOpened] = useState<boolean>(false); // Added quizOpened state

    const [type, setType] = useState<"mcq" | "truefalse" | "short">("mcq");
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [quizTime, setQuizTime] = useState<number>(30); // Default 30 minutes

    const [questionList, setQuestionList] = useState<any[]>([]);
    const [createdQuestions, setCreatedQuestions] = useState<string[]>([]);

    const [createQuiz, {isLoading: isCreatingQuiz}] = useCreateQuizMutation();
    const [deleteQuiz] = useDeleteQuizMutation();
    const [updateQuiz] = useUpdateQuizMutation(); // Added updateQuiz mutation

    const [createQuestion, {isLoading: isCreatingQuestion}] = useCreateQuestionMutation();
    const [deleteQuestion] = useDeleteQuestionMutation();

    const {data: quizzes, isLoading, error, refetch} = useGetAllQuizzesQuery();
    const {
        data: questions,
        isFetching: isFetchingQuestions,
        error: questionsError,
        refetch: refetchQuestions
    } = useGetQuestionsByQuizQuery(quizId!, {skip: !quizId});

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        refetch();
        if (quizId && questions && !isFetchingQuestions) {
            setQuestionList(questions);
            setCreatedQuestions(questions.map((q: any) => q._id));
        }
        if (quizId && questionsError) {
            toast.error("Failed to fetch questions");
            console.error(questionsError);
        }
    }, [refetch, quizId, questions, isFetchingQuestions]);

    const addOption = () => {
        setOptions((prev) => [...prev, ""]);
    };

    // Updated handleTimeUpdate to sync with backend and update local state
    const handleTimeUpdate = async (newTime: number) => {
        if (!quizId) return toast.error("No quiz selected");
        try {
            await updateQuiz({
                id: quizId,
                title: quizTitle,
                timeLimit: newTime,
                opened: quizOpened
            }).unwrap();
            setQuizTime(newTime); // Update local state
            toast.success(`Time limit updated to ${newTime} minutes`);
        } catch (error) {
            toast.error("Failed to update time");
            console.error(error);
        }
    };

    const deleteOption = (index: number) => {
        setOptions((prev) => {
            const newOpts = prev.filter((_, i) => i !== index);
            if (correctIndex >= newOpts.length) setCorrectIndex(0);
            return newOpts;
        });
    };

    const updateOption = (index: number, value: string) => {
        setOptions((prev) => {
            const newOpts = [...prev];
            newOpts[index] = value;
            return newOpts;
        });
    };

    const handleCreateQuiz = async () => {
        if (!quizTitle.trim()) return toast.error("Quiz title is required");
        try {
            const response = await createQuiz({
                title: quizTitle,
                timeLimit: quizTime,
                opened: false
            }).unwrap();
            setQuizId(response.quiz._id);
            setQuizCreated(true);
            setQuestionList([]);
            setCreatedQuestions([]);
            toast.success("Quiz created successfully");
        } catch (error) {
            toast.error("Failed to create quiz");
            console.error(error);
        }
    };

    const handleEditQuiz = (quiz: any) => {
        setQuizTitle(quiz.title);
        setQuizTime(quiz.timeLimit || 30);
        setQuizOpened(quiz.opened || false); // Initialize quiz status
        setQuizId(quiz._id);
        setQuizCreated(true);
        setQuestionList([]);
        setCreatedQuestions([]);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        try {
            await deleteQuiz(quizId).unwrap();
            toast.success("Quiz deleted successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to delete quiz");
            console.error(error);
        }
    };

    // Added handleStatusUpdate for quiz status
    const handleStatusUpdate = async () => {
        if (!quizId) return toast.error("No quiz selected");
        try {
            await updateQuiz({
                id: quizId,
                title: quizTitle,
                timeLimit: quizTime,
                opened: quizOpened
            }).unwrap();
            toast.success(`Quiz ${quizOpened ? 'opened' : 'closed'} successfully`);
        } catch (error) {
            toast.error("Failed to update quiz status");
            console.error(error);
        }
    };

    const handleEditQuestion = (question: any) => {
        setEditingQuestionId(question._id);
        setType(question.type);
        setQuestionText(question.questionText);
        setOptions(question.options || ["", ""]);
        setCorrectIndex(question.correctAnswerIndex || 0);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        try {
            await deleteQuestion(questionId).unwrap();
            setQuestionList((prev) => prev.filter((q) => q._id !== questionId));
            setCreatedQuestions((prev) => prev.filter((id) => id !== questionId));
            toast.success("Question deleted successfully");
            refetchQuestions();
        } catch (error) {
            toast.error("Failed to delete question");
            console.error(error);
        }
    };

    const handleSubmit = async () => {
        if (!quizId) return toast.error("No quiz selected");
        if (!questionText.trim()) return toast.error("Question text is required");

        const payload: QuestionPayload = {
            quizId,
            type,
            questionText,
            options: type === "mcq" ? options : undefined,
            correctAnswerIndex: type === "mcq" || type === "truefalse" ? correctIndex : undefined,
        };

        try {
            const res = await createQuestion(payload).unwrap();
            setCreatedQuestions((prev) => [...prev, res.question._id]);
            setQuestionList((prev) => [...prev, res.question]);
            resetForm();
            toast.success("Question created successfully");
        } catch (error) {
            toast.error("Failed to create question");
            console.error(error);
        }
    };

    const handleUpdateQuestion = async () => {
        if (!quizId || !editingQuestionId) return toast.error("No question selected");
        if (!questionText.trim()) return toast.error("Question text is required");

        const payload: QuestionPayload = {
            quizId,
            type,
            questionText,
            options: type === "mcq" ? options : undefined,
            correctAnswerIndex: type === "mcq" || type === "truefalse" ? correctIndex : undefined,
        };

        try {
            const res = await createQuestion(payload).unwrap();
            await deleteQuestion(editingQuestionId).unwrap();
            setQuestionList((prev) => [
                ...prev.filter((q) => q._id !== editingQuestionId),
                res.question,
            ]);
            setCreatedQuestions((prev) => [
                ...prev.filter((id) => id !== editingQuestionId),
                res.question._id,
            ]);
            resetForm();
            toast.success("Question updated successfully");
        } catch (error) {
            toast.error("Failed to update question");
            console.error(error);
        }
    };

    const resetForm = () => {
        setQuestionText("");
        setOptions(["", ""]);
        setCorrectIndex(0);
        setType("mcq");
        setEditingQuestionId(null);
    };

    const undoLastQuestion = async () => {
        if (createdQuestions.length === 0) {
            toast.error("No question to undo");
            return;
        }

        const lastId = createdQuestions[createdQuestions.length - 1];
        try {
            await deleteQuestion(lastId).unwrap();
            setCreatedQuestions((prev) => prev.slice(0, -1));
            setQuestionList((prev) => prev.slice(0, -1));
            toast.success("Last question deleted");
        } catch (error) {
            toast.error("Failed to delete last question");
        }
    };

    const undoQuiz = async () => {
        if (!quizId) {
            toast.error("No quiz to undo");
            return;
        }
        try {
            await Promise.all(createdQuestions.map((id) => deleteQuestion(id).unwrap()));
            await deleteQuiz(quizId).unwrap();
            setQuizId(null);
            setQuizCreated(false);
            setCreatedQuestions([]);
            setQuestionList([]);
            setQuizTitle("");
            setQuizTime(30);
            setQuizOpened(false); // Reset quiz status
            resetForm();
            toast.success("Quiz and all questions deleted");
        } catch (error) {
            toast.error("Failed to delete quiz");
            console.error(error);
        }
    };

    const handleCsvImport = () => {
        if (!fileInputRef.current) return;
        fileInputRef.current.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse<ImportedQuestion>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                if (!quizId) {
                    toast.error("Create quiz first before importing questions.");
                    return;
                }

                const questions = results.data;
                for (const q of questions) {
                    if (!q.questionText || !q.type) {
                        toast.error("Invalid question data in CSV");
                        continue;
                    }

                    const payload: QuestionPayload = {
                        quizId,
                        type: q.type,
                        questionText: q.questionText,
                        options: q.type === "mcq" ? q.options : undefined,
                        correctAnswerIndex:
                            q.type === "mcq" || q.type === "truefalse" ? q.correctAnswerIndex : undefined,
                    };

                    try {
                        const res = await createQuestion(payload).unwrap();
                        setCreatedQuestions((prev) => [...prev, res.question._id]);
                        setQuestionList((prev) => [...prev, res.question]);
                    } catch (err) {
                        toast.error("Error importing question");
                        console.error(err);
                    }
                }
                toast.success("CSV import finished");
            },
            error: (error) => {
                toast.error("Failed to parse CSV file");
                console.error(error);
            },
        });
    };

    const handleBackToMain = () => {
        setQuizId(null);
        setQuizCreated(false);
        setQuizTitle("");
        setQuizTime(30);
        setQuizOpened(false); // Reset quiz status
        setQuestionList([]);
        setCreatedQuestions([]);
        resetForm();
        refetchQuestions();
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8 px-4 transition-all duration-300">
            <div className="max-w-4xl mx-auto">
                {!quizCreated ? (
                    <div className="flex flex-col items-center justify-center space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg mb-4">
                                <FileText className="w-8 h-8 text-white"/>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Quiz Creator
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                Create engaging quizzes with multiple question types
                            </p>
                        </div>

                        {/* Create Quiz Form */}
                        <div
                            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="quizTitle"
                                           className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Quiz Title
                                    </label>
                                    <input
                                        id="quizTitle"
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        disabled={isCreatingQuiz}
                                        placeholder="Enter your quiz title..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quizTime"
                                           className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Quiz Time (minutes)
                                    </label>
                                    <input
                                        id="quizTime"
                                        type="number"
                                        min="1"
                                        max="300"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                                        value={quizTime}
                                        onChange={(e) => setQuizTime(parseInt(e.target.value))}
                                        disabled={isCreatingQuiz}
                                        placeholder="Enter quiz duration..."
                                    />
                                </div>
                                <button
                                    onClick={handleCreateQuiz}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={isCreatingQuiz}
                                >
                                    {isCreatingQuiz ? (
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <PlusCircle className="w-5 h-5 mr-2"/>
                                            Create Quiz
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Existing Quizzes */}
                        <div
                            className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Existing Quizzes</h3>
                            </div>

                            {isLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading quizzes...</span>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
                                    <XCircle className="w-5 h-5 mr-2"/>
                                    Error loading quizzes
                                </div>
                            )}

                            {quizzes?.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                    <p>No quizzes available yet</p>
                                    <p className="text-sm">Create your first quiz above!</p>
                                </div>
                            )}

                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {quizzes?.map((quiz: any) => (
                                    <div key={quiz._id}
                                         className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            <span
                                                className="font-medium text-gray-900 dark:text-white">{quiz.title}</span>
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${quiz.opened ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                                {quiz.opened ? "Open" : "Closed"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditQuiz(quiz)}
                                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                                                title="Edit Quiz"
                                            >
                                                <Edit3 className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuiz(quiz._id)}
                                                className="p-2 bg-red-5 System: 00 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                                                title="Delete Quiz">
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Header with Actions */}
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {editingQuestionId ? "Edit Question" : "Add Question"}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                                Quiz: {quizTitle} • {quizTime} minutes
                            </p>
                        </div>
                        <button
                            onClick={() => setIsTimeModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
                            disabled={isCreatingQuestion}
                        >
                            <Edit3 className="w-4 h-4 mr-2"/>
                            Edit Time
                        </button>
                        {/* Added Quiz Status Section */}
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Quiz Status
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Control whether students can access this quiz
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span
                                        className={`px-3 py-1 text-sm font-semibold rounded-full ${quizOpened ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                        {quizOpened ? "Open" : "Closed"}
                                    </span>
                                    <button
                                        onClick={() => setQuizOpened(!quizOpened)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${quizOpened ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        disabled={isCreatingQuestion}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${quizOpened ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </button>
                                    <button
                                        onClick={handleStatusUpdate}
                                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                                        disabled={isCreatingQuestion}
                                    >
                                        Save Status
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                            <div
                                className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {editingQuestionId ? "Edit Question" : "Add Question"}
                                    </h2>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                                        Quiz: {quizTitle}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={handleBackToMain}
                                        className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                                        disabled={isCreatingQuestion}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2"/>
                                        Back
                                    </button>
                                    <button
                                        onClick={undoLastQuestion}
                                        className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                                        disabled={isCreatingQuestion || createdQuestions.length === 0}
                                    >
                                        <Undo className="w-4 h-4 mr-2"/>
                                        Undo Last
                                    </button>
                                    <button
                                        onClick={undoQuiz}
                                        className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                                        disabled={isCreatingQuestion}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2"/>
                                        Reset Quiz
                                    </button>
                                    <button
                                        onClick={handleCsvImport}
                                        className="flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                                        disabled={isCreatingQuestion}
                                    >
                                        <Upload className="w-4 h-4 mr-2"/>
                                        Import CSV
                                    </button>
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={onFileChange}
                                        disabled={isCreatingQuestion}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Question Form */}
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="max-w-2xl mx-auto space-y-6">
                                {/* Question Type */}
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Question Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {QuestionTypes.map((qt) => (
                                            <button
                                                key={qt.value}
                                                onClick={() => setType(qt.value)}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    type === qt.value
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                                                }`}
                                                disabled={isCreatingQuestion}
                                            >
                                                <div className="text-2xl mb-2">{qt.icon}</div>
                                                <div className="text-sm font-medium">{qt.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Question Text
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        disabled={isCreatingQuestion}
                                        placeholder="Enter your question here..."
                                    />
                                </div>

                                {/* MCQ Options */}
                                {type === "mcq" && (
                                    <div>
                                        <label
                                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Answer Options
                                        </label>
                                        <div className="space-y-3">
                                            {options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="correct"
                                                            checked={correctIndex === idx}
                                                            onChange={() => setCorrectIndex(idx)}
                                                            disabled={isCreatingQuestion}
                                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => updateOption(idx, e.target.value)}
                                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                                                        disabled={isCreatingQuestion}
                                                        placeholder={`Option ${idx + 1}`}
                                                    />
                                                    <button
                                                        onClick={() => deleteOption(idx)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                                        disabled={isCreatingQuestion || options.length <= 2}
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addOption}
                                                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                                                disabled={isCreatingQuestion}
                                            >
                                                <PlusCircle className="w-5 h-5 mr-2"/>
                                                Add Option
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* True/False Options */}
                                {type === "truefalse" && (
                                    <div>
                                        <label
                                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Correct Answer
                                        </label>
                                        <div className="flex gap-4">
                                            <label
                                                className="flex items-center px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                <input
                                                    type="radio"
                                                    name="tf"
                                                    checked={correctIndex === 0}
                                                    onChange={() => setCorrectIndex(0)}
                                                    disabled={isCreatingQuestion}
                                                    className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                />
                                                <CheckCircle className="w-5 h-5 text-green-500 mr-2"/>
                                                <span className="font-medium text-gray-900 dark:text-white">True</span>
                                            </label>
                                            <label
                                                className="flex items-center px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                <input
                                                    type="radio"
                                                    name="tf"
                                                    checked={correctIndex === 1}
                                                    onChange={() => setCorrectIndex(1)}
                                                    disabled={isCreatingQuestion}
                                                    className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                />
                                                <XCircle className="w-5 h-5 text-red-500 mr-2"/>
                                                <span className="font-medium text-gray-900 dark:text-white">False</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Short Answer Info */}
                                {type === "short" && (
                                    <div
                                        className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"/>
                                            <span className="text-blue-800 dark:text-blue-200 font-medium">
                                                Short answer questions will be reviewed manually
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    onClick={editingQuestionId ? handleUpdateQuestion : handleSubmit}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={isCreatingQuestion}
                                >
                                    {isCreatingQuestion ? (
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {editingQuestionId ? "Updating..." : "Creating..."}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 mr-2"/>
                                            {editingQuestionId ? "Update Question" : "Add Question"}
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Question List */}
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Questions Preview</h3>
                                <div
                                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                                    {questionList.length} question{questionList.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {isFetchingQuestions && (
                                <div className="flex items-center justify-center py-12">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading questions...</span>
                                </div>
                            )}

                            {questionList.length === 0 && !isFetchingQuestions && (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"/>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions
                                        yet</h4>
                                    <p className="text-gray-500 dark:text-gray-400">Add your first question above to get
                                        started!</p>
                                </div>
                            )}

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {questionList.map((q, i) => (
                                    <div key={q._id ?? i}
                                         className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span
                                                        className="flex items-center justify-center w-8 h-8 bg-indigo-500 text-white rounded-full text-sm font-bold">
                                                        {i + 1}
                                                    </span>
                                                    <span
                                                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium uppercase">
                                                        {q.type}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">
                                                    {q.questionText}
                                                </h4>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditQuestion(q)}
                                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                                                    title="Edit Question"
                                                >
                                                    <Edit3 className="w-4 h-4"/>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(q._id)}
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                                                    title="Delete Question"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>

                                        {q.options && q.type === "mcq" && (
                                            <div className="space-y-2">
                                                {q.options.map((opt: string, idx: number) => (
                                                    <div key={idx}
                                                         className={`flex items-center p-3 rounded-lg border-2 ${
                                                             q.correctAnswerIndex === idx
                                                                 ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                                 : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                                         }`}>
                                                        <div
                                                            className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                                                q.correctAnswerIndex === idx
                                                                    ? 'border-green-500 bg-green-500'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                            }`}>
                                                            {q.correctAnswerIndex === idx && (
                                                                <CheckCircle className="w-3 h-3 text-white"/>
                                                            )}
                                                        </div>
                                                        <span className="font-medium">{opt}</span>
                                                        {q.correctAnswerIndex === idx && (
                                                            <span
                                                                className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400">
                                                                CORRECT
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "truefalse" && (
                                            <div
                                                className="flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                                {q.correctAnswerIndex === 0 ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2"/>
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500 mr-2"/>
                                                )}
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Correct Answer: {q.correctAnswerIndex === 0 ? "True" : "False"}
                                                </span>
                                            </div>
                                        )}

                                        {q.type === "short" && (
                                            <div
                                                className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                <FileText
                                                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"/>
                                                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                                                    Manual review required
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <TimeEditModal
                isOpen={isTimeModalOpen}
                onClose={() => setIsTimeModalOpen(false)}
                currentTime={quizTime}
                onSave={handleTimeUpdate}
            />
        </div>
    );
};

export default QuizT;