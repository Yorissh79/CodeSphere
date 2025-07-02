// components/EditorHeader.tsx
import React, {useState} from 'react'; // Import useState
import {Play, Monitor, Smartphone, Save, Settings, Edit3, RotateCcw} from 'lucide-react'; // Add Edit3 and RotateCcw
import type {Project, ViewMode} from './types';

interface EditorHeaderProps {
    project: Project;
    showExplorer: boolean;
    setShowExplorer: (show: boolean) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    setShowSaveDialog: (show: boolean) => void;
    createNewProject: () => void;
    onProjectRename: (newName: string) => void; // New prop for renaming
    onResetProject: () => void; // New prop for resetting the project
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
                                                       project,
                                                       showExplorer,
                                                       setShowExplorer,
                                                       viewMode,
                                                       setViewMode,
                                                       showPreview,
                                                       setShowPreview,
                                                       setShowSaveDialog,
                                                       createNewProject,
                                                       onProjectRename, // Destructure new prop
                                                       onResetProject // Destructure new prop
                                                   }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [projectName, setProjectName] = useState(project.name);

    // Update internal state if project name changes from parent
    React.useEffect(() => {
        setProjectName(project.name);
    }, [project.name]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
    };

    const handleNameBlur = () => {
        if (projectName.trim() && projectName !== project.name) {
            onProjectRename(projectName.trim());
        } else {
            setProjectName(project.name); // Revert if empty or unchanged
        }
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur(); // Trigger blur to save
        }
    };

    return (
        <header
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
                {isEditingName ? (
                    <input
                        type="text"
                        value={projectName}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        onKeyDown={handleNameKeyDown}
                        className="text-lg font-semibold bg-transparent border-b border-blue-500 outline-none focus:border-blue-700 dark:text-gray-200"
                        autoFocus
                    />
                ) : (
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
                        onClick={() => setIsEditingName(true)}>
                        {project.name}
                        {project.isModified &&
                            <span className="text-sm text-gray-500 dark:text-gray-400"> • Unsaved</span>}
                        <Edit3
                            className="inline-block ml-2 w-4 h-4 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </h1>
                )}
                <button
                    onClick={createNewProject}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    New Project
                </button>
                <button
                    onClick={() => setShowExplorer(!showExplorer)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {showExplorer ? 'Hide' : 'Show'} Explorer
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title={`Switch to ${viewMode === 'desktop' ? 'mobile' : 'desktop'} preview`}
                >
                    {viewMode === 'desktop' ? <Monitor className="w-5 h-5"/> : <Smartphone className="w-5 h-5"/>}
                </button>
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-md transition-colors ${
                        showPreview
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title="Toggle preview"
                >
                    <Play className="w-5 h-5"/>
                </button>
                <button
                    onClick={() => setShowSaveDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
                >
                    <Save className="w-5 h-5"/>
                    Save
                </button>
                <button
                    onClick={onResetProject} // Add the reset button here
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Reset Project"
                >
                    <RotateCcw className="w-5 h-5"/>
                </button>
                <button
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <Settings className="w-5 h-5"/>
                </button>
            </div>
        </header>
    );
};

export default EditorHeader;