import {ArrowLeft, Clock} from "lucide-react";
import type {Quiz} from "./types";

interface QuizHeaderProps {
    selectedQuiz: Quiz | undefined;
    timeRemaining: number;
    currentQuestionIndex: number;
    questions: any[] | undefined;
    answeredCount: number;
    isSubmittingAnswers: boolean;
    handleBackToList: () => void;
}

const QuizHeader = ({
                        selectedQuiz,
                        timeRemaining,
                        currentQuestionIndex,
                        questions,
                        answeredCount,
                        isSubmittingAnswers,
                        handleBackToList,
                    }: QuizHeaderProps) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedQuiz?.title}</h2>
                <p
                    className={`font-medium flex items-center gap-2 ${
                        timeRemaining <= 600 ? "text-red-600 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400"
                    }`}
                >
                    <Clock className="w-4 h-4"/> Time Remaining: {formatTime(timeRemaining)} •
                    Question {currentQuestionIndex + 1} of {questions?.length || 0} •
                    {answeredCount} of {questions?.length || 0} answered
                </p>
            </div>
            <button
                onClick={handleBackToList}
                className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                disabled={isSubmittingAnswers}
            >
                <ArrowLeft className="w-4 h-4 mr-2"/>
                Back to Quizzes
            </button>
        </div>
    );
};

export default QuizHeader;