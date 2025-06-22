export interface Task {
    allowLateSubmission: Element;
    maxPoints: number;
    assignedGroups: any;
    submissionCount: number;
    totalStudents: number;
    id: string;
    title: string;
    description: string;
    dueDate: string;
    files?: File[];
    createdAt: string;
    updatedAt: string;
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
    id: string;
    taskId: string;
    studentId: string;
    content: string;
    grade?: number;
    feedback?: string;
    status: 'pending' | 'submitted' | 'graded';
    submittedAt: string;
    gradedAt?: string;
}

export interface CreateSubmissionRequest {
    taskId: string;
    content: string;
}

export interface UpdateSubmissionRequest {
    content?: string;
    status?: 'pending' | 'submitted' | 'graded';
}

export interface GradeSubmissionRequest {
    grade: number;
    feedback?: string;
}

export interface Comment {
    id: string;
    submissionId: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentRequest {
    content: string;
}

export interface UpdateCommentRequest {
    content: string;
}

export interface SubmissionStats {
    totalSubmissions: number;
    pendingSubmissions: number;
    gradedSubmissions: number;
    averageGrade: number;
}

export interface CommentStats {
    totalComments: number;
    commentsThisWeek: number;
    mostActiveSubmission: string;
}