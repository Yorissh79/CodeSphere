import {CheckCircle, FileText, PlusCircle, Trash2, XCircle, Sparkles, Target, Edit3} from "lucide-react";
import type {ChangeEvent, Dispatch, SetStateAction} from "react";

const QuestionTypes = [
    {label: "Multiple Choice", value: "mcq", icon: "🎯", gradient: "from-purple-500 to-pink-600"},
    {label: "True/False", value: "truefalse", icon: "⚡", gradient: "from-blue-500 to-cyan-600"},
    {label: "Short Answer", value: "short", icon: "✨", gradient: "from-emerald-500 to-teal-600"},
] as const;

interface QuestionFormProps {
    type: "mcq" | "truefalse" | "short";
    setType: Dispatch<SetStateAction<"mcq" | "truefalse" | "short">>;
    questionText: string;
    setQuestionText: Dispatch<SetStateAction<string>>;
    options: string[];
    setOptions: Dispatch<SetStateAction<string[]>>;
    correctIndex: number;
    setCorrectIndex: Dispatch<SetStateAction<number>>;
    isCreatingQuestion: boolean;
    editingQuestionId: string | null;
    addOption: () => void;
    deleteOption: (index: number) => void;
    updateOption: (index: number, value: string) => void;
    handleSubmit: () => void;
    handleUpdateQuestion: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
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
                                                   }) => {
    return (
        <div
            className=" w-full max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <Sparkles className="w-8 h-8 text-white"/>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                        {editingQuestionId ? "Edit Question" : "Create Question"}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Craft engaging questions that challenge and inspire
                    </p>
                </div>

                {/* Main Form Card */}
                <div
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
                    {/* Decorative Header */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="p-8 space-y-8">
                        {/* Question Type Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                                    Question Type
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {QuestionTypes.map((qt) => (
                                    <button
                                        key={qt.value}
                                        onClick={() => setType(qt.value)}
                                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                            type === qt.value
                                                ? "border-transparent bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 shadow-xl ring-2 ring-indigo-500 ring-opacity-60"
                                                : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/80"
                                        }`}
                                        disabled={isCreatingQuestion}
                                    >
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${qt.gradient} opacity-0 rounded-2xl transition-opacity duration-300 ${
                                                type === qt.value ? "opacity-10" : "group-hover:opacity-5"
                                            }`}></div>

                                        <div className="relative">
                                            <div
                                                className="text-3xl mb-3 transform transition-transform duration-300 group-hover:scale-110">
                                                {qt.icon}
                                            </div>
                                            <div className={`text-sm font-semibold transition-colors duration-300 ${
                                                type === qt.value
                                                    ? "text-indigo-700 dark:text-indigo-300"
                                                    : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                                            }`}>
                                                {qt.label}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                                    Question Text
                                </h2>
                            </div>

                            <div className="relative">
                                <textarea
                                    rows={4}
                                    className="w-full px-6 py-4 bg-slate-50/80 dark:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none backdrop-blur-sm"
                                    value={questionText}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setQuestionText(e.target.value)}
                                    disabled={isCreatingQuestion}
                                    placeholder="Enter your question here... Make it engaging and clear!"
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* MCQ Options */}
                        {type === "mcq" && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                                        Answer Options
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {options.map((opt, idx) => (
                                        <div key={idx}
                                             className="group flex items-center gap-4 p-4 bg-slate-50/80 dark:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 backdrop-blur-sm">
                                            <div className="flex items-center">
                                                <div className="relative">
                                                    <input
                                                        type="radio"
                                                        name="correct"
                                                        checked={correctIndex === idx}
                                                        onChange={() => setCorrectIndex(idx)}
                                                        disabled={isCreatingQuestion}
                                                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2 border-2 border-slate-300 dark:border-slate-500"
                                                    />
                                                    {correctIndex === idx && (
                                                        <div
                                                            className="absolute inset-0 w-5 h-5 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOption(idx, e.target.value)}
                                                    className="w-full px-4 py-3 bg-white/80 dark:bg-slate-600/80 border border-slate-200 dark:border-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                                                    disabled={isCreatingQuestion}
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                            </div>

                                            <button
                                                onClick={() => deleteOption(idx)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isCreatingQuestion || options.length <= 2}
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addOption}
                                        className="group flex items-center justify-center w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 transform hover:scale-105 bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20"
                                        disabled={isCreatingQuestion}
                                    >
                                        <PlusCircle
                                            className="w-5 h-5 mr-3 transform transition-transform duration-300 group-hover:rotate-90"/>
                                        <span className="font-medium">Add Option</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* True/False Options */}
                        {type === "truefalse" && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                                        Correct Answer
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label
                                        className={`group flex items-center justify-center p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                            correctIndex === 0
                                                ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500 shadow-lg"
                                                : "bg-slate-50/80 dark:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-600"
                                        }`}>
                                        <input
                                            type="radio"
                                            name="tf"
                                            checked={correctIndex === 0}
                                            onChange={() => setCorrectIndex(0)}
                                            disabled={isCreatingQuestion}
                                            className="sr-only"
                                        />
                                        <CheckCircle className={`w-6 h-6 mr-3 transition-all duration-300 ${
                                            correctIndex === 0 ? "text-green-600 scale-110" : "text-green-400 group-hover:text-green-500"
                                        }`}/>
                                        <span className={`font-semibold text-lg transition-colors duration-300 ${
                                            correctIndex === 0 ? "text-green-700 dark:text-green-300" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                            True
                                        </span>
                                    </label>

                                    <label
                                        className={`group flex items-center justify-center p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                            correctIndex === 1
                                                ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-500 shadow-lg"
                                                : "bg-slate-50/80 dark:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-600"
                                        }`}>
                                        <input
                                            type="radio"
                                            name="tf"
                                            checked={correctIndex === 1}
                                            onChange={() => setCorrectIndex(1)}
                                            disabled={isCreatingQuestion}
                                            className="sr-only"
                                        />
                                        <XCircle className={`w-6 h-6 mr-3 transition-all duration-300 ${
                                            correctIndex === 1 ? "text-red-600 scale-110" : "text-red-400 group-hover:text-red-500"
                                        }`}/>
                                        <span className={`font-semibold text-lg transition-colors duration-300 ${
                                            correctIndex === 1 ? "text-red-700 dark:text-red-300" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                            False
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Short Answer Info */}
                        {type === "short" && (
                            <div
                                className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl border border-blue-200 dark:border-blue-700">
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"></div>
                                <div className="relative flex items-center">
                                    <div
                                        className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                                        <FileText className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-blue-800 dark:text-blue-200 font-semibold text-lg mb-1">
                                            Manual Review Required
                                        </h3>
                                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                                            Short answer questions will be reviewed and graded manually by instructors
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                onClick={editingQuestionId ? handleUpdateQuestion : handleSubmit}
                                className="group relative w-full py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                disabled={isCreatingQuestion}
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {isCreatingQuestion ? (
                                    <div className="relative flex items-center justify-center">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                                        <span className="text-lg">
                                            {editingQuestionId ? "Updating Question..." : "Creating Question..."}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative flex items-center justify-center">
                                        <CheckCircle
                                            className="w-6 h-6 mr-3 transform transition-transform duration-300 group-hover:scale-110"/>
                                        <span className="text-lg">
                                            {editingQuestionId ? "Update Question" : "Add Question"}
                                        </span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionForm;