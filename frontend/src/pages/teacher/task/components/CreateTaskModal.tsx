import {
    useState,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import {
    X,
    Upload,
    Loader2,
    AlertCircle,
    Github,
    Calendar,
    Users,
    Trophy,
    FileText,
    Clock,
    CheckCircle2,
} from 'lucide-react';
// Corrected import path
import {useCreateTaskMutation} from '../../../../services/taskApi';
// Corrected import path
import {useGetAllGroupsQuery} from '../../../../services/groupApi';
import type {CreateTaskInput} from '../../../../services/taskApi';
import type {SerializedError} from '@reduxjs/toolkit';
import type {FetchBaseQueryError} from '@reduxjs/toolkit/query';

interface CreateTaskModalProps {
    showCreateModal: boolean;
    setShowCreateModal: (show: boolean) => void;
    currentTeacherId: string;
    refetchTasks: () => void;
}

const CreateTaskModal = ({
                             showCreateModal,
                             setShowCreateModal,
                             currentTeacherId,
                             refetchTasks,
                         }: CreateTaskModalProps) => {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [createTask, {isLoading: createTaskLoading, error: createTaskError}] = useCreateTaskMutation();
    const {data: groupsData, isLoading: groupsLoading, error: groupsError} = useGetAllGroupsQuery({});

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        teacherId: currentTeacherId,
        assignedGroups: [] as string[],
        deadline: '',
        allowLateSubmission: false,
        maxPoints: '100',
        githubLink: '', // Added GitHub link field
        files: [] as File[],
    });

    // Get current date and time in the format required for datetime-local input
    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Convert datetime-local input to ISO 8601 format
    const formatDeadlineToISO = (deadline: string): string => {
        if (!deadline) return '';
        return `${deadline}:00Z`;
    };

    // Convert files to base64 for attachments
    const convertFilesToAttachments = async (files: File[]) => {
        const attachments = [];
        for (const file of files) {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            attachments.push({
                type: file.type.startsWith('image/') ? 'image' : 'text' as 'text' | 'image' | 'link',
                content: base64,
                filename: file.name,
                originalName: file.name,
            });
        }
        return attachments;
    };

    // Handle Escape key press to close modal
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showCreateModal) {
                setShowCreateModal(false);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [showCreateModal, setShowCreateModal]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Convert files to attachments
            const attachments = await convertFilesToAttachments(selectedFiles);

            // Add GitHub link as an attachment if provided
            if (taskForm.githubLink.trim()) {
                attachments.push({
                    type: 'link',
                    content: taskForm.githubLink.trim(),
                    filename: 'GitHub Repository',
                    originalName: 'GitHub Repository',
                });
            }

            // Create the task data object that matches CreateTaskInput interface
            const taskData: CreateTaskInput = {
                title: taskForm.title,
                description: taskForm.description,
                assignedGroups: taskForm.assignedGroups,
                deadline: formatDeadlineToISO(taskForm.deadline),
                allowLateSubmission: taskForm.allowLateSubmission,
                maxPoints: taskForm.maxPoints,
                ...(attachments.length > 0 && {attachments}),
            };

            await createTask(taskData).unwrap();
            refetchTasks();
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const resetForm = () => {
        setTaskForm({
            title: '',
            description: '',
            teacherId: currentTeacherId,
            assignedGroups: [],
            deadline: '',
            allowLateSubmission: false,
            maxPoints: '100',
            githubLink: '', // Reset GitHub link
            files: [],
        });
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const validFiles = files.filter((file) => file.size <= maxFileSize);
        if (validFiles.length < files.length) {
            // Replaced alert with a more user-friendly message, consider a toast notification library for a real app.
            console.warn('Some files were ignored as they exceed 10MB.');
        }
        setSelectedFiles((prev) => [...prev, ...validFiles]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const maxFileSize = 10 * 1024 * 1024; // 10MB
            const validFiles = files.filter((file) => file.size <= maxFileSize);
            if (validFiles.length < files.length) {
                // Replaced alert with a more user-friendly message, consider a toast notification library for a real app.
                console.warn('Some files were ignored as they exceed 10MB.');
            }
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
        if (!error) return 'Failed to create task. Please try again.';
        if ('data' in error && error.data && typeof error.data === 'object' && 'error' in error.data) {
            return (error.data as { error: string }).error;
        }
        if ('message' in error && error.message) {
            return error.message;
        }
        return 'Failed to create task. Please try again.';
    };

    // Validate GitHub URL format
    const isValidGitHubUrl = (url: string): boolean => {
        if (!url.trim()) return true; // Empty URL is valid (optional field)
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com';
        } catch {
            return false;
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!showCreateModal) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div
                    className="fixed inset-0 transition-opacity duration-300"
                    onClick={() => setShowCreateModal(false)}
                />
                <div
                    className="relative w-full max-w-4xl my-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl animate-in zoom-in-95 duration-300">
                    {/* Header with gradient background */}
                    <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white"/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">
                                        Create New Task
                                    </h3>
                                    <p className="text-indigo-100/80 text-sm mt-1">
                                        Set up a new assignment for your students
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 group"
                                title="Close (ESC)"
                            >
                                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200"/>
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Error Messages */}
                        {(createTaskError || groupsError) && (
                            <div className="mb-8 space-y-4">
                                {createTaskError && (
                                    <div
                                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-red-400"/>
                                        </div>
                                        <div>
                                            <p className="text-red-300 font-medium">Task Creation Failed</p>
                                            <p className="text-red-400/80 text-sm">{getErrorMessage(createTaskError)}</p>
                                        </div>
                                    </div>
                                )}
                                {groupsError && (
                                    <div
                                        className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-yellow-400"/>
                                        </div>
                                        <div>
                                            <p className="text-yellow-300 font-medium">Groups Loading Error</p>
                                            <p className="text-yellow-400/80 text-sm">{getErrorMessage(groupsError)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleCreateTask} className="space-y-8">
                            {/* Task Title */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-400"/>
                                    <label className="block text-lg font-semibold text-slate-200">Task Title</label>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-lg backdrop-blur-sm"
                                    placeholder="Enter a compelling task title..."
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-400"/>
                                    <label className="block text-lg font-semibold text-slate-200">Description</label>
                                </div>
                                <textarea
                                    rows={5}
                                    required
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-y backdrop-blur-sm"
                                    placeholder="Provide detailed task requirements and instructions..."
                                />
                            </div>

                            {/* GitHub Link */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Github className="w-5 h-5 text-slate-400"/>
                                    <label className="block text-lg font-semibold text-slate-200">
                                        GitHub Repository
                                        <span className="text-sm font-normal text-slate-400 ml-2">(Optional)</span>
                                    </label>
                                </div>
                                <input
                                    type="url"
                                    value={taskForm.githubLink}
                                    onChange={(e) => setTaskForm({...taskForm, githubLink: e.target.value})}
                                    className={`w-full px-5 py-4 bg-slate-800/50 border rounded-2xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                                        taskForm.githubLink && !isValidGitHubUrl(taskForm.githubLink)
                                            ? 'border-red-500/50 focus:ring-red-500'
                                            : 'border-slate-700/50 focus:ring-indigo-500'
                                    }`}
                                    placeholder="https://github.com/username/repository"
                                />
                                {taskForm.githubLink && !isValidGitHubUrl(taskForm.githubLink) && (
                                    <p className="text-red-400 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4"/>
                                        Please enter a valid GitHub URL
                                    </p>
                                )}
                                <p className="text-sm text-slate-500">Link to the GitHub repository for this task</p>
                            </div>

                            {/* Deadline and Points Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-emerald-400"/>
                                        <label className="block text-lg font-semibold text-slate-200">Deadline</label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            required
                                            min={getCurrentDateTime()}
                                            value={taskForm.deadline}
                                            onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                                            className="w-full px-5 py-4 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Calendar
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400 pointer-events-none"/>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-400"/>
                                        <label className="block text-lg font-semibold text-slate-200">Max Points</label>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={parseInt(taskForm.maxPoints) || ''}
                                        onChange={(e) => setTaskForm({...taskForm, maxPoints: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                    />
                                </div>
                            </div>

                            {/* Assigned Groups */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400"/>
                                    <label className="block text-lg font-semibold text-slate-200">Assigned
                                        Groups</label>
                                </div>
                                {groupsLoading ? (
                                    <div
                                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-500 flex items-center gap-3 backdrop-blur-sm">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-400"/>
                                        <span>Loading groups...</span>
                                    </div>
                                ) : (
                                    <select
                                        multiple
                                        required
                                        value={taskForm.assignedGroups}
                                        onChange={(e) =>
                                            setTaskForm({
                                                ...taskForm,
                                                assignedGroups: Array.from(e.target.selectedOptions, (option) => option.value),
                                            })
                                        }
                                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm min-h-[120px]"
                                    >
                                        {groupsData?.map((group: any) => (
                                            <option key={group._id} value={group._id} className="bg-slate-800 py-2">
                                                {group.group}
                                            </option>
                                        )) || (
                                            <option disabled className="bg-slate-800">No groups available</option>
                                        )}
                                    </select>
                                )}
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4"/>
                                    Hold Ctrl/Cmd to select multiple groups
                                </p>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-purple-400"/>
                                    <label className="block text-lg font-semibold text-slate-200">Attachments</label>
                                </div>
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 backdrop-blur-sm ${
                                        dragOver
                                            ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                                            : 'border-slate-600/50 hover:border-purple-500/50 hover:bg-slate-800/30'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div
                                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                        <Upload
                                            className="w-8 h-8 text-purple-400 transition-transform duration-200 group-hover:scale-110"/>
                                    </div>
                                    <p className="text-slate-200 mb-2 text-lg font-medium">
                                        Drop files here or{' '}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-purple-400 hover:text-purple-300 transition-colors underline"
                                        >
                                            browse
                                        </button>
                                    </p>
                                    <p className="text-sm text-slate-500">Supports images, PDFs, and documents (max 10MB
                                        each)</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/gif,application/pdf,.doc,.docx,.txt"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {/* Selected Files */}
                                {selectedFiles.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-400"/>
                                            Selected Files ({selectedFiles.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index}
                                                     className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm group hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div
                                                            className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-5 h-5 text-indigo-400"/>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-slate-200 font-medium truncate">{file.name}</p>
                                                            <p className="text-slate-500 text-sm">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
                                                    >
                                                        <X className="w-4 h-4 text-red-400"/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* GitHub Link Preview */}
                                {taskForm.githubLink && isValidGitHubUrl(taskForm.githubLink) && (
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                            <Github className="w-5 h-5 text-slate-400"/>
                                            GitHub Repository
                                        </h4>
                                        <div
                                            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div
                                                    className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                                                    <Github className="w-5 h-5 text-slate-400"/>
                                                </div>
                                                <span className="text-slate-200 truncate font-mono text-sm">
                                                    {taskForm.githubLink}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setTaskForm({...taskForm, githubLink: ''})}
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4 text-red-400"/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Allow Late Submission */}
                            <div
                                className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <input
                                    type="checkbox"
                                    id="allowLate"
                                    checked={taskForm.allowLateSubmission}
                                    onChange={(e) => setTaskForm({...taskForm, allowLateSubmission: e.target.checked})}
                                    className="w-5 h-5 text-indigo-500 bg-slate-800/50 border-slate-600/50 rounded-lg focus:ring-indigo-500 focus:ring-2 transition-colors"
                                />
                                <label htmlFor="allowLate"
                                       className="text-slate-200 font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400"/>
                                    Allow late submissions
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div
                                className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-slate-700/50">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={createTaskLoading}
                                    className="px-8 py-4 text-slate-300 bg-slate-800/50 rounded-2xl hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 font-medium backdrop-blur-sm border border-slate-700/50"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={createTaskLoading}
                                    type="submit"
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 min-w-[140px]"
                                >
                                    {createTaskLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin"/>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5"/>
                                            Create Task
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;