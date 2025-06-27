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

        // Configure Monaco themes
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

        monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [
                {token: 'comment', foreground: '008000'},
                {token: 'keyword', foreground: '0000FF'},
                {token: 'string', foreground: 'A31515'},
                {token: 'number', foreground: '098658'},
            ],
            colors: {
                'editor.background': '#FFFFFF',
                'editor.foreground': '#000000',
                'editorLineNumber.foreground': '#2B91AF',
                'editor.selectionBackground': '#ADD6FF',
                'editor.inactiveSelectionBackground': '#E5EBF1',
            }
        });

        // Set theme based on darkMode
        monaco.editor.setTheme('custom-dark');

        // Set up auto-completion for HTML
        if (language === 'html') {
            monaco.languages.setLanguageConfiguration('html', {
                autoClosingPairs: [
                    {open: '<', close: '>'},
                    {open: '"', close: '"'},
                    {open: "'", close: "'"},
                ],
                surroundingPairs: [
                    {open: '<', close: '>'},
                    {open: '"', close: '"'},
                    {open: "'", close: "'"},
                ]
            });
            monaco.languages.registerCompletionItemProvider('html', {
                triggerCharacters: ['!'],
                provideCompletionItems: (model: { getLineContent: (arg0: any) => any }, position: {
                    lineNumber: any;
                    column: number;
                }) => {
                    const line = model.getLineContent(position.lineNumber);
                    const textBeforeCursor = line.substring(0, position.column - 1);

                    let range;
                    if (textBeforeCursor.endsWith('!')) {
                        const startColumn = position.column - '!'.length;
                        range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: startColumn,
                            endColumn: position.column
                        };
                    } else {
                        range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        };
                    }

                    const suggestions = [
                        {
                            label: '!',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    $0\n</body>\n</html>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML5 DOCTYPE template',
                            range: range
                        },
                        {
                            label: 'div',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<div>\n\t$0\n</div>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML div element',
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('div') ? 'div'.length : 0),
                                endColumn: position.column
                            }
                        },
                        {
                            label: 'button',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<button>$0</button>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML button element',
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
                provideCompletionItems: (model: { getLineContent: (arg0: any) => any }, position: {
                    lineNumber: any;
                    column: number;
                }) => {
                    const line = model.getLineContent(position.lineNumber);
                    const textBeforeCursor = line.substring(0, position.column - 1);

                    const suggestions = [
                        {
                            label: 'flexbox-center',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'display: flex;\njustify-content: center;\nalign-items: center;',
                            documentation: 'Flexbox centering',
                            range: {
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
                            range: {
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
        <Editor
            height="100%"
            width="100%"
            language={getMonacoLanguage(language)}
            value={value}
            onChange={handleEditorChange}
            options={defaultOptions}
            onMount={handleEditorDidMount}
            loading={
                <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-300">Loading Editor...</span>
                </div>
            }
        />
    );
};

// File Explorer Component
interface FileExplorerProps {
    files: EditorFile[];
    folders: EditorFolder[];
    activeFileId: string;
    onFileSelect: (fileId: string) => void;
    onFileCreate: (data: { name: string; parentId?: string; type?: FileType }) => void;
    onFolderCreate: (data: { name: string; parentId?: string }) => void;
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
                return <Database className="w-4 h-4 text-gray-500"/>;
            case 'markdown':
                return <FileText className="w-4 h-4 text-green-500"/>;
            default:
                return <FileText className="w-4 h-4 text-gray-500"/>;
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
            <div key={item.id} className="select-none">
                <div
                    className={`flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        isActive ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    style={{paddingLeft: `${level * 1.5}rem`}}
                    onClick={() => {
                        if (isFolder) {
                            onFolderToggle(item.id);
                        } else {
                            onFileSelect(item.id);
                        }
                    }}
                >
                    <div className="flex items-center gap-2">
                        {isFolder ? (
                            (item as EditorFolder).isExpanded ? (
                                <FolderOpen className="w-4 h-4 text-yellow-500"/>
                            ) : (
                                <Folder className="w-4 h-4 text-yellow-500"/>
                            )
                        ) : (
                            getFileIcon((item as EditorFile).type)
                        )}
                        <span className="truncate">{item.name}</span>
                        {isFile && (item as EditorFile).isModified && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isFolder) {
                                    startFolderEditing(item.id, item.name);
                                } else {
                                    startEditing(item.id, item.name);
                                }
                            }}
                            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                            title="Rename"
                        >
                            <Edit3 className="w-3 h-3 text-gray-600 dark:text-gray-300"/>
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
                            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3 text-gray-600 dark:text-gray-300"/>
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
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
                        <button onClick={onClose}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                                autoFocus
                            />
                        </div>
                        {isFileOperation && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File
                                    Type</label>
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value as FileType)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
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
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <div className="h-full bg-gray-100 dark:bg-gray-900">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Explorer</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setModalType('createFile');
                            setModalData({});
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="New File"
                    >
                        <FilePlus className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                    </button>
                    <button
                        onClick={() => {
                            setModalType('createFolder');
                            setModalData({});
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="New Folder"
                    >
                        <FolderPlus className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                    </button>
                </div>
            </div>
            <div className="p-2">
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
                    project.files.forEach(file => {
                        const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
                        zip.file(filePath, file.content);
                    });
                    project.folders.forEach(folder => {
                        const folderPath = folder.path.startsWith('/') ? folder.path.slice(1) : folder.path;
                        zip.folder(folderPath);
                    });
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
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    console.log('Pushing to GitHub...');
                    toast.success('Project pushed to GitHub');
                    break;

                case 'database':
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

    return (
        <div className={`h-screen flex flex-col`}>
            <Toaster position="top-right"/>
            {/* Header */}
            <header
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {project.name}
                        {project.isModified &&
                            <span className="text-sm text-gray-500 dark:text-gray-400"> • Unsaved</span>}
                    </h1>
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
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                        <Settings className="w-5 h-5"/>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden bg-gray-100 dark:bg-gray-900">
                {/* File Explorer */}
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

                {/* Editor and Preview */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Code Editor */}
                    <div className={`flex-1 flex flex-col ${showPreview ? 'w-1/2' : 'w-full'}`}>
                        {/* Tab Bar */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            {project.files.filter(file => openFileIds.includes(file.id)).map(file => (
                                <div
                                    key={file.id}
                                    onClick={() => setActiveFileId(file.id)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200 dark:border-gray-700 whitespace-nowrap group ${
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
                                            closeFileTab(file.id);
                                        }}
                                        className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
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
                                        <X className="w-3 h-3 text-gray-600 dark:text-gray-300"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Editor */}
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
                    {/* Preview Panel */}
                    {showPreview && (
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
                    )}
                </div>
            </main>

            {/* Status Bar */}
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