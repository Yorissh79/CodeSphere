// components/FileExplorer.tsx
import React, {useState, useEffect} from 'react';
import {
    FileText, Palette, Code, Database, FolderPlus, FilePlus,
    Edit3, Trash2, Folder, FolderOpen, X
} from 'lucide-react';
import type {EditorFile, EditorFolder, FileType, ModalType} from './types'; // Adjust path as needed

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

export default FileExplorer;