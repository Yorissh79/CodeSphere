export interface Answer {
    questionId: string;
    selectedOption?: number;
    shortAnswer?: string;
    timeSpent: number;
    changedCount: number;
    startTime: number;
}

export interface Question {
    _id: string;
    questionText: string;
    type: "mcq" | "truefalse" | "short";
    options?: string[];
}

export interface Quiz {
    _id: string;
    title: string;
    timeLimit: number;
    opened: boolean;
}