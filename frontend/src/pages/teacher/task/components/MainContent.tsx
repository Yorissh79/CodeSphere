import {Plus, FileText, Loader2} from 'lucide-react';
import TaskCard from './TaskCard';
import SearchFilterBar from './SearchFilterBar';
// Corrected import path for Task type
import type {Task} from '../../../../types/api';

interface MainContentProps {
    tasks: Task[],
    searchQuery: string,
    setSearchQuery: (query: string) => void,
    filterStatus: 'all' | 'active' | 'expired',
    setFilterStatus: (status: 'all' | 'active' | 'expired') => void,
    setShowCreateModal: (show: boolean) => void,
    isFetching: boolean,
    onEditTask: (task: Task) => void;
}

const MainContent = ({
                         tasks,
                         searchQuery,
                         setSearchQuery,
                         filterStatus,
                         setFilterStatus,
                         setShowCreateModal,
                         isFetching,
                         onEditTask,
                     }: MainContentProps) => {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Task Management</h2>
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
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
            />

            {isFetching && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600"/>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} onEdit={onEditTask}/>
                ))}
            </div>

            {tasks.length === 0 && !isFetching && (
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
