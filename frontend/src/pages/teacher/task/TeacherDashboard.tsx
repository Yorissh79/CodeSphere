import {useState, useEffect} from 'react';
import {useGetAllTasksQuery} from '../../../services/taskApi';
import {useCheckTeacherAuthQuery} from '../../../services/authCheck';
import Header from './components/Header';
import MainContent from './components/MainContent';
import CreateTaskModal from './components/CreateTaskModal';
import {Loader2, AlertCircle} from 'lucide-react';
import type {Task} from '../../../types/api';

const TeacherDashboard = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

    const {
        data: teacherAuthData,
        isLoading: teacherLoading,
        error: teacherError,
    } = useCheckTeacherAuthQuery();

    const currentTeacherId = teacherAuthData?.user?._id || '';

    const {
        data: tasksData,
        isLoading: tasksLoading,
        isFetching,
        error: tasksError,
        refetch: refetchTasks,
    } = useGetAllTasksQuery({
        teacherId: currentTeacherId,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        page: '1',
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    }, {skip: !currentTeacherId});

    console.log('Tasks query params:', {
        teacherId: currentTeacherId,
        status: filterStatus,
        page: '1',
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    console.log('Tasks response:', {data: tasksData, error: tasksError});

    const tasks: Task[] = tasksData?.tasks || [];

    useEffect(() => {
        if (currentTeacherId) {
            refetchTasks();
        }
    }, [filterStatus, currentTeacherId, refetchTasks]);

    if (tasksLoading || teacherLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600"/>
                    <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
            </div>
        );
    }

    if (tasksError || teacherError) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-red-500 flex items-center space-x-2">
                    <AlertCircle className="w-6 h-6"/>
                    <span>
            Error: {tasksError?.error || teacherError?.data?.message || 'Failed to load data'}
          </span>
                    <button
                        onClick={() => refetchTasks()}
                        className="ml-4 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
                    >
                        Retry
                    </button>
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
                    setSearchQuery={setSearchQuery}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    setShowCreateModal={setShowCreateModal}
                    isFetching={isFetching}
                />
                {showCreateModal && (
                    <CreateTaskModal
                        showCreateModal={showCreateModal}
                        setShowCreateModal={setShowCreateModal}
                        currentTeacherId={currentTeacherId}
                        refetchTasks={refetchTasks}
                    />
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;