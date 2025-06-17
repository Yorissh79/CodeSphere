import {CheckCircle, Circle} from "lucide-react";
import type {Question, Answer} from "./types";

interface QuestionNavigatorProps {
    questions: Question[] | undefined;
    currentQuestionIndex: number;
    answers: Answer[];
    handleJumpToQuestion: (index: number) => void;
}

const QuestionNavigator = ({
                               questions,
                               currentQuestionIndex,
                               answers,
                               handleJumpToQuestion
                           }: QuestionNavigatorProps) => {
    const answeredCount = answers.filter(
        (a) => a.selectedOption !== undefined || (a.shortAnswer && a.shortAnswer.trim() !== "")
    ).length;

    return (
        <div
            className="w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 sticky top-8 h-fit max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Questions</h3>
            <div className="space-y-2">
                {questions?.map((q, idx) => {
                    const isAnswered =
                        answers.find((a) => a.questionId === q._id)?.selectedOption !== undefined ||
                        (answers.find((a) => a.questionId === q._id)?.shortAnswer &&
                            answers.find((a) => a.questionId === q._id)?.shortAnswer?.trim() !== "");
                    return (
                        <button
                            key={q._id}
                            onClick={() => handleJumpToQuestion(idx)}
                            className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                                idx === currentQuestionIndex
                                    ? "bg-indigo-500 text-white"
                                    : isAnswered
                                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <span
                                className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                    isAnswered ? "bg-green-500 text-white" : "bg-gray-300 dark:bg-gray-600"
                                }`}
                            >
                                {isAnswered ? <CheckCircle className="w-4 h-4"/> : <Circle className="w-4 h-4"/>}
                            </span>
                            <span>Question {idx + 1}</span>
                        </button>
                    );
                })}
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {answeredCount} of {questions?.length || 0} answered
            </p>
        </div>
    );
};

export default QuestionNavigator;