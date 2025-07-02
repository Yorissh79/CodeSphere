import React, {useState, useEffect} from 'react';
import {
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    BarChart3,
    TrendingUp,
    Calendar,
    Activity,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    ChevronDown,
    Eye,
    Download,
    Filter,
    RefreshCw,
    LucideIcon // Import LucideIcon type
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
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';

// Type Definitions
interface Teacher {
    _id: string;
    name: string;
    surname: string;
    email: string;
    role: 'teacher';
}

interface Student {
    _id: string;
    name: string;
    surname: string;
    email: string;
    group: string;
    role: 'student';
}

interface Group {
    _id: string;
    group: string;
    teachers: string[];
    date: string;
}

interface Task {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    maxPoints: number;
    assignedGroups: string[];
}

interface Quiz {
    _id: string;
    title: string;
    timeLimit: number;
    opened: boolean;
    groups: string[];
}

interface MockData {
    teachers: Teacher[];
    students: Student[];
    groups: Group[];
    tasks: Task[];
    quizzes: Quiz[];
}

// Mock data based on your API structure
const mockData: MockData = {
    teachers: [
        {_id: '1', name: 'John', surname: 'Smith', email: 'john@example.com', role: 'teacher'},
        {_id: '2', name: 'Sarah', surname: 'Johnson', email: 'sarah@example.com', role: 'teacher'},
        {_id: '3', name: 'Mike', surname: 'Davis', email: 'mike@example.com', role: 'teacher'}
    ],
    students: [
        {_id: '1', name: 'Alice', surname: 'Brown', email: 'alice@example.com', group: 'Group A', role: 'student'},
        {_id: '2', name: 'Bob', surname: 'Wilson', email: 'bob@example.com', group: 'Group A', role: 'student'},
        {_id: '3', name: 'Charlie', surname: 'Taylor', email: 'charlie@example.com', group: 'Group B', role: 'student'},
        {_id: '4', name: 'Diana', surname: 'Martinez', email: 'diana@example.com', group: 'Group B', role: 'student'},
        {_id: '5', name: 'Eve', surname: 'Anderson', email: 'eve@example.com', group: 'Group C', role: 'student'}
    ],
    groups: [
        {_id: '1', group: 'Group A', teachers: ['1'], date: '2024-01-15'},
        {_id: '2', group: 'Group B', teachers: ['2'], date: '2024-01-20'},
        {_id: '3', group: 'Group C', teachers: ['3'], date: '2024-01-25'}
    ],
    tasks: [
        {
            _id: '1',
            title: 'Math Assignment',
            description: 'Complete exercises 1-10',
            deadline: '2024-07-15',
            maxPoints: 100,
            assignedGroups: ['1', '2']
        },
        {
            _id: '2',
            title: 'Science Project',
            description: 'Build a volcano model',
            deadline: '2024-07-20',
            maxPoints: 150,
            assignedGroups: ['1']
        },
        {
            _id: '3',
            title: 'History Essay',
            description: 'Write about WWII',
            deadline: '2024-07-25',
            maxPoints: 200,
            assignedGroups: ['2', '3']
        }
    ],
    quizzes: [
        {_id: '1', title: 'Math Quiz #1', timeLimit: 30, opened: true, groups: ['1']},
        {_id: '2', title: 'Science Quiz', timeLimit: 45, opened: false, groups: ['1', '2']},
        {_id: '3', title: 'History Quiz', timeLimit: 60, opened: true, groups: ['2', '3']}
    ]
};

const COLORS: string[] = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const AdminDashboard = () => {
    const [isDark, setIsDark] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('7d'); // This state is defined but not used in the provided code.

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setIsDark(theme === 'dark');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newTheme);
    };

    // Data processing for charts
    interface GroupDistributionData {
        name: string;
        students: number;
        teachers: number;
    }

    const groupDistribution: GroupDistributionData[] = mockData.groups.map(group => ({
        name: group.group,
        students: mockData.students.filter(student => student.group === group.group).length,
        teachers: group.teachers.length
    }));

    interface StatusData {
        name: string;
        value: number;
    }

    const taskStatusData: StatusData[] = [
        {name: 'Active', value: mockData.tasks.filter(task => new Date(task.deadline) > new Date()).length},
        {name: 'Overdue', value: mockData.tasks.filter(task => new Date(task.deadline) < new Date()).length},
        {name: 'Completed', value: Math.floor(mockData.tasks.length * 0.6)} // Assuming 60% are completed for mock
    ];

    const quizStatusData: StatusData[] = [
        {name: 'Open', value: mockData.quizzes.filter(quiz => quiz.opened).length},
        {name: 'Closed', value: mockData.quizzes.filter(quiz => !quiz.opened).length}
    ];

    interface WeeklyActivityData {
        day: string;
        tasks: number;
        quizzes: number;
        submissions: number;
    }

    const weeklyActivity: WeeklyActivityData[] = [
        {day: 'Mon', tasks: 12, quizzes: 8, submissions: 45},
        {day: 'Tue', tasks: 19, quizzes: 12, submissions: 52},
        {day: 'Wed', tasks: 8, quizzes: 6, submissions: 38},
        {day: 'Thu', tasks: 15, quizzes: 10, submissions: 48},
        {day: 'Fri', tasks: 22, quizzes: 15, submissions: 62},
        {day: 'Sat', tasks: 5, quizzes: 3, submissions: 28},
        {day: 'Sun', tasks: 8, quizzes: 4, submissions: 35}
    ];

    interface StatCardProps {
        title: string;
        value: number;
        icon: LucideIcon; // Use LucideIcon type for the icon component
        trend?: number; // Optional prop
        color?: string; // Optional prop
    }

    const StatCard: React.FC<StatCardProps> = ({title, value, icon: Icon, trend, color = 'blue'}) => (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                    {trend !== undefined && ( // Check if trend is provided
                        <div
                            className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className="w-4 h-4 mr-1"/>
                            {Math.abs(trend)}% from last week
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`}/>
                </div>
            </div>
        </div>
    );

    interface ChartCardProps {
        title: string;
        children: React.ReactNode;
        actions?: React.ReactNode; // Optional prop
    }

    const ChartCard: React.FC<ChartCardProps> = ({title, children, actions}) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                {actions && (
                    <div className="flex items-center space-x-2">
                        {actions}
                    </div>
                )}
            </div>
            {children}
        </div>
    );

    const Sidebar = () => (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Learning Center</h1>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X className="w-5 h-5"/>
                </button>
            </div>

            <nav className="mt-6 px-3">
                {[
                    {id: 'overview', label: 'Overview', icon: BarChart3},
                    {id: 'teachers', label: 'Teachers', icon: GraduationCap},
                    {id: 'students', label: 'Students', icon: Users},
                    {id: 'groups', label: 'Groups', icon: BookOpen},
                    {id: 'tasks', label: 'Tasks', icon: ClipboardList},
                    {id: 'quizzes', label: 'Quizzes', icon: Activity},
                    {id: 'settings', label: 'Settings', icon: Settings}
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-3 py-2 mb-1 rounded-lg text-left transition-colors ${
                            activeTab === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mr-3"/>
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );

    const Header = () => (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Menu className="w-5 h-5"/>
                    </button>
                    <div className="ml-4 md:ml-0">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                            {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {isDark ? '🌙' : '☀️'}
                    </button>

                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">A</span>
                    </div>
                </div>
            </div>
        </header>
    );

    interface ActivityItem {
        type: 'task' | 'quiz' | 'student' | 'group';
        title: string;
        time: string;
        user: string;
    }

    const OverviewContent = () => (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Teachers"
                    value={mockData.teachers.length}
                    icon={GraduationCap}
                    trend={12}
                    color="blue"
                />
                <StatCard
                    title="Total Students"
                    value={mockData.students.length}
                    icon={Users}
                    trend={8}
                    color="green"
                />
                <StatCard
                    title="Active Tasks"
                    value={mockData.tasks.length}
                    icon={ClipboardList}
                    trend={-5}
                    color="orange"
                />
                <StatCard
                    title="Total Quizzes"
                    value={mockData.quizzes.length}
                    icon={Activity}
                    trend={15}
                    color="purple"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Student Distribution by Groups"
                    actions={
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Download className="w-4 h-4"/>
                        </button>
                    }
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={groupDistribution}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="students" fill="#3b82f6" name="Students"/>
                            <Bar dataKey="teachers" fill="#10b981" name="Teachers"/>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Task Status Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={taskStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({name, percent}: {
                                    name: string,
                                    percent: number
                                }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {taskStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Weekly Activity">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
                            <XAxis dataKey="day"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Area type="monotone" dataKey="submissions" stackId="1" stroke="#3b82f6" fill="#3b82f6"
                                  fillOpacity={0.6}/>
                            <Area type="monotone" dataKey="tasks" stackId="1" stroke="#10b981" fill="#10b981"
                                  fillOpacity={0.6}/>
                            <Area type="monotone" dataKey="quizzes" stackId="1" stroke="#f59e0b" fill="#f59e0b"
                                  fillOpacity={0.6}/>
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Quiz Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={quizStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {quizStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Recent Activity */}
            <ChartCard title="Recent Activity">
                <div className="space-y-4">
                    {[
                        {
                            type: 'task',
                            title: 'New task created: Math Assignment',
                            time: '2 hours ago',
                            user: 'John Smith'
                        },
                        {
                            type: 'quiz',
                            title: 'Quiz completed by 15 students',
                            time: '4 hours ago',
                            user: 'Sarah Johnson'
                        },
                        {type: 'student', title: 'New student registered', time: '6 hours ago', user: 'Alice Brown'},
                        {type: 'group', title: 'Group C schedule updated', time: '1 day ago', user: 'Mike Davis'}
                    ].map((activity: ActivityItem, index: number) => (
                        <div key={index}
                             className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                activity.type === 'task' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                    activity.type === 'quiz' ? 'bg-green-100 dark:bg-green-900/20' :
                                        activity.type === 'student' ? 'bg-purple-100 dark:bg-purple-900/20' :
                                            'bg-orange-100 dark:bg-orange-900/20'
                            }`}>
                                {activity.type === 'task' &&
                                    <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400"/>}
                                {activity.type === 'quiz' &&
                                    <Activity className="w-4 h-4 text-green-600 dark:text-green-400"/>}
                                {activity.type === 'student' &&
                                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400"/>}
                                {activity.type === 'group' &&
                                    <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400"/>}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user} • {activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ChartCard>
        </div>
    );

    const renderContent = (): JSX.Element => {
        switch (activeTab) {
            case 'overview':
                return <OverviewContent/>;
            case 'teachers':
                return <div className="text-center p-8 text-gray-500">Teachers management coming soon...</div>;
            case 'students':
                return <div className="text-center p-8 text-gray-500">Students management coming soon...</div>;
            case 'groups':
                return <div className="text-center p-8 text-gray-500">Groups management coming soon...</div>;
            case 'tasks':
                return <div className="text-center p-8 text-gray-500">Tasks management coming soon...</div>;
            case 'quizzes':
                return <div className="text-center p-8 text-gray-500">Quizzes management coming soon...</div>;
            case 'settings':
                return <div className="text-center p-8 text-gray-500">Settings coming soon...</div>;
            default:
                return <OverviewContent/>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Sidebar/>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="md:ml-64">
                <Header/>
                <main className="p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;