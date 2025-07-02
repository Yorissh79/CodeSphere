import {
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    BarChart3,
    Activity,
    Menu, // Keep Menu for the burger icon
    X,
    RefreshCw,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
// Corrected import paths for API services
import {useGetAllUsersQuery} from '../../../services/userApi';
import {useGetAllTeachersQuery} from '../../../services/teacherApi';
import {useGetAllGroupsQuery} from '../../../services/groupApi';
import {useGetAllTasksQuery} from '../../../services/taskApi';
import {useGetAllQuizzesQuery} from '../../../services/quizApi';
import {useGetSubmissionsQuery} from '../../../services/submissionsApi'; // Import the new hook

import type {User as Student} from '../../../services/userApi';
import type {Teacher} from '../../../services/teacherApi';
import type {Group} from '../../../services/groupApi';
import type {Task} from '../../../services/taskApi'; // Corrected path
import type {Quiz} from '../../../services/quizApi';
import type {Submissions} from '../../../services/submissionsApi'; // Import Submission type
import React, {useMemo, useCallback} from "react";

// --- PROPS INTERFACES ---
interface StatCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    isLoading?: boolean;
}

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    isLoading?: boolean;
}

interface SidebarProps {
    sidebarOpen: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setSidebarOpen: (open: boolean) => void;
}

// HeaderProps is removed as the Header component will be deleted.

interface OverviewContentProps {
    error: any;
    fetchAllData: () => void;
    isLoading: boolean;
    teachers: Teacher[];
    students: Student[];
    tasks: Task[];
    quizzes: Quiz[];
    groupDistribution: any[];
    taskStatusData: any[];
    quizStatusData: any[];
}

interface StatisticsContentProps {
    data: any[];
    isLoading: boolean;
    title: string;
}

interface TaskStatisticsProps {
    tasks: Task[];
    isLoading: boolean;
    selectedTaskId: string | null;
    setSelectedTaskId: (id: string | null) => void;
    submissionsData?: Submissions[];
    submissionsLoading: boolean;
    submissionsError: any;
}

// --- STATIC & HELPER COMPONENTS ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const LoadingSkeleton: React.FC<{ className?: string }> = ({className = ''}) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}/>
);

const StatCard: React.FC<StatCardProps> = React.memo(({
                                                          title,
                                                          value,
                                                          icon: Icon,
                                                          color = 'blue',
                                                          isLoading = false
                                                      }) => (
    <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-400 mb-1">{title}</p>
                {isLoading ? <LoadingSkeleton className="h-8 w-16 mb-2"/> :
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>}
            </div>
            <div
                className={`p-3 rounded-full bg-gradient-to-br from-${color}-100 to-${color}-200 dark:from-${color}-900/20 dark:to-${color}-800/20`}>
                <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`}/>
            </div>
        </div>
    </div>
));

const ChartCard: React.FC<ChartCardProps> = React.memo(({title, children, isLoading = false}) => (
    <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {isLoading ? <LoadingSkeleton className="h-64 w-full"/> : children}
    </div>
));

// --- CHILD COMPONENTS (MOVED OUTSIDE) ---

const Sidebar: React.FC<SidebarProps> = React.memo(({
                                                        sidebarOpen,
                                                        activeTab,
                                                        setActiveTab,
                                                        setSidebarOpen,
                                                    }) => {
    const navItems = useMemo(() => [
        {id: 'overview', label: 'Overview', icon: BarChart3},
        {id: 'teacherStats', label: 'Teacher Statistics', icon: GraduationCap},
        {id: 'studentStats', label: 'Student Statistics', icon: Users},
        {id: 'groupStats', label: 'Group Statistics', icon: BookOpen},
        {id: 'taskStats', label: 'Task Statistics', icon: ClipboardList},
        {id: 'quizStats', label: 'Quiz Statistics', icon: Activity},
    ], []);

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 border-r border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learning
                    Center</h1>
                <button onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close sidebar"><X className="w-5 h-5"/></button>
            </div>
            <nav className="mt-6 px-3" role="navigation" aria-label="Main navigation">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                    }}
                            className={`w-full flex items-center px-3 py-2 mb-1 rounded-lg text-left transition-all duration-200 hover:scale-105 ${activeTab === item.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            aria-current={activeTab === item.id ? 'page' : undefined}>
                        <item.icon className="w-5 h-5 mr-3"/>
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
});

// Header component is removed as requested.

const OverviewContent: React.FC<OverviewContentProps> = React.memo(({
                                                                        error,
                                                                        fetchAllData,
                                                                        isLoading,
                                                                        teachers,
                                                                        students,
                                                                        tasks,
                                                                        quizzes,
                                                                        groupDistribution,
                                                                        taskStatusData,
                                                                        quizStatusData
                                                                    }) => (
    <div className="space-y-6">
        {error && (
            <div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3"/>
                <span className="text-red-700 dark:text-red-300">Failed to load dashboard data. Please try again.</span>
                <button onClick={fetchAllData}
                        className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                    <RefreshCw className="w-4 h-4"/></button>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Teachers" value={teachers.length} icon={GraduationCap} color="blue"
                      isLoading={isLoading}/>
            <StatCard title="Total Students" value={students.length} icon={Users} color="green" isLoading={isLoading}/>
            <StatCard title="Active Tasks" value={tasks.length} icon={ClipboardList} color="orange"
                      isLoading={isLoading}/>
            <StatCard title="Total Quizzes" value={quizzes.length} icon={Activity} color="purple"
                      isLoading={isLoading}/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Student Distribution by Groups" isLoading={isLoading}>
                <ResponsiveContainer width="100%" height={300}><BarChart data={groupDistribution}><CartesianGrid
                    strokeDasharray="3 3" className="opacity-30"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar
                    dataKey="students" fill="#3b82f6" name="Students"/><Bar dataKey="teachers" fill="#10b981"
                                                                            name="Teachers"/></BarChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Task Status Distribution" isLoading={isLoading}>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {taskStatusData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                        </Pie>
                        <Tooltip/>
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Quiz Status" isLoading={isLoading}>
                <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={quizStatusData} cx="50%" cy="50%"
                                                                              innerRadius={60} outerRadius={80}
                                                                              paddingAngle={5}
                                                                              dataKey="value">{quizStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}/>))}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer>
            </ChartCard>
        </div>
    </div>
));

const TeacherStatistics: React.FC<StatisticsContentProps> = React.memo(({data: teachers, isLoading, title}) => (
    <ChartCard title={title} isLoading={isLoading}>
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                </tr>
                </thead>
                <tbody>{teachers.map((teacher: Teacher) => (<tr key={teacher._id}
                                                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{teacher.name} {teacher.surname}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{teacher.email}</td>
                    <td className="py-3 px-4"><span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{teacher.role}</span>
                    </td>
                </tr>))}</tbody>
            </table>
        </div>
    </ChartCard>
));

const StudentStatistics: React.FC<StatisticsContentProps> = React.memo(({data: students, isLoading, title}) => (
    <ChartCard title={title} isLoading={isLoading}>
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Group</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                </tr>
                </thead>
                <tbody>{students.map((student: Student) => (<tr key={student._id}
                                                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{student.name} {student.surname}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{student.email}</td>
                    <td className="py-3 px-4"><span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">{student.group}</span>
                    </td>
                    <td className="py-3 px-4"><span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">{student.role}</span>
                    </td>
                </tr>))}</tbody>
            </table>
        </div>
    </ChartCard>
));

