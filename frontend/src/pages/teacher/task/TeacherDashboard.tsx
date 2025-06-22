import {useState} from 'react';
import {
    useGetTasksForTeacherQuery,
} from '../../../services/taskApi';
import Header from './components/Header';
// import SearchFilterBar from './SearchFilterBar';
import MainContent from './components/MainContent';
import CreateTaskModal from './components/CreateTaskModal';
import {Loader2} from "lucide-react";

const TeacherDashboard = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const {
        data: tasks = [],
        isLoading: tasksLoading,
        error: tasksError,
        refetch: refetchTasks
    } = useGetTasksForTeacherQuery();

    if (tasksLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600"/>
                    <span className="text-gray-600 dark:text-gray-400">Loading tasks...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Header/>
                <MainContent
                    tasks={tasks}
                    searchQuery={searchQuery}
                    filterStatus={filterStatus}
                    setShowCreateModal={setShowCreateModal}
                />
                {showCreateModal && (
                    <CreateTaskModal
                        showCreateModal={showCreateModal}
                        setShowCreateModal={setShowCreateModal}
                    />
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;