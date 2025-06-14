import { useState, useRef, useEffect } from "react";
import { useCreateQuizMutation, useDeleteQuizMutation, useGetAllQuizzesQuery } from "../../../services/quizApi";
import { useCreateQuestionMutation, useDeleteQuestionMutation, useGetQuestionsByQuizQuery } from "../../../services/questionApi";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

const QuestionTypes = [
    { label: "Multiple Choice", value: "mcq" },
    { label: "True/False", value: "truefalse" },
    { label: "Short Answer", value: "short" },
] as const;

const CsvIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-indigo-600 hover:text-indigo-800 transition"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8v8H8z" />
    </svg>
);

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

const QuizA = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [quizId, setQuizId] = useState<string | null>(null);
    const [quizCreated, setQuizCreated] = useState(false);

    const [type, setType] = useState<"mcq" | "truefalse" | "short">("mcq");
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    const [questionList, setQuestionList] = useState<any[]>([]);
    const [createdQuestions, setCreatedQuestions] = useState<string[]>([]);

    const [createQuiz, { isLoading: isCreatingQuiz }] = useCreateQuizMutation();
    const [deleteQuiz] = useDeleteQuizMutation();

    const [createQuestion, { isLoading: isCreatingQuestion }] = useCreateQuestionMutation();
    const [deleteQuestion] = useDeleteQuestionMutation();

    const { data: quizzes, isLoading, error, refetch } = useGetAllQuizzesQuery();
    const { data: questions, isFetching: isFetchingQuestions, refetch: refetchQuestions } = useGetQuestionsByQuizQuery(quizId!, { skip: !quizId });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        refetch();
        if (quizId && questions && !isFetchingQuestions) {
            setQuestionList(questions);
            setCreatedQuestions(questions.map((q: any) => q._id));
        }
    }, [refetch, quizId, questions, isFetchingQuestions]);

    const addOption = () => {
        setOptions((prev) => [...prev, ""]);
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
            const response = await createQuiz({ title: quizTitle }).unwrap();
            setQuizId(response.quiz._id);
            setQuizCreated(true);
            toast.success("Quiz created successfully");
        } catch (error) {
            toast.error("Failed to create quiz");
            console.error(error);
        }
    };

    const handleEditQuiz = async (quiz: any) => {
        setQuizTitle(quiz.title);
        setQuizId(quiz._id);
        setQuizCreated(true);
        setQuestionList([]);
        setCreatedQuestions([]);
        await refetchQuestions();
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
        setQuestionList([]);
        setCreatedQuestions([]);
        resetForm();
    };

    return (
        <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded-lg transition-colors duration-300 min-h-screen flex flex-col">
            {!quizCreated ? (
                <div className="flex flex-col gap-6 w-full">
                    <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Create a Quiz</h2>
                    <label
                        htmlFor="quizTitle"
                        className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2 w-full max-w-md"
                    >
                        Quiz Title
                    </label>
                    <input
                        id="quizTitle"
                        type="text"
                        className="w-full max-w-md mb-6 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        disabled={isCreatingQuiz}
                        placeholder="Enter quiz title"
                    />
                    <button
                        onClick={handleCreateQuiz}
                        className="w-full max-w-md py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400"
                        disabled={isCreatingQuiz}
                    >
                        {isCreatingQuiz ? "Creating..." : "Create Quiz"}
                    </button>
                    <div className="mt-10 max-w-xl w-full">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Existing Quizzes</h3>
                        {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading quizzes...</p>}
                        {error && <p className="text-red-600 dark:text-red-400">Error loading quizzes</p>}
                        {quizzes?.length === 0 && <p className="text-gray-600 dark:text-gray-400">No quizzes available</p>}
                        <ul className="list-disc list-inside space-y-3 max-h-64 overflow-y-auto text-gray-800 dark:text-gray-200">
                            {quizzes?.map((quiz: any) => (
                                <li key={quiz._id} className="flex items-center justify-between break-words">
                                    <span>{quiz.title}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditQuiz(quiz)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
                            Add Question to Quiz: <span className="italic">{quizTitle}</span>
                        </h2>
                        <div className="flex gap-3 mt-4 sm:mt-0">
                            <button
                                onClick={handleBackToMain}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded text-white transition"
                                disabled={isCreatingQuestion}
                                title="Back to Main"
                            >
                                Back to Main
                            </button>
                            <button
                                onClick={undoLastQuestion}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-white transition"
                                disabled={isCreatingQuestion || createdQuestions.length === 0}
                                title="Undo Last Question"
                            >
                                Undo Last Question
                            </button>
                            <button
                                onClick={undoQuiz}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition"
                                disabled={isCreatingQuestion}
                                title="Undo Quiz"
                            >
                                Undo Quiz
                            </button>
                            <button
                                onClick={handleCsvImport}
                                className="flex items-center justify-center px-3 py-2 bg-indigo-100 hover:bg-indigo-200 rounded text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100 dark:hover:bg-indigo-600 transition"
                                title="Import Questions from CSV"
                                disabled={isCreatingQuestion}
                            >
                                <CsvIcon />
                                <span className="ml-2 hidden sm:inline">Import CSV</span>
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

                    <label
                        htmlFor="questionType"
                        className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Question Type
                    </label>
                    <select
                        id="questionType"
                        value={type}
                        onChange={(e) => setType(e.target.value as "mcq" | "truefalse" | "short")}
                        className="w-full max-w-xl mb-6 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isCreatingQuestion}
                    >
                        {QuestionTypes.map((q) => (
                            <option key={q.value} value={q.value}>
                                {q.label}
                            </option>
                        ))}
                    </select>

                    <label
                        htmlFor="questionText"
                        className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Question Text
                    </label>
                    <textarea
                        id="questionText"
                        rows={3}
                        className="w-full max-w-xl mb-6 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        disabled={isCreatingQuestion}
                        placeholder="Enter question text"
                    />

                    {type === "mcq" && (
                        <div className="mb-6 max-w-xl">
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Options
                            </label>
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(idx, e.target.value)}
                                        className="flex-1 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        disabled={isCreatingQuestion}
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={correctIndex === idx}
                                        onChange={() => setCorrectIndex(idx)}
                                        disabled={isCreatingQuestion}
                                        aria-label={`Mark option ${idx + 1} as correct`}
                                    />
                                    <button
                                        onClick={() => deleteOption(idx)}
                                        className="text-sm text-red-600 hover:underline"
                                        disabled={isCreatingQuestion || options.length <= 2}
                                        aria-label={`Delete option ${idx + 1}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addOption}
                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                                disabled={isCreatingQuestion}
                            >
                                + Add Option
                            </button>
                        </div>
                    )}

                    {type === "truefalse" && (
                        <div className="mb-6 max-w-xl">
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Correct Answer
                            </label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tf"
                                        checked={correctIndex === 0}
                                        onChange={() => setCorrectIndex(0)}
                                        disabled={isCreatingQuestion}
                                    />
                                    True
                                </label>
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tf"
                                        checked={correctIndex === 1}
                                        onChange={() => setCorrectIndex(1)}
                                        disabled={isCreatingQuestion}
                                    />
                                    False
                                </label>
                            </div>
                        </div>
                    )}

                    {type === "short" && (
                        <div className="mb-6 max-w-xl text-base text-gray-600 dark:text-gray-400">
                            Short answer will be reviewed manually.
                        </div>
                    )}

                    <button
                        onClick={editingQuestionId ? handleUpdateQuestion : handleSubmit}
                        className="w-full max-w-xl py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
                        disabled={isCreatingQuestion}
                    >
                        {isCreatingQuestion ? "Submitting..." : editingQuestionId ? "Update Question" : "Submit Question"}
                    </button>

                    <div className="mt-10 max-w-xl w-full">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Question List Preview
                        </h3>
                        {isFetchingQuestions && <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>}
                        {questionList.length === 0 && !isFetchingQuestions && (
                            <p className="text-gray-600 dark:text-gray-400">No questions added yet.</p>
                        )}
                        <ul className="space-y-4 max-h-96 overflow-y-auto text-gray-800 dark:text-gray-200">
                            {questionList.map((q, i) => (
                                <li key={q._id ?? i} className="break-words border-b pb-2">
                                    <div className="flex justify-between items-center">
                                        <div className="font-semibold">
                                            {i + 1}. {q.questionText} ({q.type.toUpperCase()})
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditQuestion(q)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(q._id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    {q.options && q.type === "mcq" && (
                                        <ul className="list-disc list-inside ml-4 mt-1">
                                            {q.options.map((opt: string, idx: number) => (
                                                <li key={idx} className={q.correctAnswerIndex === idx ? "text-green-600" : ""}>
                                                    {opt}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {q.type === "truefalse" && (
                                        <div className="ml-4 mt-1">
                                            Correct Answer: {q.correctAnswerIndex === 0 ? "True" : "False"}
                                        </div>
                                    )}
                                    {q.type === "short" && (
                                        <div className="ml-4 mt-1 text-gray-600 dark:text-gray-400">
                                            Manual review required
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizA;