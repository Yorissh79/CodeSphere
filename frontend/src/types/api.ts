// types/api.ts
export interface Task {
    _id: string;
    title: string;
    description: string;
    teacherId: {
        _id: string;
        name: string;
        surname: string;
        email: string;
    };
    assignedGroups: string[];
    attachments: {
        type: 'text' | 'image' | 'link';
        content: string;
        filename?: string;
        originalName?: string;
    }[];
    deadline: string; // ISO date string
    allowLateSubmission: string;
    maxPoints: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string; // For frontend compatibility
    submissionCount?: number; // Optional, may be added by backend
    totalStudents?: number; // Optional, may be added by backend
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
}

export interface CreateTaskRequest {
    title: string;
    description: string;
    teacherId: string;
    assignedGroups: string[];
    attachments: File[];
    deadline: Date;
    allowLateSubmission: boolean;
    maxPoints: number;
}

export interface Submission {
    _id: string;
    taskId: string;
    studentId: {
        _id: string;
        name: string;
        surname: string;
        email: string;
        group: string;
    };
    githubUrl: string;
    isLate: boolean;
    submittedAt: string;
    points?: string;
    feedback?: string;
    status?: string;
}

export interface GradeSubmissionRequest {
    points: number;
    feedback?: string;
}