import React from 'react';
import {X, Calendar, FileText, Link, Image, Download, ExternalLink} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';

interface TaskAttachment {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
}

interface TaskLink {
    _id: string;
    title: string;
    url: string;
    description?: string;
}

interface StudentTask {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    maxPoints: string;
    assignedGroups: string[];
    attachments?: TaskAttachment[];
    links?: TaskLink[];
    additionalInstructions?: string;
    submissionStatus?: 'submitted' | 'not_submitted' | 'late_submitted';
    submissionId?: string;
}

interface ViewTaskDetailsModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    task: StudentTask | null;
}

const ViewTaskDetailsModal = ({showModal, setShowModal, task}: ViewTaskDetailsModalProps) => {
    if (!task) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isImageFile = (fileName: string) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return <Image className="w-4 h-4"/>;
        return <FileText className="w-4 h-4"/>;
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{scale: 0.95, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        exit={{scale: 0.95, opacity: 0}}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div
                            className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Task Details
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    View complete task information
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500 dark:text-gray-400"/>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Task Basic Info */}
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    {task.title}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Calendar className="w-5 h-5 mr-2"/>
                                        <span className="font-medium">Deadline:</span>
                                        <span className="ml-2">{formatDate(task.deadline)}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <FileText className="w-5 h-5 mr-2"/>
                                        <span className="font-medium">Max Points:</span>
                                        <span className="ml-2">{task.maxPoints}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Description
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {task.description}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Instructions */}
                            {task.additionalInstructions && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Additional Instructions
                                    </h4>
                                    <div
                                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {task.additionalInstructions}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {task.attachments && task.attachments.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Attachments
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {task.attachments.map((attachment) => (
                                            <div
                                                key={attachment._id}
                                                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center flex-1 min-w-0">
                                                        {getFileIcon(attachment.fileType)}
                                                        <div className="ml-3 flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                {attachment.fileName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDate(attachment.uploadedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* FIX: Conditionally render the link to prevent dead links if fileUrl is missing */}
                                                    {attachment.fileUrl && (
                                                        <a
                                                            href={attachment.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                            title="Download attachment"
                                                        >
                                                            <Download className="w-4 h-4"/>
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Preview for images */}
                                                {isImageFile(attachment.fileName) && attachment.fileUrl && (
                                                    <div className="mt-3">
                                                        <img
                                                            src={attachment.fileUrl}
                                                            alt={attachment.fileName}
                                                            className="max-w-full h-auto max-h-48 rounded-lg border border-gray-200 dark:border-gray-600"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Links */}
                            {task.links && task.links.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Related Links
                                    </h4>
                                    <div className="space-y-3">
                                        {task.links.map((link) => (
                                            <div
                                                key={link._id}
                                                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center">
                                                            <Link
                                                                className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400"/>
                                                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                {link.title}
                                                            </h5>
                                                        </div>
                                                        {link.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {link.description}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
                                                            {link.url}
                                                        </p>
                                                    </div>
                                                    {link.url && (
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                            title="Open link"
                                                        >
                                                            <ExternalLink className="w-4 h-4"/>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ViewTaskDetailsModal;