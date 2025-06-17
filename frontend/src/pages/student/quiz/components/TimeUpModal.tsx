import {Clock} from "lucide-react";

interface TimeUpModalProps {
    isTimeUpModalOpen: boolean;
    setIsTimeUpModalOpen: (open: boolean) => void;
    isSubmittingAnswers: boolean;
}

const TimeUpModal = ({isTimeUpModalOpen, setIsTimeUpModalOpen, isSubmittingAnswers}: TimeUpModalProps) => {
    if (!isTimeUpModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center mb-4">
                    <Clock className="w-12 h-12 text-red-500"/>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">Time's Up!</h2>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                    The quiz has ended. Your answers have been submitted.
                </p>
                <button
                    onClick={() => setIsTimeUpModalOpen(false)}
                    className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                    disabled={isSubmittingAnswers}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default TimeUpModal;