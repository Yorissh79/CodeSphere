import {CheckCircle, XCircle, Send} from "lucide-react";
import type {Question, Answer} from "./types";

interface QuestionDisplayProps {
    currentQuestion: Question | undefined;
    currentQuestionIndex: number;
    questions: Question[] | undefined;
    answers: Answer[];
    isSubmittingAnswers: boolean;
    handleAnswerChange: (questionId: string, value: number | string) => void;
    handlePrevQuestion: () => void;
    handleNextQuestion: () => void;
    handleSubmitQuiz: () => void;
}

const QuestionDisplay = ({
                             currentQuestion,
                             currentQuestionIndex,
                             questions,
                             answers,
                             isSubmittingAnswers,
                             handleAnswerChange,
                             handlePrevQuestion,
                             handleNextQuestion,
                             handleSubmitQuiz,
                         }: QuestionDisplayProps) => {
    if (!currentQuestion) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                <p>No questions available for this quiz</p>
            </div>
        );
    }

    return (
        <div
            id={`question-${currentQuestionIndex}`}
            className={`rounded-2xl shadow-xl p-8 border transition-all duration-200 ${
                answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption !== undefined ||
                (answers.find((a) => a.questionId === currentQuestion._id)?.shortAnswer &&
                    answers.find((a) => a.questionId === currentQuestion._id)?.shortAnswer?.trim() !== "")
                    ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                    : "border-red-500 bg-red-50/50 dark:bg-red-900/10"
            }`}
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <span
                        className="flex items-center justify-center w-8 h-8 bg-indigo-500 text-white rounded-full text-sm font-bold">
                        {currentQuestionIndex + 1}
                    </span>
                    <span
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium uppercase">
                        {currentQuestion.type}
                    </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{currentQuestion.questionText}</h3>
                {currentQuestion.type === "mcq" && (
                    <div className="space-y-3">
                        {currentQuestion.options?.map((option, idx) => (
                            <label
                                key={idx}
                                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                                    answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption === idx
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                        : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion._id}`}
                                    checked={answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption === idx}
                                    onChange={() => handleAnswerChange(currentQuestion._id, idx)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-3"
                                    disabled={isSubmittingAnswers}
                                />
                                <span className="font-medium">{option}</span>
                            </label>
                        ))}
                    </div>
                )}
                {currentQuestion.type === "truefalse" && (
                    <div className="flex gap-4">
                        <label
                            className={`flex items-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                                answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption === 0
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                    : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                name={`question-${currentQuestion._id}`}
                                checked={answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption === 0}
                                onChange={() => handleAnswerChange(currentQuestion._id, 0)}
                                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                disabled={isSubmittingAnswers}
                            />
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2"/>
                            <span className="font-medium">True</span>
                        </label>
                        <label
                            className={`flex items-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                                answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption === 1
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                    : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                name={`question-${currentQuestion._id}`}
                                checked={answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption === 1}
                                onChange={() => handleAnswerChange(currentQuestion._id, 1)}
                                className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                                disabled={isSubmittingAnswers}
                            />
                            <XCircle className="w-5 h-5 text-red-500 mr-2"/>
                            <span className="font-medium">False</span>
                        </label>
                    </div>
                )}
                {currentQuestion.type === "short" && (
                    <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                        value={answers.find((a) => a.questionId === currentQuestion._id)?.shortAnswer || ""}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        placeholder="Enter your answer here..."
                        disabled={isSubmittingAnswers}
                    />
                )}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0 || isSubmittingAnswers}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {currentQuestionIndex < (questions?.length || 0) - 1 ? (
                        <button
                            onClick={handleNextQuestion}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                            disabled={isSubmittingAnswers}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmitQuiz}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-colors duration-200"
                            disabled={isSubmittingAnswers}
                        >
                            <Send className="w-4 h-4 mr-2"/>
                            {isSubmittingAnswers ? "Submitting..." : "Submit Quiz"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionDisplay;