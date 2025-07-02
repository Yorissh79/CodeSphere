import {useState, useMemo, useCallback} from 'react';
import {Loader2, AlertCircle} from 'lucide-react';
import {Toaster} from 'react-hot-toast';
import {useGetAllStudentTasksQuery} from '../../../services/taskApi';
import {useCheckAuthQuery} from "../../../services/authCheck.ts";
import StudentMainContent from './components/StudentMainContent';
import SubmitTaskModal from './components/SubmitTaskModal';
import ViewSubmissionModal from './components/ViewSubmissionModal';
import ViewTaskDetailsModal from './components/ViewTaskDetailsModal';
import {useGetAllGroupsQuery} from "../../../services/groupApi.ts";
import type {StudentTask} from "./components/StudentMainContent";

const StudentDashboard = () => {
    // Modal states - keep these stable
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showViewSubmissionModal, setShowViewSubmissionModal] = useState(false);
    const [showViewTaskDetailsModal, setShowViewTaskDetailsModal] = useState(false);
    const [taskToSubmit, setTaskToSubmit] = useState<StudentTask | null>(null);
    const [submissionToViewId, setSubmissionToViewId] = useState<string | null>(null);
    const [taskIdToViewDetails, setTaskIdToViewDetails] = useState<string | null>(null); // Changed to store taskId

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

    const {
        data: studentAuthData,
        isLoading: studentAuthLoading,
        error: studentAuthError,
    } = useCheckAuthQuery();

    const {
        data: groupData,
        isLoading: groupLoading,
        error: groupError,
    } = useGetAllGroupsQuery({});

    const studentGroupName = studentAuthData?.user?.group || '';
    const studentId = studentAuthData?.user?._id || '';

    const studentGroupId = useMemo(() => {
        if (groupData && studentGroupName) {
            const foundGroup = groupData.find((group: any) => group.group === studentGroupName);
            return foundGroup?._id || '';
        }
        return '';
    }, [groupData, studentGroupName]);

    const {
        data: tasksData,
        isLoading: tasksLoading,
        isFetching,
        error: tasksError,
        refetch: refetchTasks,
    } = useGetAllStudentTasksQuery(
        {
            studentId: studentId,
            groupIds: studentGroupId ? [studentGroupId] : [],
            status: filterStatus,
            sortBy: 'deadline',
            sortOrder: 'asc',
        },
        {skip: !studentGroupId || !studentId}
    );

    const tasks: StudentTask[] = tasksData?.tasks || [];

    // Memoize filtered tasks to prevent unnecessary re-renders
    const filteredAndSearchedTasks = useMemo(() =>
        tasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        ), [tasks, searchQuery, filterStatus]
    );

    // Use useCallback to prevent function recreation on every render
    const handleOpenSubmitModal = useCallback((task: StudentTask) => {
        setTaskToSubmit(task);
        setShowSubmitModal(true);
    }, []);

    const handleOpenViewSubmissionModal = useCallback((submissionId: string) => {
        setSubmissionToViewId(submissionId);
        setShowViewSubmissionModal(true);
    }, []);

    // Updated callback to store taskId instead of task object
    const handleOpenViewTaskDetailsModal = useCallback((task: StudentTask) => {
        setTaskIdToViewDetails(task._id); // Store only the taskId
        setShowViewTaskDetailsModal(true);
    }, []);

    // Stable refetch function that doesn't cause modal to close
    const handleRefetchTasks = useCallback(() => {
        refetchTasks();
    }, [refetchTasks]);

    if (studentAuthLoading || tasksLoading || groupLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500"/>
            </div>
        );
    }

    if (studentAuthError || tasksError || groupError) {
        const getErrorMessage = (error: any) => {
            if ('message' in error) return error.message;
            if ('data' in error && typeof error.data === 'string') return error.data;
            if ('data' in error && error.data?.message) return error.data.message;
            if ('status' in error) return `Error ${error.status}`;
            return 'Unknown error occurred';
        };

        const errorMessage =
            (tasksError && getErrorMessage(tasksError)) ||
            (studentAuthError && getErrorMessage(studentAuthError)) ||
            (groupError && getErrorMessage(groupError)) ||
            'Failed to load data';

        return (
            <div className="flex justify-center items-center min-h-screen bg-red-50 dark:bg-red-900">
                <div
                    className="flex flex-col items-center p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-12 h-12 mb-4"/>
                    <span className="text-lg font-semibold mb-4 text-center">{`Error: ${errorMessage}`}</span>
                    <button
                        onClick={handleRefetchTasks}
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
            <StudentMainContent
                tasks={filteredAndSearchedTasks}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onOpenSubmitModal={handleOpenSubmitModal}
                onOpenViewSubmissionModal={handleOpenViewSubmissionModal}
                onOpenViewTaskDetailsModal={handleOpenViewTaskDetailsModal}
                isFetching={isFetching}
            />

            {/* Conditionally render SubmitTaskModal only when taskToSubmit is not null */}
            {showSubmitModal && taskToSubmit && (
                <SubmitTaskModal
                    showSubmitModal={showSubmitModal}
                    setShowSubmitModal={setShowSubmitModal}
                    task={taskToSubmit}
                    refetchTasks={handleRefetchTasks}
                />
            )}


            {/* Keep modals mounted but conditionally visible */}
            <ViewSubmissionModal
                showViewSubmissionModal={showViewSubmissionModal}
                setShowViewSubmissionModal={setShowViewSubmissionModal}
                submissionId={submissionToViewId || ''}
            />

            {/* Updated Task Details Modal to pass taskId */}
            <ViewTaskDetailsModal
                showModal={showViewTaskDetailsModal}
                setShowModal={setShowViewTaskDetailsModal}
                taskId={taskIdToViewDetails} // Pass taskId instead of task object
            />
        </div>
    );
};

export default StudentDashboard;