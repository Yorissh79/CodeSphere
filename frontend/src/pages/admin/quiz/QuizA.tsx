import { useState } from "react";
import { useCreateQuizMutation } from "../../../services/quizApi";
import { useCreateQuestionMutation } from "../../../services/questionApi";

const QuestionTypes = [
    { label: "Multiple Choice", value: "mcq" },
    { label: "True/False", value: "truefalse" },
    { label: "Short Answer", value: "short" },
] as const;

const CreateQuestion = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [quizId, setQuizId] = useState<string | null>(null);
    const [quizCreated, setQuizCreated] = useState(false);
    const [type, setType] = useState<"mcq" | "truefalse" | "short">("mcq");
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [correctIndex, setCorrectIndex] = useState<number>(0);

    const [createQuiz, { isLoading: isCreatingQuiz }] = useCreateQuizMutation();
    const [createQuestion, { isLoading: isCreatingQuestion }] = useCreateQuestionMutation();

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const deleteOption = (index: number) => {
        const newOptions = options.filter((_, idx) => idx !== index);
        setOptions(newOptions);
        if (correctIndex >= newOptions.length) {
            setCorrectIndex(0);
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCreateQuiz = async () => {
        if (!quizTitle.trim()) return alert("Quiz title is required");
        try {
            const response = await createQuiz({ title: quizTitle }).unwrap();
            setQuizId(response.quiz._id);
            setQuizCreated(true);
        } catch (error) {
            alert("Failed to create quiz");
            console.error(error);
        }
    };

    const handleSubmit = async () => {
        if (!quizId) return alert("No quiz selected");
        if (!questionText.trim()) return alert("Question text is required");

        const payload = {
            quizId,
            type,
            questionText,
            options: type === "mcq" ? options : undefined,
            correctAnswerIndex: type === "mcq" || type === "truefalse" ? correctIndex : undefined,
        };

        try {
            await createQuestion(payload).unwrap();
            setQuestionText("");
            setOptions(["", ""]);
            setCorrectIndex(0);
            setType("mcq");
            alert("Question created successfully");
        } catch (error) {
            alert("Failed to create question");
            console.error(error);
        }
    };

    return (
        <div className="w-full h-screen mx-auto p-8 bg-white dark:bg-gray-950 shadow rounded-lg transition-colors duration-300">
            {!quizCreated ? (
                <div className="flex items-center justify-center flex-col gap-6 p-8 bg-white dark:bg-gray-950">
                    <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">Create a Quiz</h2>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Quiz Title</label>
                    <input
                        type="text"
                        className="w-1/3 mb-6 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        disabled={isCreatingQuiz}
                    />
                    <button
                        onClick={handleCreateQuiz}
                        className="w-1/3 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400"
                        disabled={isCreatingQuiz}
                    >
                        {isCreatingQuiz ? "Creating..." : "Create Quiz"}
                    </button>
                </div>
            ) : (
                <div>
                    <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">Add Question to Quiz: <span className="italic">{quizTitle}</span></h2>

                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Question Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as "mcq" | "truefalse" | "short")}
                        className="w-full mb-6 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        disabled={isCreatingQuestion}
                    >
                        {QuestionTypes.map((q) => (
                            <option key={q.value} value={q.value}>{q.label}</option>
                        ))}
                    </select>

                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Question Text</label>
                    <textarea
                        className="w-full mb-6 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        rows={3}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        disabled={isCreatingQuestion}
                    />

                    {type === "mcq" && (
                        <div className="mb-6">
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Options</label>
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(idx, e.target.value)}
                                        className="flex-1 p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                        disabled={isCreatingQuestion}
                                    />
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={correctIndex === idx}
                                        onChange={() => setCorrectIndex(idx)}
                                        disabled={isCreatingQuestion}
                                    />
                                    <button
                                        onClick={() => deleteOption(idx)}
                                        className="text-sm text-red-600 hover:underline"
                                        disabled={isCreatingQuestion}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addOption}
                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                                disabled={isCreatingQuestion}
                            >
                                + Add Option
                            </button>
                        </div>
                    )}

                    {type === "truefalse" && (
                        <div className="mb-6">
                            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Answer</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <input
                                        type="radio"
                                        name="tf"
                                        checked={correctIndex === 0}
                                        onChange={() => setCorrectIndex(0)}
                                        disabled={isCreatingQuestion}
                                    /> True
                                </label>
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <input
                                        type="radio"
                                        name="tf"
                                        checked={correctIndex === 1}
                                        onChange={() => setCorrectIndex(1)}
                                        disabled={isCreatingQuestion}
                                    /> False
                                </label>
                            </div>
                        </div>
                    )}

                    {type === "short" && (
                        <div className="mb-6 text-base text-gray-600 dark:text-gray-400">
                            Short answer will be reviewed manually.
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
                        disabled={isCreatingQuestion}
                    >
                        {isCreatingQuestion ? "Submitting..." : "Submit Question"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreateQuestion;