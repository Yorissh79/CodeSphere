import React, {useState, useEffect, useRef, useCallback} from 'react';
import {z} from 'zod';
import {toast} from 'react-hot-toast';
import {useUpdateTaskMutation, type Task, type UpdateTaskInput} from '../../../../services/taskApi'; // Corrected path
import {useGetAllGroupsQuery} from '../../../../services/groupApi'; // Corrected path
import {Loader2, X, AlertCircle, Upload} from 'lucide-react';
import type {FetchBaseQueryError} from "@reduxjs/toolkit/query"; // Import Upload icon
import type {SerializedError} from '@reduxjs/toolkit';

// Props interface for the EditTaskModal component
interface EditTaskModalProps {
    showEditModal: boolean; // Controls the visibility of the modal
    setShowEditModal: (show: boolean) => void; // Function to update modal visibility
    taskToEdit: Task; // The task object currently being edited
    refetchTasks: () => void; // Function to refetch tasks in the parent component (optional, RTK Query's invalidation usually handles this)
}

// Zod schema for client-side form validation for updating a task.
// All fields are optional because the update operation can be partial.
const formUpdateTaskSchema = z.object({
    _id: z.string(), // Task ID is mandatory for update
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    // assignedGroups must have at least one if provided
    assignedGroups: z.array(z.string()).min(1, 'At least one group must be assigned').optional(),
    deadline: z.string().datetime('Invalid datetime format').optional(), // Validate as datetime string
    allowLateSubmission: z.boolean().optional(),
    // Max points must be a non-negative number
    maxPoints: z.number().min(0, 'Points must be a non-negative number').optional(),
    // Attachments are optional and match the structure defined in taskApi.ts
    attachments: z
        .array(
            z.object({
                type: z.enum(['text', 'image', 'link', 'file']),
                content: z.string(),
                filename: z.string().optional(),
                originalName: z.string().optional(),
            })
        )
        .optional(),
});


