import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {
    X,
    Eye,
    ExternalLink,
    FileText,
    Image,
    Link as LinkIcon,
    Calendar,
    User,
    Award,
    MessageSquare,
    Loader2,
    AlertCircle,
    Search,
} from 'lucide-react';
import {useGetSubmissionsQuery} from '../../../../services/submissionsApi';
import {useGetAllGroupsQuery} from '../../../../services/groupApi';
import debounce from 'lodash/debounce';

// Define interfaces for TypeScript
interface Student {
    _id: string;
    name: string;
    surname?: string;
    email?: string;
    groupIds?: string[];
}

interface Attachment {
    type: string;
    content: string;
    filename?: string;
    originalName?: string;
}

interface Submission {
    _id: string;
    studentId: string | Student;
    submittedAt: string;
    status: 'submitted' | 'graded' | 'returned';
    isLate: boolean;
    comments?: string;
    points?: number;
    feedback?: string;
    attachments?: Attachment[];
    githubUrl?: string;
}

interface Task {
    _id: string;
    title: string;
    maxPoints: number;
}

interface Group {
    _id: string;
    name: string;
}

interface ViewSubmissionsModalProps {
    task: Task;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

// Utility to map submission status to Tailwind classes
const getStatusColor = (status: Submission['status']): string => {
    switch (status) {
        case 'submitted':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'graded':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'returned':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

// Common Tailwind classes
const cardClasses = 'p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm flex items-start';
const iconClasses = 'w-5 h-5 mr-3 mt-1 flex-shrink-0';
const textClasses = 'font-medium text-gray-800 dark:text-gray-200 block mb-1';
const linkClasses = 'text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center break-all';

const ViewSubmissionsModal: React.FC<ViewSubmissionsModalProps> = ({task, showModal, setShowModal}) => {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    // Fetch submissions
    const {
        data: submissionsData,
        isLoading,
        error,
    } = useGetSubmissionsQuery({taskId: task._id}, {skip: !showModal});
    const submissions = submissionsData?.submissions || [];

    // Fetch groups
    const {data: groupsData, isLoading: isGroupsLoading} = useGetAllGroupsQuery({});
    const groupMap = useMemo(() => {
        const map = new Map<string, Group>();
        groupsData?.forEach((group: Group) => map.set(group._id, group));
        return map;
    }, [groupsData]);

    // Debounced search handler
    const debouncedSetSearchTerm = useCallback(
        debounce((value: string) => setSearchTerm(value), 300),
        []
    );

    // Type guard to check if studentId is a Student object
    const isStudentObject = (studentId: Submission['studentId']): studentId is Student => {
        return typeof studentId === 'object' && studentId !== null && 'name' in studentId;
    };

    // Get student display name
    const getStudentName = (studentId: Submission['studentId']): string => {
        if (isStudentObject(studentId)) {
            const surname = studentId.surname ? ` ${studentId.surname}` : '';
            return `${studentId.name}${surname}`;
        }
        return `Student ${studentId}`;
    };

    // Filter submissions
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((submission) => {
            const studentName = getStudentName(submission.studentId);
            return studentName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [submissions, searchTerm]);

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const closeModal = useCallback(() => {
        setShowModal(false);
        setSelectedSubmission(null);
        setSearchTerm('');
    }, [setShowModal]);

    // Accessibility: Focus trap and ESC handling
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeModal();
            }
            if (event.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        };

        if (showModal) {
            document.addEventListener('keydown', handleKeyDown);
            modalRef.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showModal, closeModal]);

    // Render attachment
    const renderAttachment = (attachment: Attachment, index: number) => {
        const safeContent = attachment.content || '';

        switch (attachment.type) {
            case 'text':
                return (
                    <div key={index} className={cardClasses}>
                        <FileText className={`${iconClasses} text-blue-500`}/>
                        <div className="flex-grow">
                            <span className={textClasses}>Text Submission</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap line-clamp-3">
                                {safeContent}
                            </p>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div key={index} className={cardClasses}>
                        <Image className={`${iconClasses} text-green-500`}/>
                        <div className="flex-grow">
              <span className={textClasses}>
                Image: {attachment.originalName || attachment.filename || 'Untitled Image'}
              </span>
                            {safeContent ? (
                                <a href={safeContent} target="_blank" rel="noopener noreferrer" className="block mt-2">
                                    <img
                                        src={safeContent}
                                        alt={attachment.originalName || 'Submission Image'}
                                        className="max-w-full h-auto rounded-md object-contain max-h-48 border border-gray-300 dark:border-gray-600"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const fallbackText = document.createElement('p');
                                                fallbackText.className = 'text-red-500 text-xs mt-1';
                                                fallbackText.textContent = 'Image failed to load or is invalid.';
                                                parent.insertBefore(fallbackText, target.nextSibling);
                                            }
                                        }}
                                    />
                                    <span className={linkClasses}>
                    View Full Image <ExternalLink className="w-3 h-3 ml-1"/>
                  </span>
                                </a>
                            ) : (
                                <p className="text-sm text-red-500">No image URL provided.</p>
                            )}
                        </div>
                    </div>
                );
            case 'link':
                const isValidUrl = /^https?:\/\/\S+$/.test(safeContent);
                return (
                    <div key={index} className={cardClasses}>
                        <LinkIcon className={`${iconClasses} text-purple-500`}/>
                        <div className="flex-grow">
                            <span className={textClasses}>Link Submission</span>
                            {isValidUrl ? (
                                <a href={safeContent} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                                    {safeContent} <ExternalLink className="w-3 h-3 ml-1"/>
                                </a>
                            ) : (
                                <p className="text-sm text-red-500">Invalid URL: {safeContent}</p>
                            )}
                        </div>
                    </div>
                );
            case 'pdf':
                const isPdfUrl = safeContent.toLowerCase().endsWith('.pdf');
                return (
                    <div key={index} className={cardClasses}>
                        <FileText className={`${iconClasses} text-red-500`}/>
                        <div className="flex-grow">
              <span className={textClasses}>
                PDF: {attachment.originalName || attachment.filename || 'Untitled PDF'}
              </span>
                            {isPdfUrl ? (
                                <a href={safeContent} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                                    View PDF <ExternalLink className="w-3 h-3 ml-1"/>
                                </a>
                            ) : (
                                <p className="text-sm text-red-500">Not a valid PDF URL or content not directly
                                    viewable.</p>
                            )}
                        </div>
                    </div>
                );
            default:
                return (
                    <div key={index} className={cardClasses}>
                        <FileText className={`${iconClasses} text-gray-500`}/>
                        <div className="flex-grow">
              <span className={textClasses}>
                File ({attachment.type}): {attachment.originalName || attachment.filename || 'Untitled File'}
              </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">
                                Content preview not available for this type.
                                {safeContent && (
                                    <a href={safeContent} target="_blank" rel="noopener noreferrer"
                                       className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
                                        [Download/View]
                                    </a>
                                )}
                            </p>
                        </div>
                    </div>
                );
        }
    };

    if (!showModal) return null;

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="submission-modal-title"
                    tabIndex={-1}
                    ref={modalRef}
                >
                    <motion.div
                        initial={{scale: 0.9, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        exit={{scale: 0.9, opacity: 0}}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        aria-live="polite"
                    >
                        <div
                            className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div>
                                <h2 id="submission-modal-title"
                                    className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Task Submissions
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {task.title} • {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label="Close submissions modal"
                            >
                                <X className="w-6 h-6"/>
                            </button>
                        </div>

                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                <input
                                    type="text"
                                    placeholder="Search by student name..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                                    aria-label="Search submissions by student name"
                                    role="searchbox"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row flex-grow min-h-0">
                            <div
                                className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto flex-shrink-0">
                                {(isLoading || isGroupsLoading) && (
                                    <div className="flex items-center justify-center h-full text-indigo-500">
                                        <Loader2 className="w-8 h-8 animate-spin mr-2"/> Loading...
                                    </div>
                                )}

                                {error && (
                                    <div className="flex flex-col items-center justify-center h-full text-rose-500">
                                        <AlertCircle className="w-8 h-8 mb-2"/>
                                        <p>Error loading submissions. Please try again.</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {error && 'status' in error ? `Error ${error.status}: ${error.data?.message || 'Unknown error'}` : 'Unknown error'}
                                        </p>
                                    </div>
                                )}

                                {!isLoading && !isGroupsLoading && !error && filteredSubmissions.length === 0 && (
                                    <div
                                        className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                        <Eye className="w-12 h-12 mb-3"/>
                                        <p>No submissions found for this task or matching your search.</p>
                                    </div>
                                )}

                                {!isLoading && !isGroupsLoading && !error && filteredSubmissions.length > 0 && (
                                    <div className="space-y-4">
                                        {filteredSubmissions.map((submission) => (
                                            <div
                                                key={submission._id}
                                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                                    selectedSubmission?._id === submission._id
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500 shadow-md'
                                                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                }`}
                                                onClick={() => setSelectedSubmission(submission)}
                                                tabIndex={0}
                                                role="button"
                                                aria-pressed={selectedSubmission?._id === submission._id}
                                                aria-label={`View submission by ${getStudentName(submission.studentId)}`}
                                            >
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                                    <User className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"/>
                                                    {getStudentName(submission.studentId)}
                                                </h3>
                                                {isStudentObject(submission.studentId) && submission.studentId.groupIds?.length && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Groups: {submission.studentId.groupIds.map((id) => groupMap.get(id)?.name || id).join(', ')}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-2">
                                                    <Calendar
                                                        className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"/>
                                                    Submitted: {formatDate(submission.submittedAt)}
                                                </p>
                                                <span
                                                    className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}
                                                >
                          {submission.status}
                        </span>
                                                {submission.isLate && (
                                                    <span
                                                        className="mt-2 ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Late
                          </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-2/3 p-6 overflow-y-auto flex-grow bg-white dark:bg-gray-800">
                                {selectedSubmission ? (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Submission
                                            Details</h3>
                                        {selectedSubmission.comments && (
                                            <div>
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                                                    <MessageSquare className="w-5 h-5 mr-2 text-gray-500"/> Comments:
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    {selectedSubmission.comments}
                                                </p>
                                            </div>
                                        )}

                                        {(selectedSubmission.status === 'graded' || selectedSubmission.status === 'returned') && (
                                            <div className="space-y-4">
                                                {selectedSubmission.points !== undefined && (
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                                                            <Award className="w-5 h-5 mr-2 text-yellow-500"/> Points:
                                                        </p>
                                                        <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                            {selectedSubmission.points} / {task.maxPoints}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedSubmission.feedback && (
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                                                            <MessageSquare
                                                                className="w-5 h-5 mr-2 text-gray-500"/> Feedback:
                                                        </p>
                                                        <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                            {selectedSubmission.feedback}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                                                <FileText className="w-5 h-5 mr-2 text-gray-500"/> Attachments:
                                            </p>
                                            {selectedSubmission.githubUrl ? (
                                                <div className={cardClasses}>
                                                    <LinkIcon className={`${iconClasses} text-purple-500`}/>
                                                    <div className="flex-grow">
                                                        <span className={textClasses}>GitHub Repository</span>
                                                        <a href={selectedSubmission.githubUrl} target="_blank"
                                                           rel="noopener noreferrer" className={linkClasses}>
                                                            {selectedSubmission.githubUrl} <ExternalLink
                                                            className="w-3 h-3 ml-1"/>
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : selectedSubmission.attachments && selectedSubmission.attachments.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedSubmission.attachments.map((attachment, index) => renderAttachment(attachment, index))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">No attachments
                                                    submitted</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
                                        aria-live="polite">
                                        <Eye className="w-12 h-12 mb-3"/>
                                        <p>Select a submission from the left panel to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ViewSubmissionsModal;