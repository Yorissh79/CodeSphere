interface QuizStatusProps {
    quizOpened: boolean;
    setQuizOpened: (value: boolean) => void;
    isCreatingQuestion: boolean;
    handleStatusUpdate: () => void;
}

const QuizStatus: React.FC<QuizStatusProps> = ({
                                                   quizOpened,
                                                   setQuizOpened,
                                                   isCreatingQuestion,
                                                   handleStatusUpdate,
                                               }) => {
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Quiz Status
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Control whether students can access this quiz
                    </p>
                </div>
                <div className="flex items-center space-x-4">
          <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  quizOpened
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }`}
          >
            {quizOpened ? "Open" : "Closed"}
          </span>
                    <button
                        onClick={() => setQuizOpened(!quizOpened)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            quizOpened ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        disabled={isCreatingQuestion}
                    >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    quizOpened ? "translate-x-6" : "translate-x-1"
                }`}
            />
                    </button>
                    <button
                        onClick={handleStatusUpdate}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                        disabled={isCreatingQuestion}
                    >
                        Save Status
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizStatus;