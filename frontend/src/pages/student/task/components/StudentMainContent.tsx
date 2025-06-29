import {FileText, Loader2} from 'lucide-react';
import StudentTaskCard from './StudentTaskCard';
import SearchFilterBar from '../../../teacher/task/components/SearchFilterBar';
import type {Teacher} from "../../../../services/taskApi.ts";

export interface StudentTask {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    maxPoints: string;
    assignedGroups: string[];
    submissionStatus?: 'submitted' | 'not_submitted' | 'late_submitted';
    submissionId?: string;
    teacherId?: Teacher | null | undefined;
    allowLateSubmission?: boolean;
}

interface StudentMainContentProps {
    tasks: StudentTask[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: 'all' | 'active' | 'expired';
    setFilterStatus: (status: 'all' | 'active' | 'expired') => void;
    onOpenSubmitModal: (task: StudentTask) => void;
    onOpenViewSubmissionModal: (submissionId: string) => void;
    onOpenViewTaskDetailsModal: (task: StudentTask) => void;
    isFetching: boolean;
}

const StudentMainContent = ({
                                tasks,
                                searchQuery,
                                setSearchQuery,
                                filterStatus,
                                setFilterStatus,
                                onOpenSubmitModal,
                                onOpenViewSubmissionModal,
                                onOpenViewTaskDetailsModal,
                                isFetching,
                            }: StudentMainContentProps) => {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">My Tasks</h2>
                    <p className="text-gray-600 dark:text-gray-400">View and manage your assigned tasks</p>
                </div>
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
                    <StudentTaskCard
                        key={task._id}
                        task={task}
                        onOpenSubmitModal={onOpenSubmitModal}
                        onOpenViewSubmissionModal={onOpenViewSubmissionModal}
                        onOpenViewTaskDetailsModal={onOpenViewTaskDetailsModal}
                    />
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

export default StudentMainContent;