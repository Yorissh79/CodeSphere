// components/EditorTabBar.tsx
import React from 'react';
import {X} from 'lucide-react';
import type {EditorFile} from './types'; // Adjust path as needed

interface EditorTabBarProps {
    openFiles: EditorFile[];
    activeFileId: string;
    onFileSelect: (fileId: string) => void;
    onCloseFile: (fileId: string) => void;
}

const EditorTabBar: React.FC<EditorTabBarProps> = ({openFiles, activeFileId, onFileSelect, onCloseFile}) => {
    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto">
            {openFiles.map(file => (
                <div
                    key={file.id}
                    onClick={() => onFileSelect(file.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200 dark:border-gray-700 whitespace-nowrap group cursor-pointer ${
                        file.id === activeFileId
                            ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <span>{file.name}</span>
                    {file.isModified &&
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseFile(file.id);
                        }}
                        className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
                        title="Close file"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                onCloseFile(file.id);
                            }
                        }}
                    >
                        <X className="w-3 h-3 text-gray-600 dark:text-gray-300"/>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default EditorTabBar;