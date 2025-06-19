import {Edit3, FileText, Trash2, XCircle, Clock, Users, Play} from "lucide-react";

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
        <div className="w-full max-w-4xl mx-auto">
            {/* Header Section */}
            <div
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mr-4">
                            <FileText className="w-8 h-8 text-white"/>
                        </div>
                        <h3 className="text-3xl font-bold text-white">Quiz Library</h3>
                    </div>
                    <p className="text-white/80 text-center max-w-2xl mx-auto">
                        Manage your quizzes with ease. Create, edit, and organize your quiz collection.
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Main Content */}
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 px-8">
                        <div className="relative">
                            <div
                                className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
                            <div
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse opacity-20"></div>
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">Loading your quizzes</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Please wait a moment...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-16 px-8">
                        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400"/>
                        </div>
                        <h4 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                            Unable to load quizzes
                        </h4>
                        <p className="text-red-600 dark:text-red-400 text-center">
                            There was an error loading your quiz collection. Please try again.
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {quizzes?.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 px-8">
                        <div className="relative mb-8">
                            <div
                                className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl">
                                <FileText className="w-16 h-16 text-indigo-600 dark:text-indigo-400"/>
                            </div>
                            <div
                                className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            No quizzes yet
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                            Your quiz library is empty. Start by creating your first quiz to engage your audience!
                        </p>
                        <div
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            Create Your First Quiz
                        </div>
                    </div>
                )}

                {/* Quiz List */}
                {quizzes && quizzes.length > 0 && (
                    <div className="p-6">
                        <div
                            className="grid gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent hover:scrollbar-thumb-indigo-600">
                            {quizzes.map((quiz, index) => (
                                <div
                                    key={quiz._id}
                                    className="group relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-600 animate-fade-in-up"
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    {/* Quiz Status Indicator */}
                                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                                        quiz.opened
                                            ? 'bg-green-400 shadow-lg shadow-green-400/50'
                                            : 'bg-red-400 shadow-lg shadow-red-400/50'
                                    } animate-pulse`}></div>

                                    {/* Main Content */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            {/* Quiz Title */}
                                            <div className="flex items-center mb-3">
                                                <div
                                                    className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                                                    <Play className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/>
                                                </div>
                                                <h5 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                    {quiz.title}
                                                </h5>
                                            </div>

                                            {/* Quiz Metadata */}
                                            <div className="flex flex-wrap gap-3 mb-4">
                                                {/* Group Badge */}
                                                <div
                                                    className="flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                                    <Users className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1.5"/>
                                                    <span
                                                        className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                        {quiz.groupName || "No Group"}
                                                    </span>
                                                </div>

                                                {/* Time Limit Badge */}
                                                {quiz.timeLimit && (
                                                    <div
                                                        className="flex items-center px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                                        <Clock
                                                            className="w-3 h-3 text-orange-600 dark:text-orange-400 mr-1.5"/>
                                                        <span
                                                            className="text-xs font-medium text-orange-700 dark:text-orange-300">
                                                            {quiz.timeLimit}min
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className={`flex items-center px-3 py-1.5 rounded-full ${
                                                    quiz.opened
                                                        ? "bg-green-100 dark:bg-green-900/30"
                                                        : "bg-red-100 dark:bg-red-900/30"
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full mr-1.5 ${
                                                        quiz.opened ? "bg-green-500" : "bg-red-500"
                                                    }`}></div>
                                                    <span className={`text-xs font-medium ${
                                                        quiz.opened
                                                            ? "text-green-700 dark:text-green-300"
                                                            : "text-red-700 dark:text-red-300"
                                                    }`}>
                                                        {quiz.opened ? "Open" : "Closed"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditQuiz(quiz)}
                                                className="group/btn p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-blue-500/25"
                                                title="Edit Quiz"
                                            >
                                                <Edit3
                                                    className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-200"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuiz(quiz._id)}
                                                className="group/btn p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-red-500/25"
                                                title="Delete Quiz"
                                            >
                                                <Trash2
                                                    className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200"/>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <div
                                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizList;