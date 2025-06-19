import {useState, useEffect, useRef} from 'react';
import {ArrowLeft, RotateCcw, Undo, Edit3, Check, X, ChevronDown, Users, Clock, BookOpen} from 'lucide-react';
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
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(quizTitle);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(groupName === 'No Group' ? [] : groupName.split(', '));
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const {data: groups, isLoading: isGroupsLoading, error: groupsError} = useGetAllGroupsQuery({});
    const [updateQuiz, {isLoading: isUpdating}] = useUpdateQuizMutation();

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    // Handle group fetch error
    useEffect(() => {
        if (groupsError) {
            setToastMessage('Failed to load groups');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    }, [groupsError]);

    // Sync tempTitle with quizTitle prop changes
    useEffect(() => {
        setTempTitle(quizTitle);
    }, [quizTitle]);

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

    // Handle title update
    const handleTitleUpdate = async () => {
        if (!tempTitle.trim()) {
            setToastMessage('Quiz title cannot be empty');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        try {
            await updateQuiz({
                id: quizId,
                title: tempTitle,
                timeLimit: quizTime,
                opened: false,
                groups: selectedGroupIds,
            }).unwrap();
            setToastMessage('Quiz title updated successfully');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setIsEditingTitle(false);
        } catch (error) {
            setToastMessage('Failed to update quiz title');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    // Handle group selection
    const handleGroupChange = async (groupIds: string[]) => {
        setIsDropdownOpen(false);
        try {
            await updateQuiz({
                id: quizId,
                title: quizTitle,
                timeLimit: quizTime,
                opened: false,
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
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Main Header Card */}
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94]}}
                className="relative"
            >
                {/* Gradient Background */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 dark:from-violet-500/20 dark:via-purple-500/10 dark:to-fuchsia-500/20"/>
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"/>

                {/* Decorative Elements */}
                <div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-400/20 to-transparent rounded-full blur-2xl"/>
                <div
                    className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl"/>

                {/* Content */}
                <div
                    className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/20 p-8">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                        {/* Left Section - Title and Info */}
                        <div className="flex-1 space-y-6">
                            {/* Page Title Section */}
                            <div className="flex items-center gap-4">
                                {isEditingTitle ? (
                                    <motion.div
                                        initial={{opacity: 0, scale: 0.95}}
                                        animate={{opacity: 1, scale: 1}}
                                        className="flex items-center w-full max-w-2xl gap-3"
                                    >
                                        <div className="relative flex-1">
                                            <input
                                                ref={titleInputRef}
                                                type="text"
                                                value={tempTitle}
                                                onChange={(e) => setTempTitle(e.target.value)}
                                                className="w-full px-6 py-4 text-xl font-semibold bg-white/80 dark:bg-gray-800/80 border-2 border-violet-200 dark:border-violet-700/50 rounded-2xl focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/20 dark:focus:ring-violet-400/20 text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-300 backdrop-blur-sm"
                                                placeholder="Enter quiz title..."
                                                aria-label="Quiz title"
                                                disabled={isCreatingQuestion}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleTitleUpdate();
                                                    if (e.key === 'Escape') setIsEditingTitle(false);
                                                }}
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{scale: 1.05}}
                                            whileTap={{scale: 0.95}}
                                            onClick={handleTitleUpdate}
                                            className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isCreatingQuestion}
                                            aria-label="Save quiz title"
                                        >
                                            <Check className="w-5 h-5"/>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{scale: 1.05}}
                                            whileTap={{scale: 0.95}}
                                            onClick={() => {
                                                setIsEditingTitle(false);
                                                setTempTitle(quizTitle);
                                            }}
                                            className="p-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl shadow-lg shadow-red-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isCreatingQuestion}
                                            aria-label="Cancel title edit"
                                        >
                                            <X className="w-5 h-5"/>
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <div className="flex items-center gap-4 group">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/25">
                                                <BookOpen className="w-6 h-6 text-white"/>
                                            </div>
                                            <div>
                                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                                                    {editingQuestionId ? 'Edit Question' : 'Create Question'}
                                                </h1>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Design engaging quiz content
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{scale: 1.1, rotate: 5}}
                                            whileTap={{scale: 0.9}}
                                            onClick={() => setIsEditingTitle(true)}
                                            className="p-2.5 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                                            aria-label="Edit quiz title"
                                            disabled={isCreatingQuestion}
                                        >
                                            <Edit3 className="w-5 h-5"/>
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {/* Quiz Info Cards */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Quiz Details Card */}
                                <motion.div
                                    whileHover={{scale: 1.02, y: -2}}
                                    className="flex-1 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-700/30 rounded-2xl backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                            <BookOpen className="w-4 h-4 text-white"/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz
                                                Title</p>
                                            <p className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">{tempTitle}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Time Card */}
                                <motion.div
                                    whileHover={{scale: 1.02, y: -2}}
                                    className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                                            <Clock className="w-4 h-4 text-white"/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{quizTime} minutes</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Groups Selector */}
                                <div className="relative z-50">
                                    <motion.button
                                        whileHover={{scale: 1.02, y: -2}}
                                        whileTap={{scale: 0.98}}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full sm:w-auto min-w-48 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 rounded-2xl backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isCreatingQuestion || isGroupsLoading || isUpdating}
                                        aria-haspopup="listbox"
                                        aria-expanded={isDropdownOpen}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                                                {(isGroupsLoading || isUpdating) ? (
                                                    <div
                                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                                ) : (
                                                    <Users className="w-4 h-4 text-white"/>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Target
                                                    Groups</p>
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {getDisplayGroupName()}
                                                </p>
                                            </div>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                                        </div>
                                    </motion.button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <>
                                                {/* Backdrop to close dropdown */}
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                />
                                                <motion.div
                                                    initial={{opacity: 0, y: -10, scale: 0.95}}
                                                    animate={{opacity: 1, y: 0, scale: 1}}
                                                    exit={{opacity: 0, y: -10, scale: 0.95}}
                                                    transition={{duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94]}}
                                                    className="absolute z-50 mt-3 w-full min-w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                                                >
                                                    <div className="p-2">
                                                        <div
                                                            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
                                                            Available Groups
                                                        </div>
                                                        <ul role="listbox" className="max-h-60 overflow-auto space-y-1"
                                                            aria-label="Select groups">
                                                            {groups?.map((group: Group) => (
                                                                <motion.li
                                                                    key={group._id}
                                                                    whileHover={{scale: 1.02}}
                                                                    whileTap={{scale: 0.98}}
                                                                    role="option"
                                                                    aria-selected={selectedGroupIds.includes(group._id)}
                                                                    onClick={() => toggleGroupSelection(group._id)}
                                                                    className={`px-4 py-3 text-sm rounded-xl cursor-pointer transition-all duration-200 ${
                                                                        selectedGroupIds.includes(group._id)
                                                                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                                                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span
                                                                            className="font-medium">{group.group}</span>
                                                                        {selectedGroupIds.includes(group._id) && (
                                                                            <Check className="w-4 h-4"/>
                                                                        )}
                                                                    </div>
                                                                </motion.li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Action Buttons */}
                        <div className="flex flex-wrap lg:flex-col gap-3">
                            <motion.button
                                whileHover={{scale: 1.05, x: -3}}
                                whileTap={{scale: 0.95}}
                                onClick={handleBackToMain}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-lg shadow-gray-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                disabled={isCreatingQuestion || isGroupsLoading || isUpdating}
                                aria-label="Back to main"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Main
                            </motion.button>

                            <motion.button
                                whileHover={{scale: 1.05, rotate: -5}}
                                whileTap={{scale: 0.95}}
                                onClick={undoLastQuestion}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                disabled={isCreatingQuestion || createdQuestions.length === 0 || isGroupsLoading || isUpdating}
                                aria-label="Undo last question"
                            >
                                <Undo className="w-4 h-4 mr-2"/>
                                Undo Last
                            </motion.button>

                            <motion.button
                                whileHover={{scale: 1.05, rotate: 5}}
                                whileTap={{scale: 0.95}}
                                onClick={undoQuiz}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl shadow-lg shadow-red-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                disabled={isCreatingQuestion || isGroupsLoading || isUpdating}
                                aria-label="Reset quiz"
                            >
                                <RotateCcw className="w-4 h-4 mr-2"/>
                                Reset Quiz
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{opacity: 0, x: 100, scale: 0.8}}
                        animate={{opacity: 1, x: 0, scale: 1}}
                        exit={{opacity: 0, x: 100, scale: 0.8}}
                        transition={{duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94]}}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <div
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/20 flex items-center max-w-sm"
                            role="alert">
                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl mr-3">
                                <Check className="w-5 h-5 text-white"/>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">Success!</p>
                                <p className="text-gray-600 dark:text-gray-300 text-xs">{toastMessage}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizHeader;