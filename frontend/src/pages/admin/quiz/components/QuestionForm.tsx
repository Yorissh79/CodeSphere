import {CheckCircle, FileText, PlusCircle, Trash2, XCircle} from "lucide-react";
import {type QuestionType, QuestionTypes} from "./types";

interface QuestionFormProps {
    type: QuestionType;
    setType: (type: QuestionType) => void;
    questionText: string;
    setQuestionText: (text: string) => void;
    options: string[];
    setOptions: (options: string[]) => void;
    correctIndex: number;
    setCorrectIndex: (index: number) => void;
    isCreatingQuestion: boolean;
    editingQuestionId: string | null;
    addOption: () => void;
    deleteOption: (index: number) => void;
    updateOption: (index: number, value: string) => void;
    handleSubmit: () => Promise<void>;
    handleUpdateQuestion: () => Promise<void>;
}

const QuestionForm = ({
                          type,
                          setType,
                          questionText,
                          setQuestionText,
                          options,
                          correctIndex,
                          setCorrectIndex,
                          isCreatingQuestion,
                          editingQuestionId,
                          addOption,
                          deleteOption,
                          updateOption,
                          handleSubmit,
                          handleUpdateQuestion,
                      }: QuestionFormProps) => {
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Question Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Question Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {QuestionTypes.map((qt) => (
                            <button
                                key={qt.value}
                                onClick={() => setType(qt.value)}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                    type === qt.value
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
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
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
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
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
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
                                <span className="font-medium text-gray-900 dark:text-white">
                  True
                </span>
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
                                <span className="font-medium text-gray-900 dark:text-white">
                  False
                </span>
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
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
    );
};

export default QuestionForm;