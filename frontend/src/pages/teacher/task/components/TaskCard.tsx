import {Calendar, Eye, Edit, Trash2, X, AlertTriangle, Users} from 'lucide-react';
// Corrected import path
import type {Task} from '../../../../types/api';
// Corrected import path
import {motion, AnimatePresence} from 'framer-motion';
// Corrected import path
import {useGetAllGroupsQuery} from '../../../../services/groupApi';
import {useState} from 'react';
// Corrected import path
import {useDeleteTaskByIdMutation} from '../../../../services/taskApi';
// Add import for submissions query - adjust path as needed
import {useGetSubmissionsQuery} from '../../../../services/submissionsApi';
import {toast} from 'react-hot-toast'; // Assuming you use react-hot-toast or similar for notifications
import ViewSubmissionsModal from './ViewSubmissionsModal'; // Import the new modal component

interface TaskCardProps {
    task: Task;
    onDelete?: (taskId: string) => void; // Keep this prop for consistency or remove if handled internally
    onEdit?: (task: Task) => void;
    onView?: (task: Task) => void; // Added onView prop
    // refetchTasks: () => void; // Removed as RTK Query's invalidation usually handles this
}

const TaskCard = ({task, onEdit}: TaskCardProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false); // State for submissions modal
    const [deleteTaskById] = useDeleteTaskByIdMutation(); // Get the mutation trigger

    // Fetch all groups to map IDs to names
    const {data: groupsData} = useGetAllGroupsQuery({});

    // Fetch all submissions and filter by task ID
    const {data: submissionsData} = useGetSubmissionsQuery({});

    // Filter submissions for this specific task
    // taskId is an object with _id property in your API response
    const taskSubmissions = submissionsData?.submissions?.filter(
        (submission: any) => submission.taskId?._id === task._id
    ) || [];

    const submissionCount = taskSubmissions.length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (deadline: string) => {
        const now = new Date();
        const taskDeadline = new Date(deadline);
        if (taskDeadline < now) {
            return 'text-rose-500 bg-rose-100/50 dark:bg-rose-900/30'; // Expired
        }
        return 'text-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/30'; // Active
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteTaskById(task._id).unwrap();
            toast.success('Task deleted successfully!');
            setShowDeleteConfirm(false);
        } catch (error: any) {
            toast.error(`Failed to delete task: ${error?.data?.error || error?.message || 'Unknown error'}`);
            console.error('Delete task error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleViewSubmissions = () => {
        setShowSubmissionsModal(true);
    };

    return (
        <>
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
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.deadline)}`}
                        >
                            {new Date(task.deadline) < new Date() ? 'Expired' : 'Active'}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {task.description}
                    </p>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2"/>
                        Deadline: {formatDate(task.deadline)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        <strong>Assigned to:</strong>{' '}
                        {task.assignedGroups.map(groupId => {
                            // Assuming group object has a 'group' property for its name
                            const group = groupsData?.find((g: { _id: string; group: string }) => g._id === groupId);
                            return group ? group.group : groupId;
                        }).join(', ')}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        <strong>Max Points:</strong> {task.maxPoints}
                    </div>
                    {/* Add submission counter */}
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex items-center">
                        <Users className="w-4 h-4 mr-2"/>
                        <strong>Submissions:</strong>
                        <span
                            className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                            {submissionCount}
                        </span>
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium mr-1">Created:</span> {formatDate(task.createdAt)}
                    </div>
                    <div className="flex space-x-2">
                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            onClick={handleViewSubmissions} // Call the new handler
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-200"
                            title="View submissions"
                        >
                            <Eye className="w-5 h-5"/>
                        </motion.button>

                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            onClick={() => onEdit?.(task)} // Trigger the edit modal/form
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-200"
                            title="Edit task"
                        >
                            <Edit className="w-5 h-5"/>
                        </motion.button>

                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            onClick={handleDelete} // Call the confirmation handler
                            disabled={isDeleting}
                            className={`p-2 text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors duration-200 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Delete task"
                        >
                            <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`}/>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={handleDeleteCancel}
                    >
                        <motion.div
                            initial={{scale: 0.9, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.9, opacity: 0}}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-amber-500"/>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Delete Task
                                    </h3>
                                </div>
                                <button
                                    onClick={handleDeleteCancel}
                                    className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete the task <span
                                    className="font-semibold text-gray-900 dark:text-gray-100">"{task.title}"</span>?
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Submissions Modal */}
            <ViewSubmissionsModal
                task={task}
                showModal={showSubmissionsModal}
                setShowModal={setShowSubmissionsModal}
            />
        </>
    );
};

export default TaskCard;