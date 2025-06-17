import {Edit3, FileText, Trash2, XCircle} from "lucide-react";

interface Quiz {
    _id: string;
    title: string;
    timeLimit?: number;
    opened?: boolean;
    group?: string; // Group ID
    groupName?: string; // Group name for display
}

interface QuizListProps {
    quizzes: Quiz[] | undefined;
    isLoading: boolean;
    error: any;
    handleEditQuiz: (quiz: Quiz) => void;
    handleDeleteQuiz: (quizId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({
                                               quizzes,
                                               isLoading,
                                               error,
                                               handleEditQuiz,
                                               handleDeleteQuiz,
                                           }) => {
    return (
        <div
            className="w-full max-w-2xl  bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Existing Quizzes</h3>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
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
                {quizzes?.map((quiz) => (
                    <div
                        key={quiz._id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className="font-medium text-gray-900 dark:text-white">{quiz.title}</span>
                            <span
                                className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {quiz.groupName || "No Group"}
              </span>
                            <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    quiz.opened
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                }`}
                            >
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
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                                title="Delete Quiz"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizList;