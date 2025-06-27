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

    if (!showCreateModal) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div
                    className="fixed inset-0 transition-opacity duration-300"
                    onClick={() => setShowCreateModal(false)}
                />
                <div
                    className="relative w-full max-w-3xl p-8 my-8 overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Create New Task
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
                                title="Close (ESC)"
                            >
                                <X className="w-6 h-6 text-gray-400 hover:text-white"/>
                            </button>
                        </div>

                        {createTaskError && (
                            <div
                                className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400"/>
                                <span className="text-red-300 text-sm">{getErrorMessage(createTaskError)}</span>
                            </div>
                        )}

                        {groupsError && (
                            <div
                                className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400"/>
                                <span className="text-red-300 text-sm">{getErrorMessage(groupsError)}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter task title..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
                                    placeholder="Describe the task requirements..."
                                />
                            </div>

                            {/* Add GitHub Link Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Github className="w-4 h-4 inline mr-2"/>
                                    GitHub Repository Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={taskForm.githubLink}
                                    onChange={(e) => setTaskForm({...taskForm, githubLink: e.target.value})}
                                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                        taskForm.githubLink && !isValidGitHubUrl(taskForm.githubLink)
                                            ? 'border-red-500/50 focus:ring-red-500'
                                            : 'border-gray-700/50 focus:ring-blue-500'
                                    }`}
                                    placeholder="https://github.com/username/repository"
                                />
                                {taskForm.githubLink && !isValidGitHubUrl(taskForm.githubLink) && (
                                    <p className="text-red-400 text-xs mt-1">Please enter a valid GitHub URL</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Link to the GitHub repository for this
                                    task</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={getCurrentDateTime()}
                                        value={taskForm.deadline}
                                        onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Points</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={parseInt(taskForm.maxPoints) || ''}
                                        onChange={(e) => setTaskForm({...taskForm, maxPoints: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Assigned Groups</label>
                                {groupsLoading ? (
                                    <div
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-500 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                        Loading groups...
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
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        {groupsData?.map((group: any) => (
                                            <option key={group._id} value={group._id} className="bg-gray-800">
                                                {group.group}
                                            </option>
                                        )) || (
                                            <option disabled className="bg-gray-800">No groups available</option>
                                        )}
                                    </select>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple groups</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Attachments</label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                                        dragOver ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700/50 hover:border-blue-500/50 hover:bg-gray-800/20'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <Upload
                                        className="w-8 h-8 text-gray-400 mx-auto mb-4 transition-transform duration-200 group-hover:scale-110"/>
                                    <p className="text-gray-300 mb-2">
                                        Drag files here or{' '}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            browse
                                        </button>
                                    </p>
                                    <p className="text-xs text-gray-500">Supports images, PDFs, and documents (max 10MB
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

                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-medium text-gray-300">Selected Files:</h4>
                                        {selectedFiles.map((file, index) => (
                                            <div key={index}
                                                 className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                                <span
                                                    className="text-sm text-gray-300 truncate max-w-[80%]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 hover:bg-red-900/30 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-red-400"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Show GitHub link preview if provided */}
                                {taskForm.githubLink && isValidGitHubUrl(taskForm.githubLink) && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">GitHub Repository:</h4>
                                        <div
                                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Github className="w-4 h-4 text-gray-400"/>
                                                <span className="text-sm text-gray-300 truncate max-w-[80%]">
                                                    {taskForm.githubLink}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setTaskForm({...taskForm, githubLink: ''})}
                                                className="p-1 hover:bg-red-900/30 rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4 text-red-400"/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allowLate"
                                    checked={taskForm.allowLateSubmission}
                                    onChange={(e) => setTaskForm({...taskForm, allowLateSubmission: e.target.checked})}
                                    className="w-4 h-4 text-blue-500 bg-gray-800/50 border-gray-700/50 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor="allowLate" className="text-sm text-gray-300">Allow late
                                    submissions</label>
                            </div>

                            <div className="flex justify-end gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={createTaskLoading}
                                    className="px-6 py-3 text-gray-300 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={createTaskLoading ? true : undefined}
                                    type="submit"
                                >
                                    {createTaskLoading && <Loader2/>}
                                    {createTaskLoading ? 'Creating...' : 'Create Task'}
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