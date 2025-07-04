import React, {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {
    Menu,
    X,
    Users,
    FileText,
    Upload,
    Download,
    Calendar,
    Activity,
    BarChart3,
    Plus,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Clock,
    User,
    BookOpen,
    ClipboardList,
    GraduationCap
} from "lucide-react";

import {useGetAllUsersQuery} from '../../../services/userApi';
import {useGetAllTeachersQuery} from '../../../services/teacherApi';
import {useGetAllGroupsQuery} from '../../../services/groupApi';
import {useGetAllTasksQuery} from '../../../services/taskApi';
import {useGetAllQuizzesQuery} from '../../../services/quizApi';
import {useGetAllMissesQuery} from '../../../services/missesApi';
import {useGetSubmissionsQuery} from '../../../services/submissionsApi';

// Types
interface AdminStats {
    label: string;
    value: string;
    change: string;
    icon: any;
    trend: 'up' | 'down';
    color: string;
}

interface RecentActivity {
    id: string;
    user: string;
    action: string;
    time: string;
    type: 'submission' | 'task' | 'quiz' | 'user' | 'miss';
}

interface AdminTask {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
    count?: number;
}

// Define specific types for API data to help TypeScript
// Adjusted QuizData to match potential undefined properties from API
interface UserData {
    _id: string;
    name: string;
    surname: string;
    email: string;
}

interface TeacherData {
    _id: string;
    name: string;
    surname: string;
}

interface SubmissionData {
    _id: string;
    // Keep this as UserData | string as per API response
    studentId: UserData | string;
    submittedAt: string;
    status: string;
}

interface TaskData {
    _id: string;
    title: string;
    deadline: string;
    createdAt: string;
    teacherId: TeacherData;
}

interface QuizData {
    _id: string;
    // Changed to optional boolean based on error
    opened?: boolean;
    // Changed to optional string based on error
    createdAt?: string;
}

interface MissData {
    _id: string;
    date: string;
}

// Spinner Component
const Spinner = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
        <motion.div
            animate={{rotate: 360}}
            transition={{duration: 1, repeat: Infinity, ease: "linear"}}
            className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
        />
    </div>
);

// Welcome Popup
const WelcomePopup = ({name}: { name: string }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{opacity: 0, y: -50, scale: 0.95}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, y: -20, scale: 0.95}}
                    className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 backdrop-blur-sm border border-white/20"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👋</span>
                        <span className="font-medium">Welcome back, {name}!</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Stat Card Component
const StatCard = ({stat, index}: { stat: AdminStats; index: number }) => (
    <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: index * 0.1}}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                </p>
                <div className="flex items-center mt-2">
                    <span
                        className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {stat.change}
                    </span>
                </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white"/>
            </div>
        </div>
    </motion.div>
);

// Task Card Component
const TaskCard = ({task}: { task: AdminTask }) => {
    const priorityColors = {
        high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };

    const statusColors = {
        pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };

    return (
        <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 group"
        >
            <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                </h4>
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                    <MoreVertical className="w-4 h-4 text-gray-500"/>
                </button>
            </div>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status}
                </span>
                {task.count && (
                    <span
                        className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {task.count} items
                    </span>
                )}
            </div>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-1"/>
                {task.dueDate}
            </div>
        </motion.div>
    );
};

// Activity Item Component
const ActivityItem = ({activity, index}: { activity: RecentActivity; index: number }) => {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'submission':
                return <Upload className="w-3 h-3 text-blue-600"/>;
            case 'task':
                return <FileText className="w-3 h-3 text-green-600"/>;
            case 'quiz':
                return <BookOpen className="w-3 h-3 text-purple-600"/>;
            case 'user':
                return <User className="w-3 h-3 text-orange-600"/>;
            case 'miss':
                return <AlertCircle className="w-3 h-3 text-red-600"/>;
            default:
                return <Activity className="w-3 h-3 text-gray-600"/>;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'submission':
                return 'bg-blue-100 dark:bg-blue-900/30';
            case 'task':
                return 'bg-green-100 dark:bg-green-900/30';
            case 'quiz':
                return 'bg-purple-100 dark:bg-purple-900/30';
            case 'user':
                return 'bg-orange-100 dark:bg-orange-900/30';
            case 'miss':
                return 'bg-red-100 dark:bg-red-900/30';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30';
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: index * 0.1}}
            className="flex items-start gap-3"
        >
            <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white truncate">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                </p>
            </div>
        </motion.div>
    );
};

