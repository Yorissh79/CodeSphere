import {useRef} from "react";
import {ArrowLeft, RotateCcw, Undo, Upload} from "lucide-react";

interface QuizActionButtonsProps {
    isCreatingQuestion: boolean;
    createdQuestions: string[];
    handleBackToMain: () => void;
    undoLastQuestion: () => Promise<void>;
    undoQuiz: () => Promise<void>;
    handleCsvImport: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const QuizActionButtons = ({
                               isCreatingQuestion,
                               createdQuestions,
                               handleBackToMain,
                               undoLastQuestion,
                               undoQuiz,
                               handleCsvImport,
                               onFileChange,
                           }: QuizActionButtonsProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Actions
                    </h2>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Manage your quiz
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleBackToMain}
                        className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                        disabled={isCreatingQuestion}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Back
                    </button>
                    <button
                        onClick={undoLastQuestion}
                        className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                        disabled={isCreatingQuestion || createdQuestions.length === 0}
                    >
                        <Undo className="w-4 h-4 mr-2"/>
                        Undo Last
                    </button>
                    <button
                        onClick={undoQuiz}
                        className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                        disabled={isCreatingQuestion}
                    >
                        <RotateCcw className="w-4 h-4 mr-2"/>
                        Reset Quiz
                    </button>
                    <button
                        onClick={handleCsvImport}
                        className="flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                        disabled={isCreatingQuestion}
                    >
                        <Upload className="w-4 h-4 mr-2"/>
                        Import CSV
                    </button>
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={onFileChange}
                        disabled={isCreatingQuestion}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuizActionButtons;