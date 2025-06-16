import {useState, useEffect} from "react";
import {
    useCreateQuizMutation,
    useDeleteQuizMutation,
    useGetAllQuizzesQuery,
    useUpdateQuizMutation,
} from "../../../services/quizApi";
import {
    useCreateQuestionMutation,
    useDeleteQuestionMutation,
    useGetQuestionsByQuizQuery,
} from "../../../services/questionApi";
import Papa from "papaparse";
import {toast} from "react-hot-toast";
import {Edit3} from "lucide-react";
import TimeEditModal from "../../admin/quiz/TimeEditModal";
import QuizCreator from "./components/QuizCreator";
import QuizList from "./components/QuizList";
import QuizHeader from "./components/QuizHeader";
import QuizStatus from "./components/QuizStatus";
import QuestionForm from "./components/QuestionForm";
import QuestionList from "./components/QuestionList";
import {useGetAllGroupsQuery} from "../../../services/groupApi";

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

const QuizT: React.FC = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [quizId, setQuizId] = useState<string | null>(null);
    const [quizCreated, setQuizCreated] = useState(false);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [quizOpened, setQuizOpened] = useState<boolean>(false);
    const [group, setGroup] = useState<string>("");

    const [type, setType] = useState<"mcq" | "truefalse" | "short">("mcq");
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [quizTime, setQuizTime] = useState<number>(30);
    const [questionList, setQuestionList] = useState<any[]>([]);
    const [createdQuestions, setCreatedQuestions] = useState<string[]>([]);

    const [createQuiz, {isLoading: isCreatingQuiz}] = useCreateQuizMutation();
    const [deleteQuiz] = useDeleteQuizMutation();
    const [updateQuiz] = useUpdateQuizMutation();
    const [createQuestion, {isLoading: isCreatingQuestion}] = useCreateQuestionMutation();
    const [deleteQuestion] = useDeleteQuestionMutation();

    const {data: quizzes, isLoading, error, refetch} = useGetAllQuizzesQuery();
    const {
        data: questions,
        isFetching: isFetchingQuestions,
        error: questionsError,
        refetch: refetchQuestions,
    } = useGetQuestionsByQuizQuery(quizId!, {skip: !quizId});
    const {data: groups} = useGetAllGroupsQuery({}); // Fetch groups

    // Map group ID to group name
    const getGroupName = (groupId: string): string => {
        const foundGroup = groups?.find((g: { _id: string; group: string }) => g._id === groupId);
        return foundGroup?.group || "No Group";
    };

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
        if (!group) return toast.error("Group is required");
        try {
            const response = await createQuiz({
                title: quizTitle,
                timeLimit: quizTime,
                opened: false,
                group,
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
        setQuizOpened(quiz.opened || false);
        setGroup(quiz.group || "");
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

    const handleTimeUpdate = async (newTime: number) => {
        if (!quizId) return toast.error("No quiz selected");
        try {
            await updateQuiz({
                id: quizId,
                title: quizTitle,
                timeLimit: newTime,
                opened: quizOpened,
                group,
            }).unwrap();
            setQuizTime(newTime);
            toast.success(`Time limit updated to ${newTime} minutes`);
        } catch (error) {
            toast.error("Failed to update time");
            console.error(error);
        }
    };

    const handleStatusUpdate = async () => {
        if (!quizId) return toast.error("No quiz selected");
        try {
            await updateQuiz({
                id: quizId,
                title: quizTitle,
                timeLimit: quizTime,
                opened: quizOpened,
                group,
            }).unwrap();
            toast.success(`Quiz ${quizOpened ? "opened" : "closed"} successfully`);
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
            setQuizOpened(false);
            setGroup("");
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

    // Enrich quizzes with group names
    const enrichedQuizzes = quizzes?.map((quiz: any) => ({
        ...quiz,
        groupName: getGroupName(quiz.group),
    }));

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8 px-4 transition-all duration-300">
            <div className="max-w-4xl mx-auto">
                {!quizCreated ? (
                    <>
                        <QuizCreator
                            quizTitle={quizTitle}
                            setQuizTitle={setQuizTitle}
                            quizTime={quizTime}
                            setQuizTime={setQuizTime}
                            group={group}
                            setGroup={setGroup}
                            isCreatingQuiz={isCreatingQuiz}
                            handleCreateQuiz={handleCreateQuiz}
                        />
                        <QuizList
                            quizzes={enrichedQuizzes}
                            isLoading={isLoading}
                            error={error}
                            handleEditQuiz={handleEditQuiz}
                            handleDeleteQuiz={handleDeleteQuiz}
                        />
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsTimeModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
                            disabled={isCreatingQuestion}
                        >
                            <Edit3 className="w-4 h-4 mr-2"/>
                            Edit Time
                        </button>
                        <QuizStatus
                            quizOpened={quizOpened}
                            setQuizOpened={setQuizOpened}
                            isCreatingQuestion={isCreatingQuestion}
                            handleStatusUpdate={handleStatusUpdate}
                        />
                        <QuizHeader
                            quizTitle={quizTitle}
                            quizTime={quizTime}
                            groupName={getGroupName(group)}
                            isCreatingQuestion={isCreatingQuestion}
                            createdQuestions={createdQuestions}
                            editingQuestionId={editingQuestionId}
                            fileInputRef={fileInputRef}
                            handleBackToMain={() => {
                                setQuizCreated(false);
                                resetForm();
                            }}
                            undoLastQuestion={undoLastQuestion}
                            undoQuiz={undoQuiz}
                            handleCsvImport={handleCsvImport}
                        />
                        <QuestionForm
                            type={type}
                            setType={setType}
                            questionText={questionText}
                            setQuestionText={setQuestionText}
                            options={options}
                            setOptions={setOptions}
                            correctIndex={correctIndex}
                            setCorrectIndex={setCorrectIndex}
                            isCreatingQuestion={isCreatingQuestion}
                            editingQuestionId={editingQuestionId}
                            addOption={addOption}
                            deleteOption={deleteOption}
                            updateOption={updateOption}
                            handleSubmit={handleSubmit}
                            handleUpdateQuestion={handleUpdateQuestion}
                        />
                        <QuestionList
                            questionList={questionList}
                            isFetchingQuestions={isFetchingQuestions}
                            handleEditQuestion={handleEditQuestion}
                            handleDeleteQuestion={handleDeleteQuestion}
                        />
                    </>
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