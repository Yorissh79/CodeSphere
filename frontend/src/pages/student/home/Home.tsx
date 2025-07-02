import React, {useState, useRef, useCallback, useEffect, createContext, useContext} from 'react';
import {
    BookOpen,
    Calendar,
    Clock,
    Users,
    Upload,
    FileText,
    Image,
    Link,
    X,
    Plus,
    CheckCircle,
    AlertCircle,
    Moon,
    Sun,
    Menu,
    Bell,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Download,
    Eye,
    User,
    PackageOpen // A good alternative for general files
} from 'lucide-react';

// --- Type Definitions ---

interface Teacher {
    _id: string;
    name: string;
    surname: string;
    email: string;
}

interface Attachment {
    type: 'text' | 'link' | 'image' | 'file'; // Added 'file' as a generic type
    content: string;
    filename?: string; // Optional for text content
}

type SubmissionStatus = 'not_submitted' | 'submitted';

interface Task {
    _id: string;
    title: string;
    description: string;
    deadline: string; // ISO 8601 string
    maxPoints: number;
    assignedGroups: string[];
    teacherId: Teacher;
    allowLateSubmission: boolean;
    attachments: Attachment[];
    submissionStatus: SubmissionStatus;
    createdAt: string; // ISO 8601 string
}

interface User {
    name: string;
    surname: string;
    email: string;
    group: string;
    role: 'student' | 'teacher';
}

interface FilterState {
    status: 'all' | 'pending' | 'submitted' | 'overdue';
    deadline: 'all' | 'today' | 'week' | 'month';
    group: 'all' | string; // Assuming 'group' filter might be added later dynamically
}

// --- Theme Context ---
interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => {
        // default empty function
    }
});

// --- Mock Data ---
const mockTasks: Task[] = [
    {
        _id: '1',
        title: 'React Fundamentals Assignment',
        description: 'Build a complete React application with hooks, state management, and component composition. This assignment will test your understanding of modern React patterns.',
        deadline: '2025-07-15T23:59:00Z',
        maxPoints: 100,
        assignedGroups: ['CS-2024', 'WEB-DEV'],
        teacherId: {
            _id: 't1',
            name: 'Sarah',
            surname: 'Johnson',
            email: 'sarah.johnson@edu.com'
        },
        allowLateSubmission: true,
        attachments: [
            {type: 'text', content: 'Please follow the coding standards document', filename: 'Coding Standards'},
            {type: 'link', content: 'https://reactjs.org/docs', filename: 'React Documentation'}
        ],
        submissionStatus: 'not_submitted',
        createdAt: '2025-06-20T10:00:00Z'
    },
    {
        _id: '2',
        title: 'Database Design Project',
        description: 'Design and implement a normalized database schema for an e-commerce platform.',
        deadline: '2025-07-02T18:00:00Z', // Changed deadline for 'due today' or 'overdue' testing
        maxPoints: 150,
        assignedGroups: ['CS-2024'],
        teacherId: {
            _id: 't2',
            name: 'Michael',
            surname: 'Chen',
            email: 'michael.chen@edu.com'
        },
        allowLateSubmission: false,
        attachments: [],
        submissionStatus: 'not_submitted',
        createdAt: '2025-06-18T14:30:00Z'
    },
    {
        _id: '3',
        title: 'Algorithms Homework',
        description: 'Solve the given set of algorithmic problems focusing on dynamic programming.',
        deadline: '2025-06-25T12:00:00Z', // Overdue task
        maxPoints: 80,
        assignedGroups: ['CS-2024'],
        teacherId: {
            _id: 't1',
            name: 'Sarah',
            surname: 'Johnson',
            email: 'sarah.johnson@edu.com'
        },
        allowLateSubmission: false,
        attachments: [{type: 'file', content: 'algorithms_problems.pdf', filename: 'problems.pdf'}],
        submissionStatus: 'submitted',
        createdAt: '2025-06-10T09:00:00Z'
    },
    {
        _id: '4',
        title: 'Web Security Research',
        description: 'Research common web vulnerabilities and propose mitigation strategies for a web application.',
        deadline: '2025-07-08T10:00:00Z',
        maxPoints: 120,
        assignedGroups: ['WEB-DEV'],
        teacherId: {
            _id: 't2',
            name: 'Michael',
            surname: 'Chen',
            email: 'michael.chen@edu.com'
        },
        allowLateSubmission: true,
        attachments: [],
        submissionStatus: 'not_submitted',
        createdAt: '2025-06-28T16:00:00Z'
    }
];

const mockUser: User = {
    name: 'Alex',
    surname: 'Thompson',
    email: 'alex.thompson@student.edu',
    group: 'CS-2024',
    role: 'student'
};
// For testing teacher role, uncomment this:
// const mockUser: User = {
//     name: 'Sarah',
//     surname: 'Johnson',
//     email: 'sarah.johnson@edu.com',
//     group: 'CS-2024',
//     role: 'teacher'
// };

// --- Utility Functions ---
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day for accurate day diff

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Use ceil to count today as 1 day if deadline is later today

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) {
        const hoursLeft = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        if (hoursLeft <= 0) return 'Overdue'; // If deadline has passed today
        return `Due today at ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    }
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
};

const getStatusColor = (status: SubmissionStatus, deadline: string): string => {
    const isOverdue = new Date(deadline) < new Date();

    if (status === 'submitted') return 'text-emerald-600 dark:text-emerald-400';
    if (isOverdue) return 'text-red-600 dark:text-red-400';
    return 'text-amber-600 dark:text-amber-400';
};

const getStatusBg = (status: SubmissionStatus, deadline: string): string => {
    const isOverdue = new Date(deadline) < new Date();

    if (status === 'submitted') return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    if (isOverdue) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
};

// --- Components ---

interface FileUploadZoneProps {
    onFilesAdded?: (files: File[]) => void;
    acceptedTypes?: string[]; // e.g., ['image/*', 'application/pdf', '.doc']
    maxSize?: number; // in MB
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({onFilesAdded, acceptedTypes = [], maxSize = 5}) => {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, []);

    const handleFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => {
            // Check file type
            const isAcceptedType = acceptedTypes.length === 0 || acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type || file.name.endsWith(type); // For extensions like .doc
            });

            // Check file size
            const isWithinSizeLimit = file.size <= maxSize * 1024 * 1024;

            // Check for duplicates
            const isDuplicate = files.some(existingFile =>
                existingFile.name === file.name && existingFile.size === file.size
            );

            return isAcceptedType && isWithinSizeLimit && !isDuplicate;
        });

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            onFilesAdded?.(validFiles);
        }
    };

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500"/>;
        if (fileType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500"/>;
        if (fileType.includes('document') || fileType.includes('text')) return <FileText
            className="w-5 h-5 text-gray-500"/>;
        if (fileType.includes('zip') || fileType.includes('rar')) return <Download
            className="w-5 h-5 text-purple-500"/>;
        return <PackageOpen className="w-5 h-5 text-gray-500"/>;
    };


    return (
        <div className="space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                    ${isDragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                    // Ensure acceptedTypes are correctly formatted for the accept attribute if needed
                    // accept={acceptedTypes.join(',')} // This might be desired for native file dialog filtering
                />

                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400"/>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Drop files here or click to upload
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Maximum file size: {maxSize}MB. Accepted
                    types: {acceptedTypes.length > 0 ? acceptedTypes.map(t => t.startsWith('.') ? t : t.split('/')[1] || t).join(', ') : 'Any'}
                </p>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                    <Plus className="w-4 h-4 mr-2"/>
                    Select Files
                </button>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Uploaded Files</h4>
                    {files.map((file, index) => (
                        <div key={index}
                             className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(file.type)}
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                                aria-label={`Remove ${file.name}`}
                            >
                                <X className="w-4 h-4 text-gray-500"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface StatusBadgeProps {
    status: SubmissionStatus;
    deadline: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({status, deadline}) => {
    const isOverdue = new Date(deadline) < new Date();

    const getIcon = () => {
        if (status === 'submitted') return <CheckCircle className="w-4 h-4"/>;
        if (isOverdue) return <AlertCircle className="w-4 h-4"/>;
        return <Clock className="w-4 h-4"/>;
    };

    const getText = () => {
        if (status === 'submitted') return 'Submitted';
        if (isOverdue) return 'Overdue';
        return 'Pending';
    };

    return (
        <div
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBg(status, deadline)}`}>
            {getIcon()}
            <span className={getStatusColor(status, deadline)}>{getText()}</span>
        </div>
    );
};

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
    onView?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({task, onEdit, onDelete, onView}) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden group">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-4">
                        {task.title}
                    </h3>

                    <div className="relative">
                        <button
                            ref={buttonRef}
                            onClick={() => setIsMenuOpen(prev => !prev)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label="Task options"
                            aria-haspopup="true"
                            aria-expanded={isMenuOpen}
                        >
                            <MoreVertical className="w-5 h-5 text-gray-500"/>
                        </button>

                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32"
                                role="menu"
                            >
                                <button
                                    onClick={() => {
                                        onView?.(task);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    role="menuitem"
                                >
                                    <Eye className="w-4 h-4"/>
                                    <span>View</span>
                                </button>
                                <button
                                    onClick={() => {
                                        onEdit?.(task);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    role="menuitem"
                                >
                                    <Edit className="w-4 h-4"/>
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete?.(task);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    role="menuitem"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {task.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={task.submissionStatus} deadline={task.deadline}/>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.maxPoints} pts
                    </span>
                </div>

                {/* Teacher & Groups */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                        <User className="w-4 h-4"/>
                        <span>{task.teacherId.name} {task.teacherId.surname}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4"/>
                        <span>{task.assignedGroups.join(', ')}</span>
                    </div>
                </div>

                {/* Attachments */}
                {task.attachments && task.attachments.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {task.attachments.map((attachment, index) => (
                                <div key={index}
                                     className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                    {attachment.type === 'link' && <Link className="w-3 h-3 text-blue-500"/>}
                                    {attachment.type === 'text' && <FileText className="w-3 h-3 text-gray-500"/>}
                                    {attachment.type === 'image' && <Image className="w-3 h-3 text-emerald-500"/>}
                                    {/* Generic file icon for other types not explicitly handled */}
                                    {attachment.type === 'file' && <PackageOpen className="w-3 h-3 text-purple-500"/>}
                                    <span className="truncate max-w-20 text-gray-700 dark:text-gray-300">
                                        {attachment.filename || (attachment.type === 'link' ? 'Link' : 'Attachment')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4"/>
                        <span>{formatDate(task.deadline)}</span>
                    </div>

                    <button
                        onClick={() => onView?.(task)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

interface NavigationProps {
    user: User;
    onCreateTask: () => void;
}

const Navigation: React.FC<NavigationProps> = ({user, onCreateTask}) => {
    const {isDark, toggleTheme} = useContext(ThemeContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Title */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            aria-label="Toggle mobile menu"
                        >
                            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <BookOpen className="w-6 h-6 text-white"/>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskHub</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Educational Platform</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        {user.role === 'teacher' && (
                            <button
                                onClick={onCreateTask}
                                className="hidden sm:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Plus className="w-4 h-4 mr-2"/>
                                Create Task
                            </button>
                        )}

                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative"
                                aria-label="Notifications">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                        >
                            {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400"/> :
                                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>}
                        </button>

                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                            <div
                                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                    {user.name.charAt(0)}{user.surname.charAt(0)}
                                </span>
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name} {user.surname}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user.role} • {user.group}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu (Hidden by default, can be expanded) */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden pb-4">
                        {user.role === 'teacher' && (
                            <button
                                onClick={() => {
                                    onCreateTask();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                            >
                                <Plus className="w-5 h-5 mr-3"/>
                                Create Task
                            </button>
                        )}
                        {/* Add other mobile navigation links here if needed */}
                    </div>
                )}
            </div>
        </nav>
    );
};

interface TaskFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    onSearchChange: (searchTerm: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({onFilterChange, onSearchChange}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        status: 'all',
        deadline: 'all',
        group: 'all'
    });

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        onSearchChange(value);
    }, [onSearchChange]);

    const handleFilter = useCallback((key: keyof FilterState, value: string) => {
        const newFilters = {...activeFilters, [key]: value};
        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    }, [activeFilters, onFilterChange]);

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search tasks by title or description..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <select
                        value={activeFilters.status}
                        onChange={(e) => handleFilter('status', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        aria-label="Filter by status"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="overdue">Overdue</option>
                    </select>

                    <select
                        value={activeFilters.deadline}
                        onChange={(e) => handleFilter('deadline', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        aria-label="Filter by deadline"
                    >
                        <option value="all">All Deadlines</option>
                        <option value="today">Due Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    {/* Add Group Filter if needed
                    <select
                        value={activeFilters.group}
                        onChange={(e) => handleFilter('group', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Groups</option>
                        <option value="CS-2024">CS-2024</option>
                        <option value="WEB-DEV">WEB-DEV</option>
                    </select>
                    */}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
const TaskManagementApp: React.FC = () => {
    const [isDark, setIsDark] = useState<boolean>(() => {
        // Initialize theme from localStorage or system preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            return savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>(mockTasks);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        status: 'all',
        deadline: 'all',
        group: 'all' // Assuming 'group' filter might be added later
    });
    const [searchTerm, setSearchTerm] = useState<string>('');


    // Apply dark mode class to HTML element
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => !prev);
    }, []);

    const applyFiltersAndSearch = useCallback(() => {
        let currentFiltered: Task[] = [...tasks];

        // Apply search term
        if (searchTerm) {
            currentFiltered = currentFiltered.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (activeFilters.status !== 'all') {
            currentFiltered = currentFiltered.filter(task => {
                const isOverdue = new Date(task.deadline) < new Date();
                if (activeFilters.status === 'pending') return task.submissionStatus === 'not_submitted' && !isOverdue;
                if (activeFilters.status === 'submitted') return task.submissionStatus === 'submitted';
                if (activeFilters.status === 'overdue') return isOverdue && task.submissionStatus === 'not_submitted';
                return true;
            });
        }

        // Apply deadline filter
        if (activeFilters.deadline !== 'all') {
            currentFiltered = currentFiltered.filter(task => {
                const deadlineDate = new Date(task.deadline);
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day

                if (activeFilters.deadline === 'today') {
                    const today = new Date(now);
                    today.setHours(23, 59, 59, 999);
                    return deadlineDate >= now && deadlineDate <= today;
                }
                if (activeFilters.deadline === 'week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
                    startOfWeek.setHours(0, 0, 0, 0);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 7);
                    endOfWeek.setHours(0, 0, 0, 0); // Exclude the very start of next week
                    return deadlineDate >= startOfWeek && deadlineDate < endOfWeek;
                }
                if (activeFilters.deadline === 'month') {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    return deadlineDate >= startOfMonth && deadlineDate <= endOfMonth;
                }
                return true;
            });
        }

        // Apply group filter (if enabled)
        if (activeFilters.group !== 'all' && mockUser.role === 'student') {
            currentFiltered = currentFiltered.filter(task =>
                task.assignedGroups.includes(mockUser.group)
            );
        }


        setFilteredTasks(currentFiltered);
    }, [tasks, searchTerm, activeFilters]);

    // Re-filter tasks whenever filters or search term changes
    useEffect(() => {
        applyFiltersAndSearch();
    }, [applyFiltersAndSearch]);

    const handleFilterChange = useCallback((filters: FilterState) => {
        setActiveFilters(filters);
    }, []);

    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    // Placeholder for actual task operations
    const handleViewTask = useCallback((task: Task) => {
        setSelectedTask(task);
        console.log('Viewing task:', task.title);
        // In a real app, this would open a modal or navigate to a detail page
    }, []);

    const handleEditTask = useCallback((task: Task) => {
        console.log('Editing task:', task.title);
        // In a real app, this would open an edit modal pre-populated with task data
    }, []);

    const handleDeleteTask = useCallback((task: Task) => {
        if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
            setTasks(prevTasks => prevTasks.filter(t => t._id !== task._id));
            console.log('Deleted task:', task.title);
        }
    }, []);

    const handleCreateTask = useCallback(() => {
        setShowCreateModal(true);
        console.log('Opening create task modal');
        // In a real app, this would open a form to create a new task
    }, []);

    return (
        <ThemeContext.Provider value={{isDark, toggleTheme}}>
            <div className={isDark ? 'dark' : ''}>
                <div
                    className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
                    <Navigation user={mockUser} onCreateTask={handleCreateTask}/>

                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome back, {mockUser.name}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                You have {tasks.filter(t => t.submissionStatus === 'not_submitted').length} pending
                                tasks overall.
                                {mockUser.role === 'student' && ` Your group is ${mockUser.group}.`}
                            </p>
                        </div>

                        {/* Filters */}
                        <TaskFilters
                            onFilterChange={handleFilterChange}
                            onSearchChange={handleSearchChange}
                        />

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total
                                            Tasks</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                            {tasks.filter(t => t.submissionStatus === 'not_submitted').length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400"/>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {tasks.filter(t => t.submissionStatus === 'submitted').length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tasks Grid */}
                        {filteredTasks.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredTasks.map(task => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onView={handleViewTask}
                                        onEdit={handleEditTask}
                                        onDelete={handleDeleteTask}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks
                                    found</h3>
                                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search
                                    term.</p>
                            </div>
                        )}


                        {/* File Upload Demo */}
                        <div
                            className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                File Upload Component Demo
                            </h3>
                            <FileUploadZone
                                onFilesAdded={(files) => console.log('Files added:', files.map(f => f.name))}
                                acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx']} // Example accepted types
                                maxSize={10}
                            />
                        </div>

                        {/* Task Detail Modal Placeholder */}
                        {selectedTask && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div
                                    className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full shadow-2xl relative">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{selectedTask.title}</h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedTask.description}</p>
                                    <div
                                        className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        <p><span
                                            className="font-semibold">Deadline:</span> {new Date(selectedTask.deadline).toLocaleString()}
                                        </p>
                                        <p><span className="font-semibold">Points:</span> {selectedTask.maxPoints}</p>
                                        <p><span
                                            className="font-semibold">Assigned to:</span> {selectedTask.assignedGroups.join(', ')}
                                        </p>
                                        <p><span
                                            className="font-semibold">Teacher:</span> {selectedTask.teacherId.name} {selectedTask.teacherId.surname}
                                        </p>
                                        <p><span className="font-semibold">Status:</span> <StatusBadge
                                            status={selectedTask.submissionStatus} deadline={selectedTask.deadline}/>
                                        </p>
                                        <p><span
                                            className="font-semibold">Late Submissions Allowed:</span> {selectedTask.allowLateSubmission ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    {selectedTask.attachments.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attachments:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTask.attachments.map((attachment, idx) => (
                                                    <div key={idx}
                                                         className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                        {attachment.type === 'link' &&
                                                            <Link className="w-3 h-3 text-blue-500"/>}
                                                        {attachment.type === 'text' &&
                                                            <FileText className="w-3 h-3 text-gray-500"/>}
                                                        {attachment.type === 'image' &&
                                                            <Image className="w-3 h-3 text-emerald-500"/>}
                                                        {attachment.type === 'file' &&
                                                            <PackageOpen className="w-3 h-3 text-purple-500"/>}
                                                        <span
                                                            className="truncate">{attachment.filename || attachment.content}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-5 h-5 text-gray-500"/>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Create Task Modal Placeholder */}
                        {showCreateModal && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div
                                    className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full shadow-2xl relative">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New
                                        Task</h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                                        This would be a form to create a new task.
                                    </p>
                                    {/* Add your form fields here */}
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                        aria-label="Close create task modal"
                                    >
                                        <X className="w-5 h-5 text-gray-500"/>
                                    </button>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 mt-4"
                                    >
                                        Save Task
                                    </button>
                                </div>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </ThemeContext.Provider>
    );
};

export default TaskManagementApp;