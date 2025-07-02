// components/PreviewPanel.tsx
import React from 'react';
import {Monitor, Smartphone} from 'lucide-react';
import type {ViewMode} from './types'; // Adjust path as needed

interface PreviewPanelProps {
    previewContent: string;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({previewContent, viewMode, setViewMode}) => {
    return (
        <div
            className="w-1/2 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            <div
                className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Preview</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {viewMode === 'desktop' ? 'Desktop' : 'Mobile'} View
                    </span>
                    <button
                        onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title={`Switch to ${viewMode === 'desktop' ? 'mobile' : 'desktop'} view`}
                    >
                        {viewMode === 'desktop' ? (
                            <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                        ) : (
                            <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                        )}
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <iframe
                    srcDoc={previewContent}
                    className={`w-full h-full border-none ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}
                    title="Preview"
                    sandbox="allow-scripts"
                />
            </div>
        </div>
    );
};

export default PreviewPanel;