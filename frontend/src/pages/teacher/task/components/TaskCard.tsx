import {Calendar, Eye, Edit, Trash2} from 'lucide-react';
import type {Task} from '../../../../types/api';
import {motion} from 'framer-motion';

interface TaskCardProps {
    task: Task;
}

const TaskCard = ({task}: TaskCardProps) => {
    const formatDate = (dateString: string) => {
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
                return 'text-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/30';
            case 'expired':
                return 'text-rose-500 bg-rose-100/50 dark:bg-rose-900/30';
            default:
                return 'text-gray-500 bg-gray-100/50 dark:bg-gray-800/30';
        }
    };

    const getTaskStatus = (dueDate: string) => {
        const now = new Date();
        const deadline = new Date(dueDate);
        return deadline > now ? 'active' : 'expired';
    };

    const taskStatus = getTaskStatus(task.dueDate || task.deadline);
    const submissionPercentage = task.totalStudents && task.totalStudents > 0
        ? (task.submissionCount || 0) / task.totalStudents * 100
        : 0;

    return (
        <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            whileHover={{scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}
            transition={{duration: 0.3}}
            className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{task.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mt-1">{task.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(taskStatus)}`}>
            {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
          </span>
                </div>

                {task.assignedGroups?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {task.assignedGroups.map((group, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full"
                            >
                {group}
              </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 mr-2"/>
                    <span>Due: {formatDate(task.dueDate || task.deadline)}</span>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Submissions</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
              {task.submissionCount || 0}/{task.totalStudents || 0}
            </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                            initial={{width: 0}}
                            animate={{width: `${submissionPercentage}%`}}
                            transition={{duration: 0.5, ease: 'easeOut'}}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
                        />
                    </div>
                </div>
            </div>

            <div
                className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{task.maxPoints || 0} pts</span>
                        {task.allowLateSubmission && (
                            <span
                                className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                Late OK
              </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {[
                            {icon: Eye, title: 'View submissions', hoverColor: 'hover:text-indigo-500'},
                            {icon: Edit, title: 'Edit task', hoverColor: 'hover:text-indigo-500'},
                            {icon: Trash2, title: 'Delete task', hoverColor: 'hover:text-rose-500'},
                        ].map(({icon: Icon, title, hoverColor}, index) => (
                            <motion.button
                                key={index}
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.9}}
                                className={`p-2 text-gray-500 dark:text-gray-400 ${hoverColor} transition-colors duration-200`}
                                title={title}
                            >
                                <Icon className="w-5 h-5"/>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;