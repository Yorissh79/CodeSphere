import {Calendar, FileText, CheckCircle, Clock, ExternalLink} from 'lucide-react';
import {motion} from 'framer-motion';

// This interface should match the structure of a task object relevant to the student
interface StudentTask {
    _id: string;
    title: string;
    description: string;
    deadline: string; // ISO date string
    maxPoints: string;
    assignedGroups: string[];
    submissionStatus?: 'submitted' | 'not_submitted' | 'late_submitted'; // Derived or fetched
    submissionId?: string; // ID of the submission if it exists
}

interface StudentTaskCardProps {
    task: StudentTask;
    onOpenSubmitModal: (task: StudentTask) => void;
    onOpenViewSubmissionModal: (submissionId: string) => void;
}

const StudentTaskCard = ({task, onOpenSubmitModal, onOpenViewSubmissionModal}: StudentTaskCardProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isTaskExpired = new Date(task.deadline) < new Date();
    const isSubmitted = task.submissionStatus === 'submitted' || task.submissionStatus === 'late_submitted';
    const isLateSubmission = task.submissionStatus === 'late_submitted';

    const getStatusText = () => {
        if (isSubmitted && isLateSubmission) return 'Late Submitted';
        if (isSubmitted) return 'Submitted';
        if (isTaskExpired) return 'Expired';
        return 'Not Submitted';
    };

    const getStatusColorClass = () => {
        if (isSubmitted && isLateSubmission) return 'bg-orange-100/50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300';
        if (isSubmitted) return 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300';
        if (isTaskExpired) return 'bg-rose-100/50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300';
        return 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300';
    };

    const getStatusIcon = () => {
        if (isSubmitted) return <CheckCircle className="w-4 h-4 mr-1"/>;
        if (isTaskExpired) return <Clock className="w-4 h-4 mr-1"/>;
        return <FileText className="w-4 h-4 mr-1"/>;
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
            whileHover={{y: -5}}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
        >
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight pr-8">
                        {task.title}
                    </h3>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColorClass()}`}
                    >
                        {getStatusIcon()}
                        {getStatusText()}
                    </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {task.description}
                </p>
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2"/>
                    Deadline: {formatDate(task.deadline)}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    <strong>Max Points:</strong> {task.maxPoints}
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-2">
                {isSubmitted ? (
                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={() => task.submissionId && onOpenViewSubmissionModal(task.submissionId)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
                    >
                        <ExternalLink className="w-4 h-4 mr-2"/>
                        View Submission
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={() => onOpenSubmitModal(task)}
                        disabled={isTaskExpired} // Disable if task is expired
                        className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium ${isTaskExpired ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-600 hover:to-purple-700'} transition-all duration-200 shadow-md`}
                    >
                        <FileText className="w-4 h-4 mr-2"/>
                        Submit Task
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default StudentTaskCard;
