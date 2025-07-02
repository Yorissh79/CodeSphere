// types.ts
export type FileType = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown';
export type ViewMode = 'desktop' | 'mobile';
export type ModalType = 'createFile' | 'createFolder' | 'renameFile' | 'renameFolder' | null;

export interface EditorFile {
    id: string;
    name: string;
    type: FileType;
    content: string;
    path: string;
    isModified: boolean;
    parentId?: string;
}

export interface EditorFolder {
    id: string;
    name: string;
    path: string;
    parentId?: string;
    isExpanded: boolean;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    files: EditorFile[];
    folders: EditorFolder[];
    lastModified: Date;
    isModified: boolean;
}