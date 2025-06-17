export const QuestionTypes = [
    {label: "Multiple Choice", value: "mcq", icon: "📋"},
    {label: "True/False", value: "truefalse", icon: "✓"},
    {label: "Short Answer", value: "short", icon: "📝"},
] as const;

export type QuestionType = "mcq" | "truefalse" | "short";

export interface QuestionPayload {
    quizId: string;
    type: QuestionType;
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

export interface ImportedQuestion {
    type: QuestionType;
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

export interface Question {
    _id: string;
    type: QuestionType;
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

export interface Quiz {
    _id: string;
    title: string;
    timeLimit: number;
    opened: boolean;
}