// AdvancedCodeEditor.tsx
import React, {useState, useCallback, useMemo, useEffect} from 'react';
import toast, {Toaster} from 'react-hot-toast';
import {Code, AlertTriangle} from 'lucide-react';

// Import JSZip and file-saver
import JSZip from 'jszip';
import {saveAs} from 'file-saver';

// Import Types
import type {FileType, ViewMode, EditorFile, EditorFolder, Project} from './components/types';

// Import Components
import MonacoEditor from './components/MonacoEditor';
import FileExplorer from './components/FileExplorer';
import SaveDialog from './components/SaveDialog';
import EditorHeader from './components/EditorHeader';
import EditorTabBar from './components/EditorTabBar';
import PreviewPanel from './components/PreviewPanel';
import EditorStatusBar from './components/EditorStatusBar';

// Moved defaultProjectState outside the component for global access
const defaultProjectState: Project = {
    id: 'default-project',
    name: 'My Project',
    description: 'A new web project',
    lastModified: new Date(),
    isModified: false,
    files: [
        {
            id: 'html-main',
            name: 'index.html',
            type: 'html',
            path: '/index.html',
            isModified: false,
            content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Project</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>Start editing to see changes.</p>\n    <script src="script.js"></script>\n</body>\n</html>'
        },
        {
            id: 'css-main',
            name: 'styles.css',
            type: 'css',
            path: '/styles.css',
            isModified: false,
            content: 'body {\n    font-family: Arial, sans-serif;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 20px;\n    line-height: 1.6;\n    background: #f8f9fa;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n    margin-bottom: 1rem;\n}\n\np {\n    color: #666;\n    font-size: 1.1rem;\n}'
        },
        {
            id: 'js-main',
            name: 'script.js',
            type: 'javascript',
            path: '/script.js',
            isModified: false,
            content: '// Add your JavaScript here\nconsole.log("Hello from JavaScript!");\n\n// Example: Add click event to h1\ndocument.addEventListener("DOMContentLoaded", function() {\n    const heading = document.querySelector("h1");\n    if (heading) {\n        heading.addEventListener("click", function() {\n            this.style.color = this.style.color === "red" ? "#333" : "red";\n            console.log("Heading clicked!");\n        });\n    }\n});'
        }
    ],
    folders: []
};

const AdvancedCodeEditor: React.FC = () => {
    const [project, setProject] = useState<Project>(() => {
        // Try to load from localStorage on initial render
        const savedProject = localStorage.getItem('codeEditorProject');
        if (savedProject) {
            const parsedProject = JSON.parse(savedProject);
            // Ensure dates are parsed correctly
            parsedProject.lastModified = new Date(parsedProject.lastModified);
            return parsedProject;
        }
        // Default project if nothing in localStorage
        return defaultProjectState;
    });
    const [activeFileId, setActiveFileId] = useState<string>('html-main');
    const [openFileIds, setOpenFileIds] = useState<string[]>(['html-main', 'css-main', 'js-main']);
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showExplorer, setShowExplorer] = useState<boolean>(true);
    const [githubToken, setGithubToken] = useState<string | null>(null);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (project.isModified) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [project.isModified]);

    const getFileContent = useCallback((type: FileType): string => {
        const file = project.files.find(f => f.type === type);
        return file?.content || '';
    }, [project.files]);

    const updateFileContent = useCallback((fileId: string, content: string) => {
        setProject(prev => ({
            ...prev,
            isModified: true,
            lastModified: new Date(),
            files: prev.files.map(file =>
                file.id === fileId
                    ? {...file, content, isModified: true}
                    : file
            )
        }));
    }, []);

    const createFile = useCallback((data: { name: string; type?: FileType; parentId?: string }) => {
        const newFile: EditorFile = {
            id: `file-${Date.now()}`,
            name: data.name,
            type: data.type || 'html',
            path: data.parentId ? `/${data.parentId}/${data.name}` : `/${data.name}`,
            content: '',
            isModified: false,
            parentId: data.parentId
        };

        setProject(prev => ({
            ...prev,
            files: [...prev.files, newFile],
            isModified: true
        }));
        setActiveFileId(newFile.id);
        setOpenFileIds(prev => [...prev, newFile.id]);
        toast.success(`Created file: ${data.name}`);
    }, []);

    const createFolder = useCallback((data: { name: string; parentId?: string }) => {
        const newFolder: EditorFolder = {
            id: `folder-${Date.now()}`,
            name: data.name,
            path: data.parentId ? `/${data.parentId}/${data.name}` : `/${data.name}`,
            isExpanded: true,
            parentId: data.parentId
        };

        setProject(prev => ({
            ...prev,
            folders: [...prev.folders, newFolder],
            isModified: true
        }));
        toast.success(`Created folder: ${data.name}`);
    }, []);

    const deleteFile = useCallback((fileId: string) => {
        const file = project.files.find(f => f.id === fileId);
        if (!file) return;

        toast((t) => (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500"/>
                    <span className="text-gray-800 dark:text-gray-200">Delete {file.name}?</span>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setProject(prev => ({
                                ...prev,
                                files: prev.files.filter(f => f.id !== fileId),
                                isModified: true
                            }));

                            if (openFileIds.includes(fileId)) {
                                setOpenFileIds(prev => prev.filter(id => id !== fileId));
                                if (activeFileId === fileId && project.files.length > 1) {
                                    const remainingFiles = project.files.filter(f => f.id !== fileId);
                                    setActiveFileId(remainingFiles[0]?.id || '');
                                    setOpenFileIds(prev => prev.filter(id => id !== fileId));
                                }
                            }
                            toast.dismiss(t.id);
                            toast.success(`Deleted file: ${file.name}`);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {duration: Infinity});
    }, [activeFileId, project.files, openFileIds]);

    const deleteFolder = useCallback((folderId: string) => {
        const folder = project.folders.find(f => f.id === folderId);
        if (!folder) return;

        toast((t) => (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500"/>
                    <span
                        className="text-gray-800 dark:text-gray-200">Delete folder {folder.name} and all its contents?</span>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setProject(prev => ({
                                ...prev,
                                folders: prev.folders.filter(f => f.id !== folderId),
                                files: prev.files.filter(f => f.parentId !== folderId),
                                isModified: true
                            }));
                            toast.dismiss(t.id);
                            toast.success(`Deleted folder: ${folder.name}`);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {duration: Infinity});
    }, []);

    const renameFile = useCallback((fileId: string, newName: string) => {
        setProject(prev => ({
            ...prev,
            files: prev.files.map(f =>
                f.id === fileId ? {...f, name: newName, isModified: true} : f
            ),
            isModified: true
        }));
        toast.success(`Renamed file to: ${newName}`);
    }, []);

    const renameFolder = useCallback((folderId: string, newName: string) => {
        setProject(prev => ({
            ...prev,
            folders: prev.folders.map(f =>
                f.id === folderId ? {...f, name: newName} : f
            ),
            isModified: true
        }));
        toast.success(`Renamed folder to: ${newName}`);
    }, []);

    const toggleFolder = useCallback((folderId: string) => {
        setProject(prev => ({
            ...prev,
            folders: prev.folders.map(f =>
                f.id === folderId ? {...f, isExpanded: !f.isExpanded} : f
            )
        }));
    }, []);

    const closeFileTab = useCallback((fileId: string) => {
        setOpenFileIds(prev => {
            const newOpenFiles = prev.filter(id => id !== fileId);
            if (activeFileId === fileId && newOpenFiles.length > 0) {
                setActiveFileId(newOpenFiles[0]);
            } else if (newOpenFiles.length === 0) {
                setActiveFileId('');
            }
            return newOpenFiles;
        });
    }, [activeFileId]);

    const handleSave = useCallback(async (method: 'zip' | 'github' | 'database') => {
        setIsSaving(true);

        try {
            switch (method) {
                case 'zip':
                    toast.loading('Zipping project...', {id: 'zip-save'});
                    const zip = new JSZip();

                    // Add files to the zip
                    project.files.forEach(file => {
                        // Ensure path starts without leading slash for JSZip (or handle according to desired structure)
                        // For simplicity, let's just use file.path directly, assuming it's correctly formed (e.g., /index.html)
                        // JSZip will strip leading slashes if you add a file as '/folder/file.txt'
                        zip.file(file.path.substring(1), file.content); // Remove leading slash for cleaner zip structure
                    });

                    // You might want to handle folders if they represent empty directories
                    // For now, only files are added. If you have nested folders,
                    // ensure file.path accurately reflects them (e.g., 'assets/img/image.png')

                    const zipBlob = await zip.generateAsync({type: 'blob'});
                    saveAs(zipBlob, `${project.name.replace(/\s+/g, '-')}.zip`); // Replace spaces in project name for filename
                    toast.success('Project saved as zip!', {id: 'zip-save'});
                    break;

                case 'github':
                    if (!githubToken) {
                        toast.error('GitHub not authenticated. Please connect your GitHub account.');
                        // Potentially trigger GitHub auth flow here
                        return;
                    }
                    console.log('Attempting to push to GitHub with token:', githubToken);
                    toast.loading('Pushing to GitHub...', {id: 'github-save'});

                    // Simulating GitHub API call
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    toast.success('Project pushed to GitHub', {id: 'github-save'});
                    break;

                case 'database':
                    // Implement database save logic here
                    toast.loading('Saving to database...', {id: 'db-save'});
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate async save
                    toast.success('Project saved to database!', {id: 'db-save'});
                    break;
            }

            setProject(prev => ({
                ...prev,
                isModified: false,
                files: prev.files.map(file => ({...file, isModified: false}))
            }));
            setShowSaveDialog(false);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save project');
        } finally {
            setIsSaving(false);
        }
    }, [project, githubToken]);

    const createNewProject = useCallback(() => {
        if (project.isModified) {
            toast((t) => (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500"/>
                        <span className="text-gray-800 dark:text-gray-200">You have unsaved changes. Save before creating a new project?</span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                setShowSaveDialog(true);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setProject({
                                    id: `project-${Date.now()}`,
                                    name: 'New Project',
                                    description: 'A new web project',
                                    lastModified: new Date(),
                                    isModified: false,
                                    files: [
                                        {
                                            id: 'new-html',
                                            name: 'index.html',
                                            type: 'html',
                                            path: '/index.html',
                                            isModified: false,
                                            content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>New Project</title>\n</head>\n<body>\n    <h1>New Project</h1>\n</body>\n</html>'
                                        }
                                    ],
                                    folders: []
                                });
                                setActiveFileId('new-html');
                                setOpenFileIds(['new-html']);
                                toast.dismiss(t.id);
                                toast.success('New project created');
                            }}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            ), {duration: Infinity});
            return;
        }

        setProject({
            id: `project-${Date.now()}`,
            name: 'New Project',
            description: 'A new web project',
            lastModified: new Date(),
            isModified: false,
            files: [
                {
                    id: 'new-html',
                    name: 'index.html',
                    type: 'html',
                    path: '/index.html',
                    isModified: false,
                    content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>New Project</title>\n</head>\n<body>\n    <h1>New Project</h1>\n</body>\n</html>'
                }
            ],
            folders: []
        });
        setActiveFileId('new-html');
        setOpenFileIds(['new-html']);
        toast.success('New project created');
    }, [project.isModified]);

    const handleResetProject = useCallback(() => {
        toast((t) => (
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-500"/>
                    <span className="font-semibold">Are you sure you want to reset the project?</span>
                </div>
                <p className="text-sm mb-4">All unsaved changes will be lost.</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setProject(defaultProjectState); // Reset to default state
                            setActiveFileId('html-main');
                            setOpenFileIds(['html-main', 'css-main', 'js-main']);
                            toast.dismiss(t.id);
                            toast.success('Project reset successfully!');
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {duration: Infinity});
    }, []);


    const previewContent = useMemo(() => {
        const html = getFileContent('html');
        const css = getFileContent('css');
        const js = getFileContent('javascript');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}</script>
            </body>
            </html>
        `.trim();
    }, [getFileContent]);

    const activeFile = project.files.find(f => f.id === activeFileId);
    const openFiles = project.files.filter(file => openFileIds.includes(file.id));

    useEffect(() => {
        localStorage.setItem('codeEditorProject', JSON.stringify(project));
    }, [project]); // Save project to localStorage whenever it changes

    // New function for renaming the project
    const renameProject = useCallback((newName: string) => {
        setProject(prev => ({
            ...prev,
            name: newName,
            isModified: true, // Renaming is also a modification
            lastModified: new Date()
        }));
        toast.success(`Project renamed to: ${newName}`);
    }, []);

    return (
        <div className={`h-screen flex flex-col`}>
            <Toaster position="top-right"/>
            <EditorHeader
                project={project}
                showExplorer={showExplorer}
                setShowExplorer={setShowExplorer}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                setShowSaveDialog={setShowSaveDialog}
                createNewProject={createNewProject}
                onProjectRename={renameProject} // Pass the new rename function
                onResetProject={handleResetProject} // Pass the reset project function
            />

            <main className="flex-1 flex overflow-hidden bg-gray-100 dark:bg-gray-900">
                {showExplorer && (
                    <div
                        className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <FileExplorer
                            files={project.files}
                            folders={project.folders}
                            activeFileId={activeFileId}
                            onFileSelect={(fileId) => {
                                setActiveFileId(fileId);
                                if (!openFileIds.includes(fileId)) {
                                    setOpenFileIds(prev => [...prev, fileId]);
                                }
                            }}
                            onFileCreate={createFile}
                            onFolderCreate={createFolder}
                            onFileDelete={deleteFile}
                            onFolderDelete={deleteFolder}
                            onFileRename={renameFile}
                            onFolderRename={renameFolder}
                            onFolderToggle={toggleFolder}
                        />
                    </div>
                )}

                <div className="flex-1 flex overflow-hidden">
                    <div className={`flex-1 flex flex-col ${showPreview ? 'w-1/2' : 'w-full'}`}>
                        <EditorTabBar
                            openFiles={openFiles}
                            activeFileId={activeFileId}
                            onFileSelect={setActiveFileId}
                            onCloseFile={closeFileTab}
                        />
                        <div className="flex-1 bg-white dark:bg-gray-800">
                            {activeFile ? (
                                <MonacoEditor
                                    value={activeFile.content}
                                    language={activeFile.type}
                                    onChange={(content) => updateFileContent(activeFile.id, content)}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
                                    <div className="text-center text-gray-600 dark:text-gray-300">
                                        <Code className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500"/>
                                        <p className="text-lg font-semibold">No file selected</p>
                                        <p className="text-sm">Select a file from the explorer to start editing</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {showPreview && (
                        <PreviewPanel
                            previewContent={previewContent}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />
                    )}
                </div>
            </main>

            <EditorStatusBar project={project} activeFile={activeFile}/>

            <SaveDialog
                isOpen={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                onSave={handleSave} // handleSave now manages different save methods
                isLoading={isSaving}
            />
        </div>
    );
};

export default AdvancedCodeEditor;