const TaskStatistics: React.FC<TaskStatisticsProps> = React.memo(({
                                                                      tasks,
                                                                      isLoading,
                                                                      selectedTaskId,
                                                                      setSelectedTaskId,
                                                                      submissionsData,
                                                                      submissionsLoading,
                                                                      submissionsError
                                                                  }) => {
    return (
        <ChartCard title="Task Statistics" isLoading={isLoading}>
            {selectedTaskId ? (
                // Display Submissions for a selected task
                <div className="space-y-4">
                    <button
                        onClick={() => setSelectedTaskId(null)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Tasks
                    </button>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submissions for
                        Task: {tasks.find(t => t._id === selectedTaskId)?.title}</h4>
                    {submissionsLoading && <LoadingSkeleton className="h-40 w-full"/>}
                    {submissionsError && (
                        <div
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3"/>
                            <span className="text-red-700 dark:text-red-300">Failed to load submissions.</span>
                        </div>
                    )}
                    {submissionsData && submissionsData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Student
                                        ID
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Comments</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Submitted
                                        At
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Points</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Late</th>
                                </tr>
                                </thead>
                                <tbody>
                                {submissionsData.map((submission: Submissions) => (
                                    <tr key={submission._id}
                                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                                            {typeof submission.studentId === 'object' && submission.studentId !== null && 'name' in submission.studentId
                                                ? `${submission.studentId.name} ${submission.studentId.email || ''}`
                                                : typeof submission.studentId === 'string'
                                                    ? submission.studentId
                                                    : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{submission.comments || 'N/A'}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{new Date(submission.submittedAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4"><span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                submission.status === 'graded' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                                    submission.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                            }`}>
                                            {submission.status}
                                        </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">{submission.points !== undefined ? submission.points : 'N/A'}</td>
                                        <td className="py-3 px-4">{submission.isLate ?
                                            <span className="text-red-500 dark:text-red-400">Yes</span> :
                                            <span className="text-green-500 dark:text-green-400">No</span>}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        !submissionsLoading && !submissionsError && (
                            <p className="text-gray-600 dark:text-gray-400">No submissions found for this task.</p>
                        )
                    )}
                </div>
            ) : (
                // Display Tasks list
                <div className="space-y-4">
                    {tasks.map((task: Task) => (
                        <div key={task._id}
                             className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                             onClick={() => setSelectedTaskId(task._id)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{task.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                                    <div
                                        className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                                        <span>Max Points: {task.maxPoints}</span>
                                        <span>
                                            Teacher: {
                                            typeof task.teacherId === 'object' && task.teacherId !== null && 'name' in task.teacherId
                                                ? `${task.teacherId.name} ${task.teacherId.surname || ''}`
                                                : typeof task.teacherId === 'string'
                                                    ? task.teacherId
                                                    : 'N/A'
                                        }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ChartCard>
    );
});


// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
    const [activeTab, setActiveTab] = React.useState<string>('overview');
    const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null); // New state for selected task

    // --- RTK Query Hooks ---
    const {
        data: teachersData,
        error: teachersError,
        isLoading: teachersLoading,
        refetch: refetchTeachers
    } = useGetAllTeachersQuery({});
    const {
        data: studentsData,
        error: studentsError,
        isLoading: studentsLoading,
        refetch: refetchStudents
    } = useGetAllUsersQuery({});
    const {
        data: groupsData,
        error: groupsError,
        isLoading: groupsLoading,
        refetch: refetchGroups
    } = useGetAllGroupsQuery({});
    const {
        data: tasksData,
        error: tasksError,
        isLoading: tasksLoading,
        refetch: refetchTasks
    } = useGetAllTasksQuery({});
    const {
        data: quizzesData,
        error: quizzesError,
        isLoading: quizzesLoading,
        refetch: refetchQuizzes
    } = useGetAllQuizzesQuery();

    // Fetch submissions based on selectedTaskId
    const {
        data: submissionsResponse,
        error: submissionsError,
        isLoading: submissionsLoading,
    } = useGetSubmissionsQuery({taskId: selectedTaskId || ''}, {
        skip: !selectedTaskId, // Skip fetching if no task is selected
    });

    const submissions = useMemo(() => submissionsResponse?.submissions || [], [submissionsResponse]);

    const isLoading = teachersLoading || studentsLoading || groupsLoading || tasksLoading || quizzesLoading;
    const error = teachersError || studentsError || groupsError || tasksError || quizzesError;

    // --- Memoized Callbacks ---
    const fetchAllData = useCallback(() => {
        refetchTeachers();
        refetchStudents();
        refetchGroups();
        refetchTasks();
        refetchQuizzes();
    }, [refetchTeachers, refetchStudents, refetchGroups, refetchTasks, refetchQuizzes]);

    // --- Memoized Data for Charts ---
    const students = useMemo(() => studentsData || [], [studentsData]);
    const groups = useMemo(() => groupsData || [], [groupsData]);
    const tasks = useMemo(() => tasksData?.tasks || [], [tasksData]);
    const quizzes = useMemo(() => quizzesData || [], [quizzesData]);
    const teachers = useMemo(() => teachersData || [], [teachersData]);

    const groupDistribution = useMemo(() =>
        groups.map((group: Group) => ({
            name: group.group,
            students: students.filter((student: Student) => student.group === group.group).length,
            teachers: group.teachers.length
        })), [groups, students]);

    const taskStatusData = useMemo(() => [
        {name: 'Active', value: tasks.filter((task: Task) => new Date(task.deadline) > new Date()).length},
        {name: 'Overdue', value: tasks.filter((task: Task) => new Date(task.deadline) < new Date()).length}
    ], [tasks]);

    const quizStatusData = useMemo(() => [
        {name: 'Open', value: quizzes.filter((quiz: Quiz) => quiz.opened).length},
        {name: 'Closed', value: quizzes.filter((quiz: Quiz) => !quiz.opened).length}
    ], [quizzes]);

    // --- Render Logic ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewContent error={error} fetchAllData={fetchAllData} isLoading={isLoading}
                                        teachers={teachers} students={students} tasks={tasks} quizzes={quizzes}
                                        groupDistribution={groupDistribution} taskStatusData={taskStatusData}
                                        quizStatusData={quizStatusData}/>;
            case 'teacherStats':
                return <TeacherStatistics data={teachers} isLoading={isLoading} title="Teacher Statistics"/>;
            case 'studentStats':
                return <StudentStatistics data={students} isLoading={isLoading} title="Student Statistics"/>;
            case 'groupStats':
                return <ChartCard title="Group Statistics" isLoading={isLoading}>
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{groups.map((group: Group) => (
                        <div key={group._id}
                             className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3"><h4
                                className="text-lg font-semibold text-gray-900 dark:text-white">{group.group}</h4></div>
                            <div className="space-y-2"><p
                                className="text-sm text-gray-600 dark:text-gray-400">Created: {new Date(group.date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Students: {students.filter((s: Student) => s.group === group.group).length}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Teachers: {group.teachers.length}</p>
                            </div>
                        </div>))}</div>
                </ChartCard>;
            case 'taskStats':
                return <TaskStatistics
                    tasks={tasks}
                    isLoading={isLoading}
                    selectedTaskId={selectedTaskId}
                    setSelectedTaskId={setSelectedTaskId}
                    submissionsData={submissions}
                    submissionsLoading={submissionsLoading}
                    submissionsError={submissionsError}
                />;
            case 'quizStats':
                return <ChartCard title="Quiz Statistics" isLoading={isLoading}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{quizzes.map((quiz: Quiz) => (
                        <div key={quiz._id}
                             className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1"><h4
                                    className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{quiz.title}</h4>{quiz.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{quiz.description}</p>)}
                                    <div
                                        className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>Time Limit: {quiz.timeLimit} min</span><span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${quiz.opened ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>{quiz.opened ? 'Open' : 'Closed'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2">{quiz.groups && quiz.groups.map((groupId) => {
                                const group = groups.find((g: Group) => g._id === groupId);
                                return group ? (<span key={groupId}
                                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">{group.group}</span>) : null;
                            })}</div>
                        </div>))}</div>
                </ChartCard>;
            default:
                return <OverviewContent error={error} fetchAllData={fetchAllData} isLoading={isLoading}
                                        teachers={teachers} students={students} tasks={tasks} quizzes={quizzes}
                                        groupDistribution={groupDistribution} taskStatusData={taskStatusData}
                                        quizStatusData={quizStatusData}/>;
        }
    };

    return (
        <div
            className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
            <div className="flex">
                <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab}
                         setSidebarOpen={setSidebarOpen}/>
                <div className="flex-1 md:ml-0">
                    {/* New Header/Top Bar for mobile responsiveness and burger icon */}
                    <div
                        className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 md:hidden">
                        <div className="flex items-center justify-between h-16 px-6">
                            <button onClick={() => setSidebarOpen(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Open sidebar">
                                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
                            </button>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                                {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('Stats', ' Statistics')}
                            </h2>
                            <div
                                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">A</span>
                            </div>
                        </div>
                    </div>
                    <main className="p-6">{renderContent()}</main>
                </div>
            </div>
            {sidebarOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                                  onClick={() => setSidebarOpen(false)} aria-hidden="true"/>)}
        </div>
    );
};

export default AdminDashboard;