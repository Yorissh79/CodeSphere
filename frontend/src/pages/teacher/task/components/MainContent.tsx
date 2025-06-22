import {Plus, FileText} from 'lucide-react';
import TaskCard from './TaskCard';
import SearchFilterBar from './SearchFilterBar';
import type {Task} from '../../../../types/api';

interface MainContentProps {
    tasks: Task[] | undefined; // Allow undefined to reflect potential initial state
    searchQuery: string;
    filterStatus: string;
    setShowCreateModal: (show: boolean) => void;
}

const MainContent = ({tasks, searchQuery, filterStatus, setShowCreateModal}: MainContentProps) => {
    const getTaskStatus = (dueDate: string) => {
        const now = new Date();
        const deadline = new Date(dueDate);
        return deadline > now ? 'active' : 'expired';
    };

    // Ensure tasks is an array, default to empty array if undefined or null
    const filteredTasks = (Array.isArray(tasks) ? tasks : []).filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const taskStatus = getTaskStatus(task.dueDate);
        const matchesFilter = filterStatus === 'all' || taskStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Task Management</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage assignments and track student progress</p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5 mr-2"/>
                    Create Task
                </button>
            </div>

            <SearchFilterBar
                searchQuery={searchQuery}
                setSearchQuery={() => {
                }} // Placeholder, handled in parent
                filterStatus={filterStatus}
                setFilterStatus={() => {
                }} // Placeholder, handled in parent
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task}/>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </main>
    );
};

export default MainContent;