// File Upload Zone Component
const FileUploadZone = () => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Upload</h3>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    isDragOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
            >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop files here, or{' '}
                    <label className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        browse
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Support for PDF, JPG, PNG files up to 10MB
                </p>
            </div>
            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex items-center min-w-0">
                                <FileText className="w-4 h-4 text-blue-500 mr-2"/>
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                            >
                                <X className="w-4 h-4"/>
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main Admin Component
const Admin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser] = useState({
        name: "Admin",
        surname: "User",
        email: "admin@system.com",
        role: "Super Admin"
    });

    // API Queries
    const {data: users, isLoading: usersLoading, error: usersError} = useGetAllUsersQuery({});
    const {data: teachers, isLoading: teachersLoading, error: teachersError} = useGetAllTeachersQuery({});
    const {data: groups, isLoading: groupsLoading, error: groupsError} = useGetAllGroupsQuery({});
    const {data: tasks, isLoading: tasksLoading, error: tasksError} = useGetAllTasksQuery({});
    // Use an empty object as a parameter for quizzes query if it expects one
    const {data: quizzes, isLoading: quizzesLoading, error: quizzesError} = useGetAllQuizzesQuery();
    const {data: misses, isLoading: missesLoading, error: missesError} = useGetAllMissesQuery({});
    const {data: submissions, isLoading: submissionsLoading, error: submissionsError} = useGetSubmissionsQuery({});

    // Loading state
    const isLoading = usersLoading || teachersLoading || groupsLoading || tasksLoading || quizzesLoading || missesLoading || submissionsLoading;

    // Generate stats from API data
    const generateStats = (): AdminStats[] => {
        const stats: AdminStats[] = [];

        if (users && Array.isArray(users)) {
            stats.push({
                label: "Total Students",
                value: users.length.toString(),
                change: "+12%",
                icon: Users,
                trend: "up",
                color: "bg-blue-500"
            });
        }

        if (teachers && Array.isArray(teachers)) {
            stats.push({
                label: "Total Teachers",
                value: teachers.length.toString(),
                change: "+5%",
                icon: GraduationCap,
                trend: "up",
                color: "bg-green-500"
            });
        }

        if (tasks && tasks.tasks) {
            const activeTasks = tasks.tasks.filter((task: TaskData) => new Date(task.deadline) > new Date()).length;
            stats.push({
                label: "Active Tasks",
                value: activeTasks.toString(),
                change: "+8%",
                icon: FileText,
                trend: "up",
                color: "bg-purple-500"
            });
        }

        if (quizzes && Array.isArray(quizzes)) {
            // Check if quiz.opened is true, handling undefined
            const activeQuizzes = quizzes.filter((quiz: QuizData) => quiz.opened === true).length;
            stats.push({
                label: "Active Quizzes",
                value: activeQuizzes.toString(),
                change: "+15%",
                icon: BookOpen,
                trend: "up",
                color: "bg-orange-500"
            });
        }

        if (groups && Array.isArray(groups)) {
            stats.push({
                label: "Total Groups",
                value: groups.length.toString(),
                change: "+2%",
                icon: Users,
                trend: "up",
                color: "bg-indigo-500"
            });
        }

        if (submissions && submissions.submissions) {
            stats.push({
                label: "Total Submissions",
                value: submissions.submissions.length.toString(),
                change: "+25%",
                icon: ClipboardList,
                trend: "up",
                color: "bg-teal-500"
            });
        }

        return stats.slice(0, 4);
    };

    // Generate recent activities from API data
    const generateRecentActivities = (): RecentActivity[] => {
        const activities: RecentActivity[] = [];

        if (submissions && submissions.submissions) {
            const recentSubmissions = [...submissions.submissions]
                .sort((a: SubmissionData, b: SubmissionData) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 2);

            recentSubmissions.forEach(submission => {
                let studentName = 'Unknown Student';
                // Type assertion: Ensure studentId is treated as UserData when accessing 'name'
                if (typeof submission.studentId === 'object' && submission.studentId !== null) {
                    // Check if it has the 'name' property as defined in UserData
                    const student = submission.studentId as UserData;
                    if (student.name) {
                        studentName = student.name;
                    }
                }

                activities.push({
                    id: submission._id,
                    user: studentName,
                    action: "submitted an assignment",
                    time: formatTimeAgo(submission.submittedAt),
                    type: "submission"
                });
            });
        }

        if (tasks && tasks.tasks) {
            const recentTasks = [...tasks.tasks]
                .sort((a: TaskData, b: TaskData) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 2);

            recentTasks.forEach(task => {
                const teacherName = task.teacherId && task.teacherId.name && task.teacherId.surname
                    ? `${task.teacherId.name} ${task.teacherId.surname}`
                    : 'Unknown Teacher';

                activities.push({
                    id: task._id,
                    user: teacherName,
                    action: "created a new task",
                    time: formatTimeAgo(task.createdAt),
                    type: "task"
                });
            });
        }

        if (quizzes && Array.isArray(quizzes)) {
            const recentQuizzes = [...quizzes]
                .sort((a: QuizData, b: QuizData) => {
                    // Handle potential undefined createdAt for sorting
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                })
                .slice(0, 1);

            recentQuizzes.forEach(quiz => {
                activities.push({
                    id: quiz._id,
                    user: "Teacher", // Assuming 'Teacher' for quiz creation for now as no teacherId is available on QuizData
                    action: "created a new quiz",
                    // Provide a fallback for createdAt if it's undefined
                    time: formatTimeAgo(quiz.createdAt || new Date().toISOString()),
                    type: "quiz"
                });
            });
        }

        return activities.slice(0, 4);
    };

    // Generate admin tasks
    const generateAdminTasks = (): AdminTask[] => {
        const adminTasks: AdminTask[] = [];

        if (submissions && submissions.submissions) {
            const pendingSubmissions = submissions.submissions.filter((s: SubmissionData) => s.status === 'submitted').length;
            if (pendingSubmissions > 0) {
                adminTasks.push({
                    id: 'pending-submissions',
                    title: 'Review Pending Submissions',
                    priority: 'high',
                    status: 'pending',
                    dueDate: 'Today',
                    count: pendingSubmissions
                });
            }
        }

        if (tasks && tasks.tasks) {
            const overdueTasks = tasks.tasks.filter((task: TaskData) => new Date(task.deadline) < new Date()).length;
            if (overdueTasks > 0) {
                adminTasks.push({
                    id: 'overdue-tasks',
                    title: 'Handle Overdue Tasks',
                    priority: 'high',
                    status: 'pending',
                    dueDate: 'Overdue',
                    count: overdueTasks
                });
            }
        }

        if (misses && misses.data) {
            const recentMisses = misses.data.filter((miss: MissData) => {
                const missDate = new Date(miss.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return missDate > weekAgo;
            }).length;

            if (recentMisses > 0) {
                adminTasks.push({
                    id: 'recent-misses',
                    title: 'Review Recent Absences',
                    priority: 'medium',
                    status: 'pending',
                    dueDate: 'This Week',
                    count: recentMisses
                });
            }
        }

        adminTasks.push({
            id: 'system-maintenance',
            title: 'System Backup & Maintenance',
            priority: 'low',
            status: 'in-progress',
            dueDate: 'Weekly'
        });

        return adminTasks.slice(0, 3);
    };

    // Helper function to format time ago
    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    if (isLoading) return <Spinner/>;

    if (usersError || teachersError || groupsError || tasksError || quizzesError || missesError || submissionsError) {
        console.error('API Errors:', {
            usersError,
            teachersError,
            groupsError,
            tasksError,
            quizzesError,
            missesError,
            submissionsError
        });
    }

    const stats = generateStats();
    const recentActivities = generateRecentActivities();
    const adminTasks = generateAdminTasks();

    return (
        <div
            className="min-h-screen w-full justify-center align-middle bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
            <WelcomePopup name={currentUser.name}/>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 lg:p-6 flex items-center justify-end lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <Menu className="w-5 h-5"/>
                    </button>
                </div>

                {/* Dashboard Content */}
                <main className="p-4 lg:p-8 space-y-8">
                    {/* Stats Grid */}
                    <section>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <StatCard key={stat.label} stat={stat} index={index}/>
                            ))}
                        </div>
                    </section>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Quick Actions */}
                            <section
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick
                                    Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        {icon: Plus, label: "Add Student", color: "bg-blue-500 hover:bg-blue-600"},
                                        {
                                            icon: FileText,
                                            label: "Create Task",
                                            color: "bg-green-500 hover:bg-green-600"
                                        },
                                        {icon: BookOpen, label: "New Quiz", color: "bg-purple-500 hover:bg-purple-600"},
                                        {
                                            icon: Download,
                                            label: "Export Data",
                                            color: "bg-orange-500 hover:bg-orange-600"
                                        }
                                    ].map((action, index) => (
                                        <motion.button
                                            key={action.label}
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{delay: index * 0.1}}
                                            whileHover={{y: -2}}
                                            whileTap={{scale: 0.95}}
                                            className={`${action.color} text-white p-4 rounded-lg transition-all duration-300 flex flex-col items-center gap-2 shadow-sm hover:shadow-md`}
                                        >
                                            <action.icon className="w-6 h-6"/>
                                            <span className="text-sm font-medium">{action.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </section>

                            {/* Chart Section */}
                            <section
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics
                                        Overview</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg">
                                            Week
                                        </button>
                                        <button
                                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                            Month
                                        </button>
                                        <button
                                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                            Year
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2"/>
                                        <p className="text-gray-500 dark:text-gray-400">Chart placeholder</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">Analytics data will be
                                            displayed here</p>
                                    </div>
                                </div>
                            </section>

                            {/* File Upload Zone */}
                            <FileUploadZone/>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Admin Tasks */}
                            <section
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Tasks</h3>
                                    <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {adminTasks.map((task) => (
                                        <TaskCard key={task.id} task={task}/>
                                    ))}
                                </div>
                            </section>

                            {/* Recent Activity */}
                            <section
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent
                                        Activity</h3>
                                    <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((activity, index) => (
                                            <ActivityItem key={activity.id} activity={activity} index={index}/>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Activity
                                                className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
                                            <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* System Status */}
                            <section
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System
                                    Status</h3>
                                <div className="space-y-4">
                                    {[
                                        {
                                            label: "Server Status",
                                            status: "online",
                                            icon: CheckCircle,
                                            color: "text-green-500"
                                        },
                                        {
                                            label: "Database",
                                            status: "healthy",
                                            icon: CheckCircle,
                                            color: "text-green-500"
                                        },
                                        {
                                            label: "API Services",
                                            status: "operational",
                                            icon: CheckCircle,
                                            color: "text-green-500"
                                        },
                                        {
                                            label: "Backup System",
                                            status: "scheduled",
                                            icon: Clock,
                                            color: "text-yellow-500"
                                        }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{opacity: 0, x: 20}}
                                            animate={{opacity: 1, x: 0}}
                                            transition={{delay: index * 0.1}}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-5 h-5 ${item.color}`}/>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <span className={`text-sm capitalize ${item.color}`}>
                                                {item.status}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Admin;