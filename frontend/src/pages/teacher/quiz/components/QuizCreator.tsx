import {PlusCircle, FileText} from "lucide-react";
import {type ChangeEvent, type Dispatch, type SetStateAction, useState, useEffect} from "react";
import {useGetAllGroupsQuery} from "../../../../services/groupApi";

interface QuizCreatorProps {
    quizTitle: string;
    setQuizTitle: Dispatch<SetStateAction<string>>;
    quizTime: number;
    setQuizTime: Dispatch<SetStateAction<number>>;
    group: string;
    setGroup: Dispatch<SetStateAction<string>>;
    isCreatingQuiz: boolean;
    handleCreateQuiz: () => void;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({
                                                     quizTitle,
                                                     setQuizTitle,
                                                     quizTime,
                                                     setQuizTime,
                                                     group,
                                                     setGroup,
                                                     isCreatingQuiz,
                                                     handleCreateQuiz,
                                                 }) => {
    // Local state to manage input value during typing
    const [inputTime, setInputTime] = useState<string>(quizTime.toString());

    // Fetch groups
    const {data: groups, isLoading: isLoadingGroups, isError: isGroupsError} = useGetAllGroupsQuery({});

    // Sync local input with prop when quizTime changes
    useEffect(() => {
        setInputTime(quizTime.toString());
    }, [quizTime]);

    const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputTime(value);

        const parsed = parseInt(value);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 300) {
            setQuizTime(parsed);
        }
    };

    const handleTimeBlur = () => {
        const parsed = parseInt(inputTime);
        if (isNaN(parsed) || parsed < 1) {
            setQuizTime(1);
            setInputTime("1");
        } else if (parsed > 300) {
            setQuizTime(300);
            setInputTime("300");
        } else {
            setQuizTime(parsed);
            setInputTime(parsed.toString());
        }
    };

    // Dynamic group options
    const groupOptions = [
        {value: "", label: "Select a group"},
        ...(groups?.map((g: { _id: string; group: string }) => ({
            value: g._id,
            label: g.group,
        })) || []),
    ];

    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg mb-4">
                    <FileText className="w-8 h-8 text-white"/>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Quiz Creator
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Create engaging quizzes with multiple question types
                </p>
            </div>

            {/* Create Quiz Form */}
            <div
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="quizTitle"
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
                        >
                            Quiz Title
                        </label>
                        <input
                            id="quizTitle"
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                            value={quizTitle}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuizTitle(e.target.value)}
                            disabled={isCreatingQuiz}
                            placeholder="Enter your quiz title..."
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="quizTime"
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
                        >
                            Quiz Time (minutes)
                        </label>
                        <input
                            id="quizTime"
                            type="number"
                            min="1"
                            max="300"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                            value={inputTime}
                            onChange={handleTimeChange}
                            onBlur={handleTimeBlur}
                            disabled={isCreatingQuiz}
                            placeholder="Enter quiz duration..."
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="group"
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
                        >
                            Group
                        </label>
                        {isLoadingGroups ? (
                            <div className="flex items-center justify-center py-2">
                                <div
                                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-2"></div>
                                <span className="text-gray-600 dark:text-gray-400">Loading groups...</span>
                            </div>
                        ) : isGroupsError ? (
                            <p className="text-red-600 dark:text-red-400 text-sm">Failed to load groups</p>
                        ) : (
                            <select
                                id="group"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                                value={group}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setGroup(e.target.value)}
                                disabled={isCreatingQuiz}
                            >
                                {groupOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <button
                        onClick={handleCreateQuiz}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={isCreatingQuiz || isLoadingGroups || isGroupsError}
                    >
                        {isCreatingQuiz ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Creating...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <PlusCircle className="w-5 h-5 mr-2"/>
                                Create Quiz
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCreator;