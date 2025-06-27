// CodeEditor.tsx

import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import toast, {Toaster} from 'react-hot-toast';
import {
    Play, Code, Palette, FileText, X, Monitor, Smartphone, FolderPlus,
    FilePlus, Save, Download, Github, Database, Settings, Trash2,
    Edit3, AlertTriangle, Folder, FolderOpen
} from 'lucide-react';

// Types
type FileType = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown';
type ViewMode = 'desktop' | 'mobile';
type ModalType = 'createFile' | 'createFolder' | 'renameFile' | 'renameFolder' | null;

interface EditorFile {
    id: string;
    name: string;
    type: FileType;
    content: string;
    path: string;
    isModified: boolean;
    parentId?: string;
}

interface EditorFolder {
    id: string;
    name: string;
    path: string;
    parentId?: string;
    isExpanded: boolean;
}

interface Project {
    id: string;
    name: string;
    description: string;
    files: EditorFile[];
    folders: EditorFolder[];
    lastModified: Date;
    isModified: boolean;
}

// Monaco Editor Component with @monaco-editor/react
interface MonacoEditorProps {
    value: string;
    language: string;
    onChange: (value: string) => void;
    options?: any;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({value, language, onChange, options = {}}) => {
    const editorRef = useRef(null);

    // Map file types to Monaco language identifiers
    const getMonacoLanguage = (fileType: string) => {
        switch (fileType) {
            case 'javascript':
                return 'javascript';
            case 'typescript':
                return 'typescript';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'json':
                return 'json';
            case 'markdown':
                return 'markdown';
            default:
                return 'plaintext';
        }
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;

        // Configure Monaco themes and settings
        monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                {token: 'comment', foreground: '6A9955'},
                {token: 'keyword', foreground: '569CD6'},
                {token: 'string', foreground: 'CE9178'},
                {token: 'number', foreground: 'B5CEA8'},
            ],
            colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4',
                'editorLineNumber.foreground': '#858585',
                'editor.selectionBackground': '#264F78',
                'editor.inactiveSelectionBackground': '#3A3D41',
            }
        });

        // Set up auto-completion for HTML
        if (language === 'html') {
            monaco.languages.setLanguageConfiguration('html', {
                autoClosingPairs: [
                    {open: '<', close: '>'},
                    {open: '"', close: '"'},
                    {open: "'", close: "'"},
                    {open: ''}
                ],
                surroundingPairs: [
                    {open: '<', close: '>'},
                    {open: '"', close: '"'},
                    {open: "'", close: "'"}
                ]
            });
            monaco.languages.registerCompletionItemProvider('html', {
                triggerCharacters: ['!'],
                provideCompletionItems: (model: { getLineContent: (arg0: any) => any; }, position: {
                    lineNumber: any;
                    column: number;
                }) => {
                    const line = model.getLineContent(position.lineNumber);
                    const textBeforeCursor = line.substring(0, position.column - 1);

                    let range;
                    if (textBeforeCursor.endsWith('!')) {
                        const startColumn = position.column - '!!!'.length;
                        range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: startColumn,
                            endColumn: position.column
                        };
                    } else {
                        // If '!!!' is not found right before the cursor,
                        // insert at current position. This is the fallback for when
                        // the user types '!' and expects the suggestion without '!!!' pre-existing.
                        range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        };
                    }

                    const suggestions = [
                        {
                            label: '!!!',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    $0\n</body>\n</html>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML5 DOCTYPE template',
                            range: range // Set the calculated range here
                        },
                        {
                            label: 'div',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<div>\n\t$0\n</div>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML div element',
                            // For other snippets, if you don't want them to replace text
                            // but just insert, you can leave range as null or calculated to current cursor
                            range: { // Example for div, if you want it to replace 'div' if typed
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('div') ? 'div'.length : 0),
                                endColumn: position.column
                            }
                        },
                        {
                            label: 'button',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<button type="button">$0</button>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML button element',
                            // Same logic for button
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('button') ? 'button'.length : 0),
                                endColumn: position.column
                            }
                        }
                    ];
                    return {suggestions};
                }
            });
        }

        // Set up auto-completion for CSS
        if (language === 'css') {
            monaco.languages.registerCompletionItemProvider('css', {
                provideCompletionItems: (model: { getLineContent: (arg0: any) => any; }, position: {
                    lineNumber: any;
                    column: number;
                }) => { // Added model and position for consistency
                    const line = model.getLineContent(position.lineNumber);
                    const textBeforeCursor = line.substring(0, position.column - 1);

                    const suggestions = [
                        {
                            label: 'flexbox-center',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'display: flex;\njustify-content: center;\nalign-items: center;',
                            documentation: 'Flexbox centering',
                            range: { // Example for CSS snippet
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('flexbox-center') ? 'flexbox-center'.length : 0),
                                endColumn: position.column
                            }
                        },
                        {
                            label: 'grid-layout',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\ngap: 1rem;',
                            documentation: 'Responsive grid layout',
                            range: { // Example for CSS snippet
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('grid-layout') ? 'grid-layout'.length : 0),
                                endColumn: position.column
                            }
                        }
                    ];
                    return {suggestions};
                }
            });
        }
    };

    const handleEditorChange = (value: any) => {
        onChange(value || '');
    };

    const defaultOptions = {
        minimap: {enabled: false},
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        bracketPairColorization: {enabled: true},
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        quickSuggestions: {
            other: true,
            comments: false,
            strings: true
        },
        ...options
    };

    return (
        <div className="h-full">
            <Editor
                height="100%"
                language={getMonacoLanguage(language)}
                value={value}
                theme="vs-dark"
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={defaultOptions}
                loading={
                    <div className="flex items-center justify-center h-full bg-gray-900 text-gray-300">
                        <div className="text-center">
                            <div
                                className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                            <div>Loading Editor...</div>
                        </div>
                    </div>
                }
            />
        </div>
    );
};

// File Explorer Component
interface FileExplorerProps {
    files: EditorFile[];
    folders: EditorFolder[];
    activeFileId: string;
    onFileSelect: (fileId: string) => void;
    onFileCreate: (parentId?: {
        name: string;
        parentId?: string | undefined;
        type?: "html" | "css" | "javascript" | "typescript" | "json" | "markdown" | undefined
    }) => void;
    onFolderCreate: (parentId?: {
        name: string;
        parentId?: string | undefined;
        type?: "html" | "css" | "javascript" | "typescript" | "json" | "markdown" | undefined
    }) => void;
    onFileDelete: (fileId: string) => void;
    onFolderDelete: (folderId: string) => void;
    onFileRename: (fileId: string, newName: string) => void;
    onFolderRename: (folderId: string, newName: string) => void;
    onFolderToggle: (folderId: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
                                                       files,
                                                       folders,
                                                       activeFileId,
                                                       onFileSelect,
                                                       onFileCreate,
                                                       onFolderCreate,
                                                       onFileDelete,
                                                       onFolderDelete,
                                                       onFileRename,
                                                       onFolderRename,
                                                       onFolderToggle
                                                   }) => {
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalData, setModalData] = useState<{ id?: string; name?: string; parentId?: string }>({});

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && modalType) {
                setModalType(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalType]);

    const getFileIcon = (type: FileType) => {
        switch (type) {
            case 'html':
                return <FileText className="w-4 h-4 text-orange-500"/>;
            case 'css':
                return <Palette className="w-4 h-4 text-blue-500"/>;
            case 'javascript':
                return <Code className="w-4 h-4 text-yellow-500"/>;
            case 'typescript':
                return <Code className="w-4 h-4 text-blue-600"/>;
            case 'json':
                return <FileText className="w-4 h-4 text-green-500"/>;
            case 'markdown':
                return <FileText className="w-4 h-4 text-gray-500"/>;
            default:
                return <Code className="w-4 h-4 text-gray-500"/>;
        }
    };

    const startEditing = (id: string, currentName: string) => {
        setModalType('renameFile');
        setModalData({id, name: currentName});
    };

    const startFolderEditing = (id: string, currentName: string) => {
        setModalType('renameFolder');
        setModalData({id, name: currentName});
    };

    const renderTreeItem = (item: EditorFile | EditorFolder, level: number = 0) => {
        const isFolder = 'isExpanded' in item;
        const isFile = !isFolder;
        const isActive = isFile && item.id === activeFileId;

        return (
            <div key={item.id}>
                <div
                    className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 group ${
                        isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    style={{paddingLeft: `${level * 16 + 8}px`}}
                    onClick={() => {
                        if (isFolder) {
                            onFolderToggle(item.id);
                        } else {
                            onFileSelect(item.id);
                        }
                    }}
                >
                    {isFolder ? (
                        (item as EditorFolder).isExpanded ?
                            <FolderOpen className="w-4 h-4 text-blue-500"/> :
                            <Folder className="w-4 h-4 text-blue-500"/>
                    ) : (
                        getFileIcon((item as EditorFile).type)
                    )}

                    <span className={`flex-1 natt text-sm ${isActive ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                        {item.name}
                        {isFile && (item as EditorFile).isModified && (
                            <span className="ml-1 text-orange-500">•</span>
                        )}
                    </span>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isFolder) {
                                    startFolderEditing(item.id, item.name);
                                } else {
                                    startEditing(item.id, item.name);
                                }
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Rename"
                        >
                            <Edit3 className="w-3 h-3 text-gray-500"/>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isFolder) {
                                    onFolderDelete(item.id);
                                } else {
                                    onFileDelete(item.id);
                                }
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3 text-red-500"/>
                        </button>
                    </div>
                </div>

                {isFolder && (item as EditorFolder).isExpanded && (
                    <div>
                        {folders
                            .filter(f => f.parentId === item.id)
                            .map(folder => renderTreeItem(folder, level + 1))}
                        {files
                            .filter(f => f.parentId === item.id)
                            .map(file => renderTreeItem(file, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // File/Folder Modal Component
    const FileFolderModal: React.FC<{
        type: ModalType;
        onClose: () => void;
        onSubmit: (data: { name: string; type?: FileType; parentId?: string }) => void;
        initialData?: { id?: string; name?: string; parentId?: string };
    }> = ({type, onClose, onSubmit, initialData}) => {
        const [name, setName] = useState(initialData?.name || '');
        const [fileType, setFileType] = useState<FileType>('html');

        if (!type) return null;

        const isRename = type === 'renameFile' || type === 'renameFolder';
        const isFileOperation = type === 'createFile' || type === 'renameFile';
        const title = isRename
            ? `Rename ${type === 'renameFile' ? 'File' : 'Folder'}`
            : `Create New ${type === 'createFile' ? 'File' : 'Folder'}`;

        const getFileExtension = (fileType: FileType) => {
            switch (fileType) {
                case 'html':
                    return '.html';
                case 'css':
                    return '.css';
                case 'javascript':
                    return '.js';
                case 'typescript':
                    return '.ts';
                case 'json':
                    return '.json';
                case 'markdown':
                    return '.md';
                default:
                    return '';
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (name.trim()) {
                let finalName = name.trim();
                if (type === 'createFile' && !finalName.endsWith(getFileExtension(fileType))) {
                    finalName += getFileExtension(fileType);
                }
                onSubmit({
                    name: finalName,
                    type: isFileOperation ? fileType : undefined,
                    parentId: initialData?.parentId
                });
                onClose();
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">{title}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                        {isFileOperation && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Type
                                </label>
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value as FileType)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="json">JSON</option>
                                    <option value="markdown">Markdown</option>
                                </select>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                            >
                                {isRename ? 'Rename' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Explorer</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            setModalType('createFile');
                            setModalData({});
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="New File"
                    >
                        <FilePlus className="w-4 h-4 text-gray-600"/>
                    </button>
                    <button
                        onClick={() => {
                            setModalType('createFolder');
                            setModalData({});
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="New Folder"
                    >
                        <FolderPlus className="w-4 h-4 text-gray-600"/>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {folders
                    .filter(f => !f.parentId)
                    .map(folder => renderTreeItem(folder, 0))}
                {files
                    .filter(f => !f.parentId)
                    .map(file => renderTreeItem(file, 0))}
            </div>

            <FileFolderModal
                type={modalType}
                onClose={() => setModalType(null)}
                onSubmit={(data) => {
                    if (modalType === 'createFile') {
                        onFileCreate(data);
                    } else if (modalType === 'createFolder') {
                        onFolderCreate(data);
                    } else if (modalType === 'renameFile') {
                        onFileRename(modalData.id!, data.name);
                    } else if (modalType === 'renameFolder') {
                        onFolderRename(modalData.id!, data.name);
                    }
                }}
                initialData={modalData}
            />
        </div>
    );
};

// Save Dialog Component
interface SaveDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (method: 'zip' | 'github' | 'database') => void;
    isLoading: boolean;
}

const SaveDialog: React.FC<SaveDialogProps> = ({isOpen, onClose, onSave, isLoading}) => {
    // Handle ESC key to close save dialog
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
            <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Save Project</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onSave('zip')}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-5 h-5 text-blue-600"/>
                        <div className="text-left">
                            <div className="font-medium">Download as ZIP</div>
                            <div className="text-sm text-gray-500">Save all files to your computer</div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSave('github')}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <Github className="w-5 h-5 text-gray-800"/>
                        <div className="text-left">
                            <div className="font-medium">Push to GitHub</div>
                            <div className="text-sm text-gray-500">Save to connected repository</div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSave('database')}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <Database className="w-5 h-5 text-green-600"/>
                        <div className="text-left">
                            <div className="font-medium">Save to Cloud</div>
                            <div className="text-sm text-gray-500">Store in your account</div>
                        </div>
                    </button>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Code Editor System
const AdvancedCodeEditor: React.FC = () => {
    // Project state
    const [project, setProject] = useState<Project>({
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
    });

    const [activeFileId, setActiveFileId] = useState<string>('html-main');
    const [openFileIds, setOpenFileIds] = useState<string[]>(['html-main', 'css-main', 'js-main']);
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showExplorer, setShowExplorer] = useState<boolean>(true);

    // Unsaved changes warning
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

    // Get file content for preview
    const getFileContent = useCallback((type: FileType): string => {
        const file = project.files.find(f => f.type === type);
        return file?.content || '';
    }, [project.files]);

    // Update file content
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

    // File management functions
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
            <div className="flex items-center gap-2">
                <span>Delete {file.name}?</span>
                <div className="flex gap-2">
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
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
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
            <div className="flex items-center gap-2">
                <span>Delete folder {folder.name} and all its contents?</span>
                <div className="flex gap-2">
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
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
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

    // Close file tab without deleting
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

    // Save functions
    const handleSave = useCallback(async (method: 'zip' | 'github' | 'database') => {
        setIsSaving(true);

        try {
            switch (method) {
                case 'zip':
                    const zip = new JSZip();

                    // Add all files to the ZIP
                    project.files.forEach(file => {
                        const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
                        zip.file(filePath, file.content);
                    });

                    // Add folders to the ZIP
                    project.folders.forEach(folder => {
                        const folderPath = folder.path.startsWith('/') ? folder.path.slice(1) : folder.path;
                        zip.folder(folderPath);
                    });

                    // Generate ZIP and trigger download
                    const content = await zip.generateAsync({type: 'blob'});
                    const url = URL.createObjectURL(content);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${project.name}.zip`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Project saved as ZIP');
                    break;

                case 'github':
                    // Mock GitHub push
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    console.log('Pushing to GitHub...');
                    toast.success('Project pushed to GitHub');
                    break;

                case 'database':
                    // Mock database save
                    await new Promise(resolve => setTimeout(resolve, 800));
                    console.log('Saving to database...');
                    toast.success('Project saved to cloud');
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
    }, [project]);

    const createNewProject = useCallback(() => {
        if (project.isModified) {
            toast((t) => (
                <div className="flex items-center gap-2">
                    <span>You have unsaved changes. Save before creating a new project?</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                setShowSaveDialog(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                // Create new project
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
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            ), {duration: Infinity});
            return;
        }

        // Create new project
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

    // Preview content
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
    <title>Preview</title>
    <style>
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        try {
            ${js}
        } catch (error) {
            console.error('JavaScript Error:', error);
            document.body.innerHTML += '<div style="color: red; background: #fee; padding: 8px; margin-top: 16px; border-radius: 4px;"><strong>JavaScript Error:</strong> ' + error.message + '</div>';
        }
    </script>
</body>
</html>
        `.trim();
    }, [getFileContent]);

    const activeFile = project.files.find(f => f.id === activeFileId);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <Toaster position="top-right"/>
            {/* Header */}
            <header
                className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-gray-800">
                        {project.name}
                        {project.isModified && <span className="ml-2 text-sm text-orange-500">• Unsaved</span>}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={createNewProject}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            New Project
                        </button>
                        <button
                            onClick={() => setShowExplorer(!showExplorer)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            {showExplorer ? 'Hide' : 'Show'} Explorer
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        title={`Switch to ${viewMode === 'desktop' ? 'mobile' : 'desktop'} preview`}
                    >
                        {viewMode === 'desktop' ? <Smartphone className="w-5 h-5"/> : <Monitor className="w-5 h-5"/>}
                    </button>

                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`p-2 rounded-md transition-colors ${
                            showPreview
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Toggle preview"
                    >
                        <Play className="w-5 h-5"/>
                    </button>

                    <button
                        onClick={() => setShowSaveDialog(true)}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4"/>
                        Save
                    </button>

                    <button
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5"/>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* File Explorer */}
                {showExplorer && (
                    <div className="flex-shrink-0 w-64 bg-white border-r border-gray-200">
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

                {/* Editor and Preview */}
                <div className="flex-1 flex">
                    {/* Code Editor */}
                    <div
                        className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col bg-white border-r border-gray-200`}>
                        {/* Tab Bar */}
                        <div
                            className="flex-shrink-0 flex items-center bg-gray-50 border-b border-gray-200 overflow-x-auto">
                            {project.files.filter(file => openFileIds.includes(file.id)).map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => setActiveFileId(file.id)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200 whitespace-nowrap group ${
                                        file.id === activeFileId
                                            ? 'bg-white text-blue-700 border-b-2 border-blue-500'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                                >
                                    {file.name}
                                    {file.isModified && <span className="text-orange-500">•</span>}
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeFileTab(file.id);
                                        }}
                                        className="ml-1 p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
                                        title="Close file"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                                closeFileTab(file.id);
                                            }
                                        }}
                                    >
                                        <X className="w-3 h-3"/>
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Editor */}
                        <div className="flex-1">
                            {activeFile ? (
                                <MonacoEditor
                                    value={activeFile.content}
                                    language={activeFile.type}
                                    onChange={(content) => updateFileContent(activeFile.id, content)}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <Code className="w-12 h-12 mx-auto mb-4 text-gray-300"/>
                                        <p>No file selected</p>
                                        <p className="text-sm">Select a file from the explorer to start editing</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="w-1/2 flex flex-col bg-white">
                            <div
                                className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        {viewMode === 'desktop' ? 'Desktop' : 'Mobile'} View
                                    </span>
                                    <button
                                        onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title={`Switch to ${viewMode === 'desktop' ? 'mobile' : 'desktop'} view`}
                                    >
                                        {viewMode === 'desktop' ? <Smartphone className="w-4 h-4"/> :
                                            <Monitor className="w-4 h-4"/>}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-4 bg-gray-100 overflow-auto">
                                <div className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${
                                    viewMode === 'mobile' ? 'max-w-sm' : 'w-full'
                                }`}>
                                    <iframe
                                        srcDoc={previewContent}
                                        className={`w-full border-0 ${
                                            viewMode === 'mobile' ? 'h-96' : 'h-full min-h-96'
                                        }`}
                                        title="Preview"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <footer
                className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-100 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                    <span>
                        {project.files.length} file{project.files.length !== 1 ? 's' : ''}
                    </span>
                    {activeFile && (
                        <span>
                            {activeFile.type.toUpperCase()} • {activeFile.name}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {project.isModified && (
                        <div className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="w-4 h-4"/>
                            <span>Unsaved changes</span>
                        </div>
                    )}
                    <span>Last modified: {project.lastModified.toLocaleTimeString()}</span>
                </div>
            </footer>

            {/* Save Dialog */}
            <SaveDialog
                isOpen={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                onSave={handleSave}
                isLoading={isSaving}
            />
        </div>
    );
};

export default AdvancedCodeEditor;