import {CheckCircle, FileText, XCircle, Edit3, Trash2, Brain, Clock, Target} from "lucide-react";

interface Question {
    _id?: string;
    type: "mcq" | "truefalse" | "short";
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

interface QuestionListProps {
    questionList: Question[];
    isFetchingQuestions: boolean;
    handleEditQuestion: (question: Question) => void;
    handleDeleteQuestion: (questionId: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
                                                       questionList,
                                                       isFetchingQuestions,
                                                       handleEditQuestion,
                                                       handleDeleteQuestion,
                                                   }) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'mcq':
                return <Brain className="w-4 h-4"/>;
            case 'truefalse':
                return <Target className="w-4 h-4"/>;
            case 'short':
                return <FileText className="w-4 h-4"/>;
            default:
                return <FileText className="w-4 h-4"/>;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'mcq':
                return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            case 'truefalse':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'short':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'mcq':
                return 'Multiple Choice';
            case 'truefalse':
                return 'True/False';
            case 'short':
                return 'Short Answer';
            default:
                return type;
        }
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Glassmorphism Container */}
            <div
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <FileText className="w-8 h-8 text-white"/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-1">Questions Bank</h3>
                                    <p className="text-indigo-100 text-sm">Manage your question collection</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div
                                    className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-white font-semibold text-lg">
                                            {questionList.length}
                                        </span>
                                        <span className="text-indigo-100 text-sm">
                                            question{questionList.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div
                        className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div
                        className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {isFetchingQuestions && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative">
                                <div
                                    className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 rounded-full animate-spin border-t-indigo-600"></div>
                                <div
                                    className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-indigo-400"></div>
                            </div>
                            <div className="mt-6 text-center">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading
                                    Questions</h4>
                                <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch your
                                    questions...</p>
                            </div>
                        </div>
                    )}

                    {questionList.length === 0 && !isFetchingQuestions && (
                        <div className="text-center py-16">
                            <div className="relative mb-8">
                                <div
                                    className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl mx-auto flex items-center justify-center">
                                    <FileText className="w-12 h-12 text-indigo-500 dark:text-indigo-400"/>
                                </div>
                                <div
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-yellow-900">!</span>
                                </div>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                No Questions Yet
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                                Start building your question bank by adding your first question above.
                                <span className="block mt-2 text-indigo-600 dark:text-indigo-400 font-medium">Let's get started! 🚀</span>
                            </p>
                        </div>
                    )}

                    {/* Questions Grid */}
                    <div
                        className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent">
                        {questionList.map((q, i) => (
                            <div
                                key={q._id ?? i}
                                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                            >
                                {/* Question Header */}
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                {/* Question Number */}
                                                <div className="relative">
                                                    <div
                                                        className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                        <span className="text-white font-bold text-lg">{i + 1}</span>
                                                    </div>
                                                    <div
                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                                                </div>

                                                {/* Question Type Badge */}
                                                <div
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getTypeColor(q.type)} backdrop-blur-sm`}>
                                                    {getTypeIcon(q.type)}
                                                    <span
                                                        className="font-semibold text-sm">{getTypeLabel(q.type)}</span>
                                                </div>
                                            </div>

                                            {/* Question Text */}
                                            <h4 className="font-bold text-gray-900 dark:text-white text-xl mb-4 leading-relaxed">
                                                {q.questionText}
                                            </h4>
                                        </div>

                                        {/* Action Buttons */}
                                        <div
                                            className="flex gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleEditQuestion(q)}
                                                className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg shadow-blue-500/25"
                                                title="Edit Question"
                                            >
                                                <Edit3 className="w-5 h-5"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(q._id!)}
                                                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg shadow-red-500/25"
                                                title="Delete Question"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="p-6">
                                    {/* MCQ Options */}
                                    {q.options && q.type === "mcq" && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Clock className="w-4 h-4 text-gray-500"/>
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Answer Options</span>
                                            </div>
                                            {q.options.map((opt: string, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`group/option flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                                        q.correctAnswerIndex === idx
                                                            ? "border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 shadow-lg shadow-emerald-500/10"
                                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                                                    }`}
                                                >
                                                    {/* Option Indicator */}
                                                    <div
                                                        className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                                                            q.correctAnswerIndex === idx
                                                                ? "border-emerald-500 bg-emerald-500 shadow-lg"
                                                                : "border-gray-300 dark:border-gray-600 group-hover/option:border-indigo-400"
                                                        }`}>
                                                        {q.correctAnswerIndex === idx && (
                                                            <CheckCircle className="w-4 h-4 text-white"/>
                                                        )}
                                                    </div>

                                                    <span className={`font-medium flex-1 ${
                                                        q.correctAnswerIndex === idx
                                                            ? "text-emerald-800 dark:text-emerald-200"
                                                            : "text-gray-700 dark:text-gray-300"
                                                    }`}>
                                                        {opt}
                                                    </span>

                                                    {q.correctAnswerIndex === idx && (
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md">
                                                                CORRECT
                                                            </span>
                                                            <div
                                                                className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* True/False */}
                                    {q.type === "truefalse" && (
                                        <div
                                            className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    {q.correctAnswerIndex === 0 ? (
                                                        <div className="p-2 bg-green-500 rounded-xl mr-4">
                                                            <CheckCircle className="w-6 h-6 text-white"/>
                                                        </div>
                                                    ) : (
                                                        <div className="p-2 bg-red-500 rounded-xl mr-4">
                                                            <XCircle className="w-6 h-6 text-white"/>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span
                                                            className="text-sm font-medium text-gray-500 dark:text-gray-400 block">Correct Answer</span>
                                                        <span
                                                            className="font-bold text-lg text-gray-900 dark:text-white">
                                                            {q.correctAnswerIndex === 0 ? "True" : "False"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold text-sm">
                                                    Boolean
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Short Answer */}
                                    {q.type === "short" && (
                                        <div
                                            className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-amber-500 rounded-xl mr-4">
                                                        <FileText className="w-6 h-6 text-white"/>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="text-sm font-medium text-amber-600 dark:text-amber-400 block">Assessment Type</span>
                                                        <span
                                                            className="font-bold text-lg text-amber-800 dark:text-amber-200">
                                                            Manual Review Required
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold text-sm">
                                                    Text Input
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionList;