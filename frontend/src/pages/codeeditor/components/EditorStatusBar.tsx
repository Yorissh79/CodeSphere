// components/EditorStatusBar.tsx
import React from 'react';
import {AlertTriangle} from 'lucide-react';
import type {EditorFile, Project} from './types'; // Adjust path as needed

interface EditorStatusBarProps {
    project: Project;
    activeFile: EditorFile | undefined;
}

const EditorStatusBar: React.FC<EditorStatusBarProps> = ({project, activeFile}) => {
    return (
        <footer
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
            <div>
                <span>{project.files.length} file{project.files.length !== 1 ? 's' : ''}</span>
                {activeFile && (
                    <span className="ml-4">{activeFile.type.toUpperCase()} • {activeFile.name}</span>
                )}
            </div>
            <div className="flex items-center gap-4">
                {project.isModified && (
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <AlertTriangle className="w-4 h-4"/>
                            Unsaved changes
                        </span>
                )}
                <span>Last modified: {project.lastModified.toLocaleTimeString()}</span>
            </div>
        </footer>
    );
};

export default EditorStatusBar;