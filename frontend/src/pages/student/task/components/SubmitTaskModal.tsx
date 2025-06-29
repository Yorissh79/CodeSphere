import React, {useState, useRef, useCallback, useEffect} from 'react';
import {X, Upload, Loader2, AlertCircle, FileText, Image, Calendar, Clock, GitBranch, Link} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {z} from 'zod';
import type {Attachment} from '../../../../services/taskApi';
import {useCreateSubmissionMutation} from "../../../../services/submissionsApi.ts";
import type {StudentTask} from "../components/StudentMainContent";

interface SubmitTaskModalProps {
    showSubmitModal: boolean;
    setShowSubmitModal: (show: boolean) => void;
    task: Pick<StudentTask, '_id' | 'title' | 'deadline' | 'allowLateSubmission'>;
    refetchTasks: () => void;
}

// Zod schema for submission validation
const submitFormSchema = z.object({
    taskId: z.string(),
    comments: z.string().max(1000, 'Comments cannot exceed 1000 characters').optional(),
    attachments: z.array(z.object({
        type: z.enum(['text', 'image', 'link']),
        content: z.string(),
        filename: z.string().optional(),
        originalName: z.string().optional(),
    })).optional(),
});

const SubmitTaskModal = ({
                             showSubmitModal,
                             setShowSubmitModal,
                             task,
                             refetchTasks,
                         }: SubmitTaskModalProps) => {
    const [comments, setComments] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [githubLink, setGithubLink] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [createSubmission, {isLoading: isSubmitting}] = useCreateSubmissionMutation();
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

    // Reset form when modal opens/closes or task changes
    useEffect(() => {
        if (!showSubmitModal || !task) {
            setComments('');
            setGithubLink('');
            setSelectedFiles([]);
            setFormErrors([]);
        }
    }, [showSubmitModal, task]);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showSubmitModal) {
                setShowSubmitModal(false);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [showSubmitModal, setShowSubmitModal]);

    const convertFilesToAttachments = async (files: File[]): Promise<Attachment[]> => {
        const attachments: Attachment[] = [];
        for (const file of files) {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const attachmentType: 'image' | 'text' = file.type.startsWith('image/') ? 'image' : 'text';

            attachments.push({
                type: attachmentType,
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
            toast.error('Some files were ignored as they exceed 10MB.');
        }
        setSelectedFiles((prev) => [...prev, ...validFiles]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const maxFileSize = 10 * 1024 * 1024; // 10MB
            const validFiles = files.filter((file) => file.size <= maxFileSize);
            if (validFiles.length < files.length) {
                toast.error('Some files were ignored as they exceed 10MB.');
            }
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!task) {
            toast.error('No task selected');
            return;
        }

        setFormErrors([]);

        try {
            const attachments = await convertFilesToAttachments(selectedFiles);

            // Add GitHub link as attachment if provided
            if (githubLink.trim()) {
                attachments.push({
                    type: 'link',
                    content: githubLink.trim(),
                    originalName: 'GitHub Repository',
                });
            }

            const submissionData = {
                taskId: task._id,
                comments,
                attachments: attachments.length > 0 ? attachments : undefined,
            };

            const validatedData = submitFormSchema.parse(submissionData);

            await createSubmission(validatedData).unwrap();

            // Success handling
            toast.success('Submission successful!');
            setShowSubmitModal(false);

            // Refetch tasks after successful submission
            setTimeout(() => {
                refetchTasks();
            }, 500);

        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setFormErrors(err.errors);
                toast.error('Validation failed. Please check your inputs.');
            } else {
                console.error('Submission error:', err);
                const errorMessage = err?.data?.error?.message || err?.data?.message || err?.message || 'Unknown error';
                toast.error(`Submission failed: ${errorMessage}`);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <Image className="w-5 h-5 text-blue-400 mr-2"/>;
        }
        return <FileText className="w-5 h-5 text-gray-400 mr-2"/>;
    };

    // Don't render if modal is not shown or task is null
    if (!showSubmitModal || !task) return null;

    const isLate = new Date() > new Date(task.deadline) && !task.allowLateSubmission;
    const isPastDeadline = new Date() > new Date(task.deadline);
    const submissionWarning = isLate ? "This task does not allow late submissions." :
        (isPastDeadline ? "This is a late submission." : "");

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div
                    className="fixed inset-0 transition-opacity duration-300"
                    onClick={() => !isSubmitting && setShowSubmitModal(false)}
                />
                <div
                    className="relative w-full max-w-3xl p-8 my-8 overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Submit Task
                            </h3>
                            <button
                                onClick={() => !isSubmitting && setShowSubmitModal(false)}
                                disabled={isSubmitting}
                                className="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-6 h-6 text-gray-400 hover:text-white"/>
                            </button>
                        </div>

                        {/* Task Information Section */}
                        <div className="space-y-4 mb-8 text-gray-300">
                            {/* Task Title */}
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <p className="text-sm text-gray-400 mb-1">Task:</p>
                                <p className="font-semibold text-lg">{task.title}</p>
                            </div>

                            {/* Deadline */}
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <p className="text-sm text-gray-400 mb-1 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1"/>
                                    Deadline:
                                </p>
                                <p className="font-semibold text-lg flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400"/>
                                    {formatDate(task.deadline)}
                                </p>
                                {isPastDeadline && (
                                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                                        isLate ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'
                                    }`}>
                                        {isLate ? 'Late Submission Not Allowed' : 'Past Deadline'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Form Errors */}
                        {formErrors.length > 0 && (
                            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"/>
                                    <div className="flex-1">
                                        <span className="text-red-300 text-sm font-medium block mb-1">
                                            Validation failed
                                        </span>
                                        <span className="text-red-300/80 text-sm">
                                            {formErrors.map(err => err.message).join(', ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {submissionWarning && (
                            <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"/>
                                    <div className="flex-1">
                                        <span className="text-amber-300 text-sm font-medium block mb-1">
                                            Submission Warning
                                        </span>
                                        <span className="text-amber-300/80 text-sm">{submissionWarning}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* GitHub Link Section */}
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <label htmlFor="githubLink"
                                       className="block text-sm font-medium text-gray-400 mb-3 flex items-center">
                                    <GitBranch className="w-4 h-4 mr-1"/>
                                    GitHub Repository Link
                                </label>
                                <div className="relative">
                                    <Link
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"/>
                                    <input
                                        id="githubLink"
                                        type="url"
                                        value={githubLink}
                                        onChange={(e) => setGithubLink(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                                        placeholder="https://github.com/username/repository"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Link to your GitHub repository for this assignment
                                </p>
                            </div>

                            {/* Comments Section */}
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <label htmlFor="comments"
                                       className="block text-sm font-medium text-gray-400 mb-3">
                                    Comments (Optional)
                                </label>
                                <textarea
                                    id="comments"
                                    rows={4}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y disabled:opacity-50"
                                    placeholder="Add any comments or notes about your submission..."
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Optional comments about your submission</span>
                                    <span>{comments.length}/1000</span>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <label htmlFor="attachments"
                                       className="block text-sm font-medium text-gray-400 mb-3">
                                    Attachments (Optional)
                                </label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                                        dragOver ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600/50 hover:border-blue-500/50 hover:bg-gray-700/20'
                                    } ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <Upload
                                        className="w-8 h-8 text-gray-400 mx-auto mb-4 transition-transform duration-200"/>
                                    <p className="text-gray-300 mb-2">
                                        Drag files here or{' '}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSubmitting}
                                            className="text-blue-400 hover:text-blue-300 transition-colors underline disabled:opacity-50"
                                        >
                                            browse
                                        </button>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Supports images, PDFs, and documents (max 10MB each)
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/gif,application/pdf,.doc,.docx,.txt"
                                        onChange={handleFileSelect}
                                        disabled={isSubmitting}
                                        className="hidden"
                                    />
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-400 mb-3">
                                            Selected Files ({selectedFiles.length}):
                                        </p>
                                        <div className="space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index}
                                                     className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                                                    {getFileIcon(file)}
                                                    <span className="flex-grow truncate text-gray-300">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mr-3">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        disabled={isSubmitting}
                                                        className="p-1 hover:bg-red-900/30 rounded-full transition-colors disabled:opacity-50"
                                                        title="Remove file"
                                                    >
                                                        <X className="w-4 h-4 text-red-400"/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 text-gray-300 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLate}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin"/>}
                                    {isSubmitting ? 'Submitting...' : 'Submit Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitTaskModal;