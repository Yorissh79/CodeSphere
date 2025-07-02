// components/SaveDialog.tsx
import React, {useEffect} from 'react';
import {Download, Github, Database} from 'lucide-react';

interface SaveDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (method: 'zip' | 'github' | 'database') => void;
    isLoading: boolean;
}

const SaveDialog: React.FC<SaveDialogProps> = ({isOpen, onClose, onSave, isLoading}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Save Project</h2>
                <div className="space-y-3">
                    <button
                        onClick={() => onSave('zip')}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                        <div className="text-left">
                            <div className="text-gray-800 dark:text-gray-200 font-medium">Download as ZIP</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Save all files to your computer
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => onSave('github')}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <Github className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                        <div className="text-left">
                            <div className="text-gray-800 dark:text-gray-200 font-medium">Push to GitHub</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Save to connected repository</div>
                        </div>
                    </button>
                    <button
                        onClick={() => onSave('database')}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <Database className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                        <div className="text-left">
                            <div className="text-gray-800 dark:text-gray-200 font-medium">Save to Cloud</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Store in your account</div>
                        </div>
                    </button>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveDialog;