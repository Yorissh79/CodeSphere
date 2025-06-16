import {CheckCircle, FileText, XCircle, Edit3, Trash2} from "lucide-react";

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
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Questions Preview</h3>
                <div
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                    {questionList.length} question{questionList.length !== 1 ? "s" : ""}
                </div>
            </div>

            {isFetchingQuestions && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading questions...</span>
                </div>
            )}

            {questionList.length === 0 && !isFetchingQuestions && (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"/>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No questions yet
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                        Add your first question above to get started!
                    </p>
                </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {questionList.map((q, i) => (
                    <div
                        key={q._id ?? i}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
                    >
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
                                    onClick={() => handleDeleteQuestion(q._id!)}
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
                                    <div
                                        key={idx}
                                        className={`flex items-center p-3 rounded-lg border-2 ${
                                            q.correctAnswerIndex === idx
                                                ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                                q.correctAnswerIndex === idx
                                                    ? "border-green-500 bg-green-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        >
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
                            <div className="flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
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
                            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"/>
                                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Manual review required
                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionList;