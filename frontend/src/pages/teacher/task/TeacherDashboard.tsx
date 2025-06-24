import {useState, useEffect} from 'react';
import {useGetAllTasksQuery} from '../../../services/taskApi'; // Corrected path
import {useCheckTeacherAuthQuery} from '../../../services/authCheck'; // Corrected path
import Header from './components/Header';
import MainContent from './components/MainContent';
import CreateTaskModal from './components/CreateTaskModal';
import EditTaskModal from './components/EditTaskModal';
import {Loader2, AlertCircle} from 'lucide-react';
import type {Task} from '../../../types/api'; // Corrected path
import {Toaster} from 'react-hot-toast';

const TeacherDashboard = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

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

    const tasks: Task[] = tasksData?.tasks || [];

    useEffect(() => {
        if (currentTeacherId) {
            refetchTasks();
        }
    }, [filterStatus, currentTeacherId, refetchTasks]);

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setShowEditModal(true);
    };


    if (teacherLoading || tasksLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500"/>
            </div>
        );
    }

    if (teacherError || tasksError) {
        const errorMessage = tasksError?.error || (teacherError as any)?.data?.message || 'Failed to load data';
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-50 dark:bg-red-900">
                <div
                    className="flex flex-col items-center p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-12 h-12 mb-4"/>
                    <span className="text-lg font-semibold mb-4 text-center">{`Error: ${errorMessage}`}</span>
                    <button
                        onClick={() => refetchTasks()}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-300 bg-gray-100 dark:bg-gray-950">
            <Toaster position="top-right" reverseOrder={false}/>
            <Header/>
            <MainContent
                tasks={tasks}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                setShowCreateModal={setShowCreateModal}
                isFetching={isFetching}
                onEditTask={handleEditTask}
            />
            {showCreateModal && (
                <CreateTaskModal
                    showCreateModal={showCreateModal}
                    setShowCreateModal={setShowCreateModal}
                    currentTeacherId={currentTeacherId}
                    refetchTasks={refetchTasks}
                />
            )}
            {showEditModal && taskToEdit && (
                <EditTaskModal
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    taskToEdit={taskToEdit}
                    refetchTasks={refetchTasks}
                />
            )}
        </div>
    );
};

export default TeacherDashboard;
