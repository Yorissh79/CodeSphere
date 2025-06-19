import {PlusCircle, FileText, Clock, Users, Sparkles, RotateCcw} from "lucide-react";
import {type ChangeEvent, type Dispatch, type SetStateAction, useState, useEffect} from "react";
import {useGetAllGroupsQuery} from "../../../../services/groupApi";

interface QuizCreatorProps {
    quizTitle: string;
    setQuizTitle: Dispatch<SetStateAction<string>>;
    quizTime: number;
    setQuizTime: Dispatch<SetStateAction<number>>;
    groups: string[];
    setGroups: Dispatch<SetStateAction<string[]>>;
    isCreatingQuiz: boolean;
    handleCreateQuiz: () => void;
    handleResetForm: () => void;  // Add this line
}

const QuizCreator: React.FC<QuizCreatorProps> = ({
                                                     quizTitle,
                                                     setQuizTitle,
                                                     quizTime,
                                                     setQuizTime,
                                                     groups,
                                                     setGroups,
                                                     isCreatingQuiz,
                                                     handleCreateQuiz,
                                                     handleResetForm,  // Add this line
                                                 }) => {

    const [inputTime, setInputTime] = useState<string>(quizTime.toString());

    const {data: groupData, isLoading: isLoadingGroups, isError: isGroupsError} = useGetAllGroupsQuery({});

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

    const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
        setGroups(selectedOptions.filter((value) => value !== ""));
    };

    const groupOptions = [
        {value: "", label: "Select groups"},
        ...(groupData?.map((g: { _id: string; group: string }) => ({
            value: g._id,
            label: g.group,
        })) || []),
    ];

    return (
        <div
            className="w-full max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
                {/* Header Section */}
                <div className="text-center space-y-6 mb-12">
                    <div className="relative">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl shadow-indigo-500/25 mb-6 transform hover:scale-105 transition-all duration-300">
                            <FileText className="w-10 h-10 text-white drop-shadow-lg"/>
                        </div>
                        <div
                            className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                            <Sparkles className="w-3 h-3 text-white"/>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                            Quiz Creator
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-xl max-w-md mx-auto leading-relaxed">
                            Craft engaging quizzes that captivate and educate your audience
                        </p>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="w-full max-w-2xl">
                    <div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 dark:shadow-purple-500/10 border border-white/20 dark:border-gray-700/50 p-8 space-y-8 transform hover:scale-[1.01] transition-all duration-300">

                        {/* Quiz Title Input */}
                        <div className="space-y-3">
                            <label
                                htmlFor="quizTitle"
                                className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-200 tracking-wide"
                            >
                                <FileText className="w-4 h-4 mr-2 text-indigo-500"/>
                                Quiz Title
                            </label>
                            <div className="relative group">
                                <input
                                    id="quizTitle"
                                    type="text"
                                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg group-hover:border-indigo-300 dark:group-hover:border-indigo-500"
                                    value={quizTitle}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuizTitle(e.target.value)}
                                    disabled={isCreatingQuiz}
                                    placeholder="Enter your amazing quiz title..."
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Quiz Time Input */}
                        <div className="space-y-3">
                            <label
                                htmlFor="quizTime"
                                className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-200 tracking-wide"
                            >
                                <Clock className="w-4 h-4 mr-2 text-purple-500"/>
                                Quiz Duration
                            </label>
                            <div className="relative group">
                                <input
                                    id="quizTime"
                                    type="number"
                                    min="1"
                                    max="300"
                                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg group-hover:border-purple-300 dark:group-hover:border-purple-500"
                                    value={inputTime}
                                    onChange={handleTimeChange}
                                    onBlur={handleTimeBlur}
                                    disabled={isCreatingQuiz}
                                    placeholder="Duration in minutes..."
                                />
                                <div
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    minutes
                                </div>
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-red-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-pink-500/5 group-focus-within:to-red-500/5 transition-all duration-300 pointer-events-none"></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                Choose between 1-300 minutes for your quiz
                            </p>
                        </div>

                        {/* Groups Selection */}
                        <div className="space-y-3">
                            <label
                                htmlFor="groups"
                                className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-200 tracking-wide"
                            >
                                <Users className="w-4 h-4 mr-2 text-pink-500"/>
                                Target Groups
                                {groups.length > 0 && (
                                    <span
                                        className="ml-2 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs rounded-full font-semibold">
                                        {groups.length} selected
                                    </span>
                                )}
                            </label>
                            <div className="relative group">
                                {isLoadingGroups ? (
                                    <div
                                        className="flex items-center justify-center py-6 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl border-2 border-gray-200/50 dark:border-gray-600/50">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mr-3"></div>
                                        <span
                                            className="text-gray-600 dark:text-gray-400 font-medium">Loading groups...</span>
                                    </div>
                                ) : isGroupsError ? (
                                    <div
                                        className="flex items-center justify-center py-6 bg-red-50/50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200/50 dark:border-red-600/50">
                                        <p className="text-red-600 dark:text-red-400 font-medium">Failed to load
                                            groups</p>
                                    </div>
                                ) : (
                                    <select
                                        id="groups"
                                        multiple
                                        className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-400 dark:focus:border-pink-400 transition-all duration-300 text-gray-900 dark:text-white min-h-[120px] group-hover:border-pink-300 dark:group-hover:border-pink-500"
                                        value={groups}
                                        onChange={handleGroupChange}
                                        disabled={isCreatingQuiz}
                                    >
                                        {groupOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                                className="py-2 px-1 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                                            >
                                                {option.value === "" ? "Select groups" : option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 via-red-500/0 to-orange-500/0 group-focus-within:from-pink-500/5 group-focus-within:via-red-500/5 group-focus-within:to-orange-500/5 transition-all duration-300 pointer-events-none"></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                Hold Ctrl/Cmd to select multiple groups
                            </p>
                        </div>

                        {/* Create Button */}
                        <div className="pt-4 flex flex-col items-center justify-center space-y-3">
                            <button
                                onClick={handleCreateQuiz}
                                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg tracking-wide relative overflow-hidden group"
                                disabled={isCreatingQuiz || isLoadingGroups || isGroupsError}
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <div className="relative flex items-center justify-center">
                                    {isCreatingQuiz ? (
                                        <>
                                            <div
                                                className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                            <span>Creating Magic...</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="w-6 h-6 mr-3"/>
                                            <span>Create Amazing Quiz</span>
                                        </>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={handleResetForm}  // This will now use the prop instead of local function
                                className="inline-flex w-full justify-center items-center font-bold rounded-2xl shadow-xl px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={isCreatingQuiz}
                            >
                                <RotateCcw className="w-4 h-4 mr-2"/>
                                Reset Form
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ready to engage your audience with interactive quizzes? ✨
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizCreator;