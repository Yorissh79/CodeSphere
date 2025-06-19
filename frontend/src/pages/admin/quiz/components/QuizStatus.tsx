import React from 'react';

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
            className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            {/* Ambient background gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>

            {/* Decorative elements */}
            <div
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-200/20 to-transparent dark:from-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div
                className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-transparent dark:from-purple-400/10 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Header Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                                Quiz Status
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                            Control student access to this quiz
                        </p>
                    </div>

                    {/* Controls Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Status Indicator */}
                        <div className={`
                            relative px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105
                            ${quizOpened
                            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25"
                        }
                        `}>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-3 h-3 rounded-full animate-pulse ${quizOpened ? 'bg-white' : 'bg-white'}`}></div>
                                <span className="tracking-wide w-30">
                                    {quizOpened ? "Live & Open" : "Closed"}
                                </span>
                            </div>
                            {/* Glow effect */}
                            <div
                                className={`absolute inset-0 rounded-2xl blur-xl opacity-30 ${quizOpened ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                {quizOpened ? 'Close' : 'Open'}
                            </span>
                            <button
                                onClick={() => setQuizOpened(!quizOpened)}
                                className={`
                                    relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                    ${quizOpened
                                    ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/25"
                                    : "bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"
                                }
                                `}
                                disabled={isCreatingQuestion}
                            >
                                <span className={`
                                    inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-lg
                                    ${quizOpened ? "translate-x-9" : "translate-x-1"}
                                `}>
                                    <div
                                        className={`w-full h-full rounded-full ${quizOpened ? 'bg-gradient-to-br from-emerald-100 to-green-100' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}></div>
                                </span>
                            </button>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleStatusUpdate}
                            className={`
                                group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                                ${isCreatingQuestion ? 'animate-pulse' : ''}
                            `}
                            disabled={isCreatingQuestion}
                        >
                            <div className="flex items-center gap-3">
                                {isCreatingQuestion ? (
                                    <>
                                        <div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="tracking-wide">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                        <span className="tracking-wide">Save Status</span>
                                    </>
                                )}
                            </div>

                            {/* Button glow effect */}
                            <div
                                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* Bottom accent line */}
                <div
                    className="mt-6 h-1 w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent rounded-full"></div>
            </div>
        </div>
    );
};

export default QuizStatus;