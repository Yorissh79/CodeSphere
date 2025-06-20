import {FileText, PlayCircle} from "lucide-react";
import type {Quiz} from "./types";
import {useGetQuizAnswersQuery} from "../../../../services/answerApi";

interface QuizListProps {
    quizzes: Quiz[] | any[] | undefined;
    isLoadingQuizzes: boolean;
    quizzesError: any;
    handleStartQuiz: (quizId: string) => void;
    group: string | undefined;
    allGroups: string[] | any[] | undefined;
    studentId: string | undefined; // Add studentId to props
}

const QuizList = ({
                      quizzes,
                      isLoadingQuizzes,
                      quizzesError,
                      handleStartQuiz,
                      group,
                      allGroups,
                      studentId
                  }: QuizListProps) => {
    allGroups = allGroups || [];
    const groupID = allGroups.find(g => g.group === group)?._id;

    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg mb-4">
                    <FileText className="w-8 h-8 text-white"/>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Student Quiz Portal
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Select an open quiz to start answering questions
                </p>
            </div>
            <div
                className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Available Quizzes</h3>
                </div>
                {isLoadingQuizzes && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading quizzes...</span>
                    </div>
                )}
                {quizzesError && (
                    <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
                        <FileText className="w-5 h-5 mr-2"/>
                        Error loading quizzes
                    </div>
                )}
                {quizzes?.filter((q) => q.opened).length === 0 && !isLoadingQuizzes && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No open quizzes available</p>
                        <p className="text-sm">Check back later for new quizzes!</p>
                    </div>
                )}
                <div className="space-y-4 max-h-64 overflow-y-auto">
                    {quizzes?.filter((q) =>
                        q.opened &&
                        (q.groups?.some((groupId: string) => groupId === groupID) || q.groups === undefined)
                    ).map((quiz) => {
                        const {
                            data: quizAnswers,
                            isLoading: isLoadingAnswers
                        } = useGetQuizAnswersQuery(quiz._id, {skip: !studentId});
                        const hasAnswered = studentId && quizAnswers?.some((answer: {
                            studentId: string;
                        }) => answer.studentId === studentId);

                        return (
                            <div
                                key={quiz._id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">{quiz.title}</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Time Limit: {quiz.timeLimit} minutes
                                        </p>
                                    </div>
                                </div>
                                {isLoadingAnswers ? (
                                    <span className="text-gray-500 dark:text-gray-400">Checking answers...</span>
                                ) : hasAnswered ? (
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                                        You already answered
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleStartQuiz(quiz._id)}
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors duration-200"
                                    >
                                        <PlayCircle className="w-4 h-4 mr-2"/>
                                        Start Quiz
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuizList;