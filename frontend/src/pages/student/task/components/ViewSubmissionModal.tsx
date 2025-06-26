import {useEffect} from 'react';
import {X, Loader2, AlertCircle, FileText, Image, Link, Download} from 'lucide-react';
import {useGetSubmissionByIdQuery} from '../../../../services/submissionsApi';
import type {Attachment} from '../../../../services/taskApi'; // Import Attachment type from taskApi

interface ViewSubmissionModalProps {
    showViewSubmissionModal: boolean;
    setShowViewSubmissionModal: (show: boolean) => void;
    submissionId: string;
}

const ViewSubmissionModal = ({
                                 showViewSubmissionModal,
                                 setShowViewSubmissionModal,
                                 submissionId,
                             }: ViewSubmissionModalProps) => {

    // Use the real API hook instead of the mock one
    const {data: submissionResponse, isLoading, error} = useGetSubmissionByIdQuery(submissionId, {
        skip: !submissionId || !showViewSubmissionModal
    });

    // Extract submission from the response
    const submission = submissionResponse?.submission;

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showViewSubmissionModal) {
                setShowViewSubmissionModal(false);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [showViewSubmissionModal, setShowViewSubmissionModal]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getAttachmentIcon = (type: string) => {
        switch (type) {
            case 'image':
                return <Image className="w-5 h-5 text-blue-400 mr-2"/>;
            case 'link':
                return <Link className="w-5 h-5 text-green-400 mr-2"/>;
            case 'text':
                return <FileText className="w-5 h-5 text-purple-400 mr-2"/>;
            default:
                return <FileText className="w-5 h-5 text-gray-400 mr-2"/>;
        }
    };

    const isDownloadableAttachment = (attachment: Attachment) => {
        // Check if it's a downloadable type and has a valid URL
        // Only 'image' type can be downloaded since 'file' is not in the Attachment type
        return attachment.type === 'image' &&
            attachment.content &&
            true &&
            attachment.content.startsWith('http');
    };

    // Helper function to format error messages
    const formatErrorMessage = (error: any) => {
        // Handle general API errors
        if (error?.data?.message) {
            return error.data.message;
        }

        // Handle network errors
        if (error?.message) {
            return error.message;
        }

        // Fallback error message
        return 'Failed to load submission';
    };

    if (!showViewSubmissionModal) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div
                    className="fixed inset-0 transition-opacity duration-300"
                    onClick={() => setShowViewSubmissionModal(false)}
                />
                <div
                    className="relative w-full max-w-3xl p-8 my-8 overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                View Submission
                            </h3>
                            <button
                                onClick={() => setShowViewSubmissionModal(false)}
                                className="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
                            >
                                <X className="w-6 h-6 text-gray-400 hover:text-white"/>
                            </button>
                        </div>

                        {isLoading && (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
                                <span className="ml-3 text-gray-300">Loading submission...</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"/>
                                    <div className="flex-1">
                                        <span className="text-red-300 text-sm font-medium block mb-1">
                                            Error loading submission
                                        </span>
                                        <span className="text-red-300/80 text-sm">
                                            {formatErrorMessage(error)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoading && !error && submission && (
                            <div className="space-y-6 text-gray-300">
                                {/* Submission ID */}
                                <div className="p-4 bg-gray-800/50 rounded-xl">
                                    <p className="text-sm text-gray-400 mb-1">Submission ID:</p>
                                    <p className="font-mono text-sm text-gray-300">{submission._id}</p>
                                </div>

                                {/* Submitted At */}
                                <div className="p-4 bg-gray-800/50 rounded-xl">
                                    <p className="text-sm text-gray-400 mb-1">Submitted At:</p>
                                    <p className="font-semibold text-lg">{formatDate(submission.submittedAt)}</p>
                                    {submission.isLate && (
                                        <span
                                            className="inline-block mt-2 px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-full">
                                            Late Submission
                                        </span>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="p-4 bg-gray-800/50 rounded-xl">
                                    <p className="text-sm text-gray-400 mb-1">Status:</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        submission.status === 'submitted' ? 'bg-blue-900/30 text-blue-300' :
                                            submission.status === 'graded' ? 'bg-green-900/30 text-green-300' :
                                                submission.status === 'returned' ? 'bg-yellow-900/30 text-yellow-300' :
                                                    'bg-gray-700/50 text-gray-300'
                                    }`}>
                                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                    </span>
                                </div>

                                {/* Comments */}
                                {submission.comments && (
                                    <div className="p-4 bg-gray-800/50 rounded-xl">
                                        <p className="text-sm text-gray-400 mb-1">Comments:</p>
                                        <p className="whitespace-pre-wrap">{submission.comments}</p>
                                    </div>
                                )}

                                {/* Points/Grade */}
                                {submission.points !== undefined && (
                                    <div className="p-4 bg-gray-800/50 rounded-xl">
                                        <p className="text-sm text-gray-400 mb-1">Points:</p>
                                        <p className="font-semibold text-xl text-emerald-400">{submission.points}</p>
                                    </div>
                                )}

                                {/* Attachments */}
                                {submission.attachments && submission.attachments.length > 0 && (
                                    <div className="p-4 bg-gray-800/50 rounded-xl">
                                        <p className="text-sm font-medium text-gray-400 mb-3">
                                            Attachments ({submission.attachments.length}):
                                        </p>
                                        <div className="space-y-2">
                                            {submission.attachments.map((attachment, index) => (
                                                <div key={index}
                                                     className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                                                    {getAttachmentIcon(attachment.type)}
                                                    {attachment.type === 'link' ? (
                                                        <a
                                                            href={attachment.content}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:underline flex-grow truncate"
                                                        >
                                                            {attachment.originalName || attachment.content}
                                                        </a>
                                                    ) : (
                                                        <span className="flex-grow truncate">
                                                            {attachment.originalName || attachment.filename || 'Attachment'}
                                                        </span>
                                                    )}
                                                    {/* For downloadable files/images (assuming content is a URL) */}
                                                    {isDownloadableAttachment(attachment) && (
                                                        <a
                                                            href={attachment.content}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="ml-4 p-1 hover:bg-gray-600 rounded-full transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download
                                                                className="w-4 h-4 text-gray-400 hover:text-white"/>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Feedback */}
                                {submission.feedback && (
                                    <div className="p-4 bg-gray-800/50 rounded-xl">
                                        <p className="text-sm text-gray-400 mb-1">Feedback:</p>
                                        <p className="whitespace-pre-wrap">{submission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isLoading && !error && !submission && (
                            <div className="text-center py-8">
                                <p className="text-gray-400">No submission details found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewSubmissionModal;