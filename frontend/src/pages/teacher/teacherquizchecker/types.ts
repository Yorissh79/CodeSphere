export interface User {
    _id: string;
    name: string;
    surname: string;
    email: string;
    group: string;
    role: string;
}

export interface Question {
    _id: string;
    quizId: string;
    type: 'mcq' | 'truefalse' | 'short';
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

export interface StudentAnswer {
    studentId: string;
    questionId: string;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
    points?: number;
    isCorrect?: boolean;
    feedback?: string;
}

export interface StudentEvaluation {
    studentId: string;
    studentName: string;
    answers: StudentAnswer[];
    totalScore: number;
}

export interface Quiz {
    _id: string;
    title: string;
    timeLimit: number;
    description?: string;
    tags?: string[];
    opened?: boolean;
}

export interface AnswerPayload {
    studentId: string;
    quizId: string;
    questionId: string;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
}