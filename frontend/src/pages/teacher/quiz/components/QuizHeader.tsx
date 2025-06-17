import {useState, useEffect} from 'react';
import {ArrowLeft, RotateCcw, Undo} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {useGetAllGroupsQuery} from '../../../../services/groupApi';
import {useUpdateQuizMutation} from '../../../../services/quizApi';

interface Group {
    _id: string;
    group: string;
}

interface QuizHeaderProps {
    quizId: string;
    quizTitle: string;
    quizTime: number;
    groupName: string;
    isCreatingQuestion: boolean;
    createdQuestions: string[];
    editingQuestionId: string | null;
    handleBackToMain: () => void;
    undoLastQuestion: () => void;
    undoQuiz: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
                                                   quizId,
                                                   quizTitle,
                                                   quizTime,
                                                   groupName,
                                                   isCreatingQuestion,
                                                   createdQuestions,
                                                   editingQuestionId,
                                                   handleBackToMain,
                                                   undoLastQuestion,
                                                   undoQuiz,
                                               }) => {
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(groupName === 'No Group' ? [] : groupName.split(', ').map((name) => {
        // This is a temporary mapping; ideally, pass group IDs directly
        return name; // Placeholder, will be fixed in integration
    }));
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const {data: groups, isLoading: isGroupsLoading, error: groupsError} = useGetAllGroupsQuery({});
    const [updateQuiz, {isLoading: isUpdating}] = useUpdateQuizMutation();

    // Handle group fetch error
    useEffect(() => {
        if (groupsError) {
            setToastMessage('Failed to load groups');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    }, [groupsError]);

    // Sync selectedGroupIds with groupName prop
    useEffect(() => {
        if (groups && groupName !== 'No Group') {
            const groupIds = groups
                .filter((g: Group) => groupName.split(', ').includes(g.group))
                .map((g: Group) => g._id);
            setSelectedGroupIds(groupIds);
        } else {
            setSelectedGroupIds([]);
        }
    }, [groupName, groups]);

    // Handle group selection
    const handleGroupChange = async (groupIds: string[]) => {
        setIsDropdownOpen(false);
        try {
            const response = await updateQuiz({
                id: quizId,
                groups: groupIds,
            }).unwrap();
            const selectedGroupNames = groups
                ?.filter((g: Group) => groupIds.includes(g._id))
                .map((g: Group) => g.group);
            setSelectedGroupIds(groupIds);
            setToastMessage(`Group updated to ${selectedGroupNames?.join(', ') || 'No Group'}`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error updating quiz groups:', error);
            setToastMessage('Failed to update groups');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const toggleGroupSelection = (groupId: string) => {
        const newGroupIds = selectedGroupIds.includes(groupId)
            ? selectedGroupIds.filter((id) => id !== groupId)
            : [...selectedGroupIds, groupId];
        setSelectedGroupIds(newGroupIds);
        handleGroupChange(newGroupIds);
    };

    // Get display name for selected groups
    const getDisplayGroupName = () => {
        if (!groups) return 'Loading Groups...';
        if (selectedGroupIds.length === 0) return 'Select Groups';
        const names = groups
            .filter((g: Group) => selectedGroupIds.includes(g._id))
            .map((g: Group) => g.group);
        return names.length > 0 ? names.join(', ') : 'Select Groups';
    };

    return (
        <div className="relative">
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {editingQuestionId ? 'Edit Question' : 'Add Question'}
                        </h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                                Quiz: {quizTitle} • {quizTime} minutes
                            </p>
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 disabled:opacity-50"
                                    disabled={isCreatingQuestion || isGroupsLoading || isUpdating}
                                    aria-haspopup="listbox"
                                    aria-expanded={isDropdownOpen}
                                >
                                    {(isGroupsLoading || isUpdating) && (
                                        <svg
                                            className="animate-spin h-4 w-4 mr-2 text-blue-700 dark:text-blue-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    )}
                                    Groups: {getDisplayGroupName()}
                                    <svg
                                        className="ml-2 h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{opacity: 0, y: -10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -10}}
                                            transition={{duration: 0.2}}
                                            className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700"
                                        >
                                            <ul role="listbox" className="py-1 max-h-60 overflow-auto"
                                                aria-label="Select groups">
                                                {groups?.map((group: Group) => (
                                                    <li
                                                        key={group._id}
                                                        role="option"
                                                        aria-selected={selectedGroupIds.includes(group._id)}
                                                        onClick={() => toggleGroupSelection(group._id)}
                                                        className={`px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 cursor-pointer ${
                                                            selectedGroupIds.includes(group._id) ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''
                                                        }`}
                                                    >
                                                        {group.group}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleBackToMain}
                            className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                            disabled={isCreatingQuestion || isGroupsLoading || isUpdating}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2"/>
                            Back
                        </button>
                        <button
                            onClick={undoLastQuestion}
                            className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                            disabled={isCreatingQuestion || createdQuestions.length === 0 || isGroupsLoading || isUpdating}
                        >
                            <Undo className="w-4 h-4 mr-2"/>
                            Undo Last
                        </button>
                        <button
                            onClick={undoQuiz}
                            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                            disabled={isCreatingQuestion || isGroupsLoading || isUpdating}
                        >
                            <RotateCcw className="w-4 h-4 mr-2"/>
                            Reset Quiz
                        </button>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 20}}
                        transition={{duration: 0.3}}
                        className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
                        role="alert"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizHeader;