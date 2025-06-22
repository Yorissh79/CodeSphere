import {Calendar, Eye, Edit, Trash2} from 'lucide-react';
import type {Task} from '../../../../types/api';
import type {ReactElement, JSXElementConstructor, ReactNode, ReactPortal} from 'react';

interface TaskCardProps {
    task: Task;
}

const TaskCard = ({task}: TaskCardProps) => {
    const formatDate = (dateString: string | number | Date) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
            case 'expired':
                return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
        }
    };

    const getTaskStatus = (dueDate: string) => {
        const now = new Date();
        const deadline = new Date(dueDate);
        return deadline > now ? 'active' : 'expired';
    };

    const taskStatus = getTaskStatus(task.dueDate);
    const submissionPercentage = task.totalStudents > 0
        ? (task.submissionCount / task.totalStudents) * 100
        : 0;

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{task.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {task.description}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(taskStatus)}`}
                    >
            {taskStatus}
          </span>
                </div>

                {task.assignedGroups && task.assignedGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {task.assignedGroups?.map((group: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined) => (
                            <span
                                key={Math.random() * 20}
                                className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs rounded-md"
                            >
                {group}
              </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 mr-2"/>
                    <span>Due: {formatDate(task.dueDate)}</span>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Submissions</span>
                        <span className="font-medium">
              {task.submissionCount || 0}/{task.totalStudents || 0}
            </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{width: `${submissionPercentage}%`}}
                        ></div>
                    </div>
                </div>
            </div>

            <div
                className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{task.maxPoints || 0} pts</span>
                        {task.allowLateSubmission && (
                            <span
                                className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded"
                            >
                Late OK
              </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="View submissions"
                        >
                            <Eye className="w-4 h-4"/>
                        </button>
                        <button
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Edit task"
                        >
                            <Edit className="w-4 h-4"/>
                        </button>
                        <button
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete task"
                        >
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;