const EditTaskModal = ({
                           showEditModal,
                           setShowEditModal,
                           taskToEdit,
                           refetchTasks, // Keeping it here, though often not needed with RTK Query's invalidation
                       }: EditTaskModalProps) => {
    // State to manage form data, initialized with the taskToEdit's values
    const [formData, setFormData] = useState<UpdateTaskInput>({
        _id: taskToEdit._id,
        title: taskToEdit.title,
        description: taskToEdit.description,
        assignedGroups: taskToEdit.assignedGroups,
        // Format deadline to 'YYYY-MM-DDTHH:MM' for datetime-local input
        deadline: taskToEdit.deadline ? taskToEdit.deadline.slice(0, 16) : '',
        allowLateSubmission: taskToEdit.allowLateSubmission,
        // Keep maxPoints as number (matching the fixed Task interface)
        maxPoints: taskToEdit.maxPoints,
        attachments: taskToEdit.attachments, // Include existing attachments
    });

    // State for managing new files to upload
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    // State for drag and drop UI feedback
    const [dragOver, setDragOver] = useState(false);
    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State to store validation errors from Zod
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

    // RTK Query mutation hook for updating a task
    const [updateTask, {isLoading, isSuccess, isError, error}] = useUpdateTaskMutation();

    // Fetch all groups to populate the assigned groups dropdown
    const {data: groupsData, isLoading: groupsLoading, error: groupsError} = useGetAllGroupsQuery({});


    // Effect to update form data and selected files when a different task is selected for editing
    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                _id: taskToEdit._id,
                title: taskToEdit.title,
                description: taskToEdit.description,
                assignedGroups: taskToEdit.assignedGroups,
                deadline: taskToEdit.deadline ? taskToEdit.deadline.slice(0, 16) : '',
                allowLateSubmission: taskToEdit.allowLateSubmission,
                maxPoints: taskToEdit.maxPoints, // Now using number directly
                // Note: We don't populate `attachments` directly from `taskToEdit.attachments`
                // because new uploads are managed separately in `selectedFiles`.
                // Existing attachments are kept in `formData.attachments` and new ones will be merged.
                attachments: taskToEdit.attachments,
            });
            setSelectedFiles([]); // Clear new files when a new task is loaded
            setFormErrors([]); // Clear any previous errors when taskToEdit changes
        }
    }, [taskToEdit]);

    // Effect to handle mutation results (success/error)
    useEffect(() => {
        if (isSuccess) {
            toast.success('Task updated successfully!');
            setShowEditModal(false); // Close modal on success
            setSelectedFiles([]); // Clear selected files on success
            // If refetchTasks is critical for other parts of the UI not covered by RTK Query's cache invalidation, uncomment below
            refetchTasks();
        }
        if (isError) {
            // Display error message from the backend or a generic one
            toast.error(`Failed to update task: ${(error as any)?.data?.error || (error as any)?.message || 'Unknown error'}`);
            console.error('Update task error:', error);
        }
    }, [isSuccess, isError, error, setShowEditModal, refetchTasks]); // Dependencies for this effect

    // Generic handler for input field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                name === 'maxPoints' ? Number(value) || 0 : // Convert maxPoints to number
                    value,
        }));
    };

    // Handler for multi-select dropdown for assigned groups
    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({...prev, assignedGroups: selectedOptions}));
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
                console.warn('Some files were ignored as they exceed 10MB.');
            }
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    // Function to remove newly selected files
    const removeNewFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Function to remove existing attachments
    const removeExistingAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments?.filter((_, i) => i !== index)
        }));
    };

    // Handler for form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors([]); // Clear previous errors on new submission attempt

        try {
            // Convert newly selected files to attachments
            const newAttachments = await convertFilesToAttachments(selectedFiles);

            // Merge existing attachments with new ones
            const allAttachments = [...(formData.attachments || []), ...newAttachments];

            // Create the task data object that matches UpdateTaskInput interface
            const taskData: UpdateTaskInput = {
                ...formData,
                attachments: allAttachments.length > 0 ? allAttachments : undefined, // Only include if there are attachments
            };

            // Client-side validation using Zod
            const validatedData: any = formUpdateTaskSchema.parse(taskData); // Validate the combined data
            // Trigger the RTK Query mutation
            await updateTask(validatedData).unwrap(); // .unwrap() throws an error if the mutation fails
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                // If Zod validation fails, update formErrors state
                setFormErrors(err.errors);
            } else {
                // Log other types of errors (e.g., network errors, backend errors caught by RTK Query)
                console.error('Form submission error:', err);
            }
        }
    };

    const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
        if (!error) return 'Failed to update task. Please try again.';
        if ('data' in error && error.data && typeof error.data === 'object' && 'error' in error.data) {
            return (error.data as { error: string }).error;
        }
        if ('message' in error && error.message) {
            return error.message;
        }
        return 'Failed to update task. Please try again.';
    };

    // If modal is not supposed to be shown, return null to render nothing
    if (!showEditModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div
                    className="fixed inset-0 transition-opacity duration-300"
                    onClick={() => setShowEditModal(false)}
                />
                <div
                    className="relative w-full max-w-3xl p-8 my-8 overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Edit Task
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
                            >
                                <X className="w-6 h-6 text-gray-400 hover:text-white"/>
                            </button>
                        </div>

                        {isError && (
                            <div
                                className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400"/>
                                <span className="text-red-300 text-sm">{getErrorMessage(error)}</span>
                            </div>
                        )}

                        {groupsError && (
                            <div
                                className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400"/>
                                <span className="text-red-300 text-sm">{getErrorMessage(groupsError)}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Input */}
                            <div>
                                <label htmlFor="title"
                                       className="block text-sm font-medium text-gray-300 mb-2">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={formData.title || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter task title..."
                                />
                                {formErrors.find(err => err.path[0] === 'title') && (
                                    <p className="text-rose-500 text-xs mt-1">
                                        {formErrors.find(err => err.path[0] === 'title')?.message}
                                    </p>
                                )}
                            </div>

                            {/* Description Textarea */}
                            <div>
                                <label htmlFor="description"
                                       className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows={4}
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
                                    placeholder="Describe the task requirements..."
                                ></textarea>
                                {formErrors.find(err => err.path[0] === 'description') && (
                                    <p className="text-rose-500 text-xs mt-1">
                                        {formErrors.find(err => err.path[0] === 'description')?.message}
                                    </p>
                                )}
                            </div>

                            {/* Assigned Groups Select */}
                            <div>
                                <label htmlFor="assignedGroups"
                                       className="block text-sm font-medium text-gray-300 mb-2">
                                    Assigned Groups
                                </label>
                                {groupsLoading ? (
                                    <div
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-500 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                        Loading groups...
                                    </div>
                                ) : (
                                    <select
                                        name="assignedGroups"
                                        id="assignedGroups"
                                        multiple
                                        value={formData.assignedGroups || []}
                                        onChange={handleGroupChange}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                                    >
                                        {groupsData?.map((group: { _id: string; group: string }) => (
                                            <option key={group._id} value={group._id} className="bg-gray-800">
                                                {group.group}
                                            </option>
                                        )) || (
                                            <option disabled className="bg-gray-800">No groups available</option>
                                        )}
                                    </select>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple groups</p>

                                {formErrors.find(err => err.path[0] === 'assignedGroups') && (
                                    <p className="text-rose-500 text-xs mt-1">
                                        {formErrors.find(err => err.path[0] === 'assignedGroups')?.message}
                                    </p>
                                )}
                            </div>

                            {/* Deadline Input */}
                            <div>
                                <label htmlFor="deadline"
                                       className="block text-sm font-medium text-gray-300 mb-2">
                                    Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    name="deadline"
                                    id="deadline"
                                    value={formData.deadline || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                {formErrors.find(err => err.path[0] === 'deadline') && (
                                    <p className="text-rose-500 text-xs mt-1">
                                        {formErrors.find(err => err.path[0] === 'deadline')?.message}
                                    </p>
                                )}
                            </div>

                            {/* Max Points Input */}
                            <div>
                                <label htmlFor="maxPoints"
                                       className="block text-sm font-medium text-gray-300 mb-2">
                                    Max Points
                                </label>
                                <input
                                    type="number" // Use type="number" for numeric input
                                    name="maxPoints"
                                    id="maxPoints"
                                    value={formData.maxPoints || 0} // Now using number
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="e.g., 100"
                                    min="0"
                                />
                                {formErrors.find(err => err.path[0] === 'maxPoints') && (
                                    <p className="text-rose-500 text-xs mt-1">
                                        {formErrors.find(err => err.path[0] === 'maxPoints')?.message}
                                    </p>
                                )}
                            </div>

                            {/* Attachments Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Attachments</label>
                                {/* Existing Attachments */}
                                {formData.attachments && formData.attachments.length > 0 && (
                                    <div className="mt-4 space-y-2 mb-4">
                                        <h4 className="text-sm font-medium text-gray-300">Existing Files:</h4>
                                        {formData.attachments.map((attachment, index) => (
                                            <div key={`existing-${index}`}
                                                 className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                                <span
                                                    className="text-sm text-gray-300 truncate max-w-[80%]">{attachment.originalName || attachment.filename || 'Unknown File'}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingAttachment(index)}
                                                    className="p-1 hover:bg-red-900/30 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-red-400"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New File Upload Area */}
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
                                        Drag new files here or{' '}
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

                                {/* Newly Selected Files for Upload */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-medium text-gray-300">New Files to Upload:</h4>
                                        {selectedFiles.map((file, index) => (
                                            <div key={`new-${index}`}
                                                 className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                                <span
                                                    className="text-sm text-gray-300 truncate max-w-[80%]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(index)}
                                                    className="p-1 hover:bg-red-900/30 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-red-400"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Allow Late Submission Checkbox */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="allowLateSubmission"
                                    id="allowLateSubmission"
                                    checked={formData.allowLateSubmission || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-500 bg-gray-800/50 border-gray-700/50 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor="allowLateSubmission"
                                       className="text-sm text-gray-300">
                                    Allow late submissions
                                </label>
                            </div>
                        </form>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                disabled={isLoading}
                                className="px-6 py-3 text-gray-300 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading} // Disable button while loading
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                                {isLoading ? 'Updating...' : 'Update Task'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;