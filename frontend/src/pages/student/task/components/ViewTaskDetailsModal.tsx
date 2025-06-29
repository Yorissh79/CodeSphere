import React, {useEffect, useState, useRef, useCallback} from 'react';
import {X, Calendar, FileText, Link, Image, ExternalLink, Loader2, Eye, ZoomIn, ZoomOut, RotateCcw} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import {useGetTaskByIdQuery} from '../../../../services/taskApi'; // Adjust import path as needed
import type {Attachment} from '../../../../services/taskApi'; // Import types from API

interface ViewTaskDetailsModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    taskId: string | null;
}

interface ZoomPanState {
    scale: number;
    x: number;
    y: number;
    isDragging: boolean;
    dragStart: { x: number; y: number };
}

const ViewTaskDetailsModal = ({showModal, setShowModal, taskId}: ViewTaskDetailsModalProps) => {
    const [galleryImages, setGalleryImages] = useState<Array<{
        original: string;
        thumbnail: string;
        description?: string;
    }>>([]);
    const [showGallery, setShowGallery] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [zoomPanState, setZoomPanState] = useState<ZoomPanState>({
        scale: 1,
        x: 0,
        y: 0,
        isDragging: false,
        dragStart: {x: 0, y: 0}
    });

    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch task data using the API
    const {data: taskData, isLoading, error, refetch} = useGetTaskByIdQuery(taskId || '', {
        skip: !taskId || !showModal, // Skip query if no taskId or modal is closed
    });

    const task = taskData?.task;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isImageAttachment = (attachment: Attachment) => {
        return attachment.type === 'image';
    };

    const isLinkAttachment = (attachment: Attachment) => {
        return attachment.type === 'link';
    };

    const isTextAttachment = (attachment: Attachment) => {
        return attachment.type === 'text';
    };

    const getFileIcon = (attachment: Attachment) => {
        if (isImageAttachment(attachment)) {
            return <Image className="w-4 h-4 text-green-600 dark:text-green-400"/>;
        }
        if (isLinkAttachment(attachment)) {
            return <Link className="w-4 h-4 text-blue-600 dark:text-blue-400"/>;
        }
        return <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400"/>;
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.warn('Failed to load image:', e.currentTarget.src);
        e.currentTarget.style.display = 'none';
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleRetry = () => {
        if (taskId) {
            refetch();
        }
    };

    // Reset zoom/pan state when gallery image changes
    const resetZoomPan = useCallback(() => {
        setZoomPanState({
            scale: 1,
            x: 0,
            y: 0,
            isDragging: false,
            dragStart: {x: 0, y: 0}
        });
    }, []);

    // Zoom functions wrapped in useCallback for stability
    const handleZoomIn = useCallback(() => {
        setZoomPanState(prev => ({
            ...prev,
            scale: Math.min(prev.scale * 1.5, 5)
        }));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomPanState(prev => ({
            ...prev,
            scale: Math.max(prev.scale / 1.5, 0.5)
        }));
    }, []);

    const handleResetZoom = useCallback(() => {
        resetZoomPan();
    }, [resetZoomPan]);

    // Mouse wheel zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        if (!showGallery) return;

        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;

        setZoomPanState(prev => {
            const newScale = Math.min(Math.max(prev.scale * delta, 0.5), 5);
            return {
                ...prev,
                scale: newScale
            };
        });
    }, [showGallery]);

    // Mouse drag for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoomPanState.scale <= 1) return;

        setZoomPanState(prev => ({
            ...prev,
            isDragging: true,
            dragStart: {x: e.clientX - prev.x, y: e.clientY - prev.y}
        }));
    }, [zoomPanState.scale]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!zoomPanState.isDragging) return;

        setZoomPanState(prev => ({
            ...prev,
            x: e.clientX - prev.dragStart.x,
            y: e.clientY - prev.dragStart.y
        }));
    }, [zoomPanState.isDragging]);

    const handleMouseUp = useCallback(() => {
        setZoomPanState(prev => ({
            ...prev,
            isDragging: false
        }));
    }, []);

    // Touch events for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1 && zoomPanState.scale > 1) {
            const touch = e.touches[0];
            setZoomPanState(prev => ({
                ...prev,
                isDragging: true,
                dragStart: {x: touch.clientX - prev.x, y: touch.clientY - prev.y}
            }));
        }
    }, [zoomPanState.scale]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!zoomPanState.isDragging || e.touches.length !== 1) return;

        e.preventDefault();
        const touch = e.touches[0];
        setZoomPanState(prev => ({
            ...prev,
            x: touch.clientX - prev.dragStart.x,
            y: touch.clientY - prev.dragStart.y
        }));
    }, [zoomPanState.isDragging]);

    const handleTouchEnd = useCallback(() => {
        setZoomPanState(prev => ({
            ...prev,
            isDragging: false
        }));
    }, []);

    const handleImageClick = (attachment: Attachment, allImageAttachments: Attachment[]) => {
        const images = allImageAttachments.map((att) => ({
            original: att.content,
            thumbnail: att.content, // Using same image for thumbnail
            description: att.filename || 'Task Image'
        }));

        const clickedIndex = allImageAttachments.findIndex(att => att.content === attachment.content);

        setGalleryImages(images);
        setStartIndex(clickedIndex);
        setShowGallery(true);
        resetZoomPan();
    };

    // Event listeners for zoom and pan
    useEffect(() => {
        if (showGallery) {
            document.addEventListener('wheel', handleWheel, {passive: false});
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, {passive: false});
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('wheel', handleWheel);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [showGallery, handleWheel, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    // Close gallery when escape key is pressed
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showGallery) {
                setShowGallery(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showGallery]);

    // Reset zoom when gallery index changes
    useEffect(() => {
        resetZoomPan();
    }, [startIndex, resetZoomPan]);

    // Custom render function for gallery images with zoom/pan
    const renderItem = useCallback((item: any) => {
        return (
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                style={{cursor: zoomPanState.scale > 1 ? (zoomPanState.isDragging ? 'grabbing' : 'grab') : 'default'}}
            >
                <img
                    ref={imageRef}
                    src={item.original}
                    alt={item.description || 'Gallery image'}
                    className="max-w-full max-h-full object-contain select-none"
                    style={{
                        transform: `scale(${zoomPanState.scale}) translate(${zoomPanState.x / zoomPanState.scale}px, ${zoomPanState.y / zoomPanState.scale}px)`,
                        transformOrigin: 'center center',
                        transition: zoomPanState.isDragging ? 'none' : 'transform 0.2s ease-out'
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    draggable={false}
                />
            </div>
        );
    }, [zoomPanState, handleMouseDown, handleTouchStart]);

    // Inject custom CSS for gallery styling
// Inject custom CSS for gallery styling
    useEffect(() => {
        const styleId = 'custom-gallery-styles';
        let styleElement = document.getElementById(styleId);

        if (!styleElement && showGallery) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = `
                .custom-gallery .image-gallery-slide {
                    background: transparent !important;
                    /* --- FIX STARTS HERE --- */
                    /* Ensure the slide itself is a flex container that centers its content */
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    /* --- FIX ENDS HERE --- */
                }

                .custom-gallery .image-gallery-content {
                    background: transparent !important;
                }

                .custom-gallery .image-gallery-slide .image-gallery-image {
                    max-height: none !important;
                    height: 100% !important;
                    width: 100% !important;
                    object-fit: contain !important;
                }

                .custom-gallery .image-gallery-thumbnails {
                    background: rgba(0, 0, 0, 0.8) !important;
                    padding: 10px !important;
                }

                .custom-gallery .image-gallery-thumbnail {
                    border: 2px solid transparent !important;
                    border-radius: 4px !important;
                }

                .custom-gallery .image-gallery-thumbnail.active {
                    border-color: #3b82f6 !important;
                }

                .custom-gallery .image-gallery-icon {
                    color: white !important;
                    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
                }

                .custom-gallery .image-gallery-icon:hover {
                    color: #3b82f6 !important;
                }

                .custom-gallery .image-gallery-left-nav,
                .custom-gallery .image-gallery-right-nav {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border-radius: 50% !important;
                    margin: 0 10px !important;
                }

                .custom-gallery .image-gallery-left-nav:hover,
                .custom-gallery .image-gallery-right-nav:hover {
                    background: rgba(0, 0, 0, 0.6) !important;
                }
            `;
            document.head.appendChild(styleElement);
        }

        return () => {
            if (!showGallery && styleElement) {
                styleElement.remove();
            }
        };
    }, [showGallery]);
    // Render loading state
    if (isLoading) {
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
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-4"/>
                                <p className="text-gray-600 dark:text-gray-300">Loading task details...</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Render error state
    if (error) {
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
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
                        >
                            <div className="flex flex-col items-center justify-center text-center">
                                <div
                                    className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                    <X className="w-6 h-6 text-red-600 dark:text-red-400"/>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Failed to Load Task
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    There was an error loading the task details.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRetry}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Don't render if no task data
    if (!task) return null;

    // Separate attachments by type
    const imageAttachments = task.attachments?.filter(isImageAttachment) || [];
    const linkAttachments = task.attachments?.filter(isLinkAttachment) || [];
    const textAttachments = task.attachments?.filter(isTextAttachment) || [];
    const otherAttachments = task.attachments?.filter(att =>
        !isImageAttachment(att) && !isLinkAttachment(att) && !isTextAttachment(att)
    ) || [];

    return (
        <>
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
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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
                            <div className="p-6 overflow-y-auto">
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

                                    {/* Teacher Info */}
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                                        <span className="font-medium">Teacher:</span>
                                        <span className="ml-2">
                                            {task.teacherId.name} {task.teacherId.surname}
                                        </span>
                                    </div>

                                    {/* Late Submission */}
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Late Submission:</span>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                            task.allowLateSubmission
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                            {task.allowLateSubmission ? 'Allowed' : 'Not Allowed'}
                                        </span>
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

                                {/* Text Attachments */}
                                {textAttachments.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                            <FileText className="w-5 h-5 mr-2"/>
                                            Additional Instructions ({textAttachments.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {textAttachments.map((attachment, index) => (
                                                <div
                                                    key={`text-${index}`}
                                                    className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500"
                                                >
                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                        {attachment.content}
                                                    </p>
                                                    {attachment.filename && (
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                                            Source: {attachment.filename}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Image Attachments */}
                                {imageAttachments.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                            <Image className="w-5 h-5 mr-2"/>
                                            Images ({imageAttachments.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {imageAttachments.map((attachment, index) => (
                                                <div
                                                    key={`image-${index}`}
                                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div
                                                        className="relative bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden mb-3 group cursor-pointer"
                                                        onClick={() => handleImageClick(attachment, imageAttachments)}
                                                    >
                                                        <img
                                                            src={attachment.content}
                                                            alt={attachment.filename || `Image ${index + 1}`}
                                                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                                                            loading="lazy"
                                                            onError={handleImageError}
                                                        />
                                                        {/* Enhanced zoom overlay */}
                                                        <div
                                                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div
                                                                className="bg-white bg-opacity-90 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform">
                                                                <Eye className="w-6 h-6 text-gray-700"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {attachment.filename && (
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {attachment.filename}
                                                        </p>
                                                    )}
                                                    {attachment.originalName && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Original: {attachment.originalName}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Link Attachments */}
                                {linkAttachments.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                            <Link className="w-5 h-5 mr-2"/>
                                            Related Links ({linkAttachments.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {linkAttachments.map((attachment, index) => (
                                                <div
                                                    key={`link-${index}`}
                                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center mb-2">
                                                                <Link
                                                                    className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0"/>
                                                                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {attachment.filename || `Link ${index + 1}`}
                                                                </h5>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <p className="text-xs text-blue-600 dark:text-blue-400 truncate flex-1">
                                                                    {attachment.content}
                                                                </p>
                                                                {isValidUrl(attachment.content) && (
                                                                    <span
                                                                        className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                                        ✓ Valid
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isValidUrl(attachment.content) && (
                                                            <a
                                                                href={attachment.content}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="ml-3 p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors flex-shrink-0"
                                                                title="Open link in new tab"
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

                                {/* Other Attachments */}
                                {otherAttachments.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                            <FileText className="w-5 h-5 mr-2"/>
                                            Other Attachments ({otherAttachments.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {otherAttachments.map((attachment, index) => (
                                                <div
                                                    key={`other-${index}`}
                                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-start space-x-3 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex-shrink-0">
                                                        {getFileIcon(attachment)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {attachment.filename || `Attachment ${index + 1}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Type: {attachment.type}
                                                        </p>
                                                        {attachment.content && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                                                                {attachment.content.length > 100
                                                                    ? `${attachment.content.substring(0, 100)}...`
                                                                    : attachment.content
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Attachments Message */}
                                {(!task.attachments || task.attachments.length === 0) && (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3"/>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No attachments available for this task.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-black bg-opacity-95 z-[60]"
                        onClick={(e) => {
                            // Close only if the backdrop is clicked, not the content inside
                            if (e.target === e.currentTarget) {
                                setShowGallery(false);
                            }
                        }}
                    >
                        {/* Gallery Container */}
                        <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
                            {/* Gallery Controls */}
                            <div className="absolute top-4 right-4 z-[70] flex items-center space-x-2">
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-5 h-5"/>
                                </button>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-5 h-5"/>
                                </button>
                                <button
                                    onClick={handleResetZoom}
                                    className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
                                    title="Reset Zoom"
                                >
                                    <RotateCcw className="w-5 h-5"/>
                                </button>
                                <button
                                    onClick={() => setShowGallery(false)}
                                    className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
                                    title="Close Gallery"
                                >
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>

                            {/* Zoom Level Indicator */}
                            {zoomPanState.scale !== 1 && (
                                <div
                                    className="absolute top-4 left-4 z-[70] bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                    {Math.round(zoomPanState.scale * 100)}%
                                </div>
                            )}

                            {/* Image Gallery */}
                            <ImageGallery
                                items={galleryImages}
                                startIndex={startIndex}
                                showThumbnails={galleryImages.length > 1}
                                showFullscreenButton={false}
                                showPlayButton={false}
                                showBullets={false}
                                showIndex={galleryImages.length > 1}
                                slideDuration={300}
                                slideInterval={0}
                                additionalClass="custom-gallery"
                                renderItem={renderItem}
                                onSlide={(currentIndex) => setStartIndex(currentIndex)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ViewTaskDetailsModal;