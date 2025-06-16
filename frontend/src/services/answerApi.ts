import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Question {
    _id: string;
    type: "mcq" | "truefalse" | "short";
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
}

export interface Quiz {
    _id: string;
    title: string;
    timeLimit: number;
    questions: Question[];
}

export interface AnswerPayload {
    studentId: string;
    quizId: string;
    questionId: string;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
}

export const quizApi = createApi({
    reducerPath: 'quizApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/quiz/',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        submitAnswers: builder.mutation<void, AnswerPayload[]>({
            query: (answers) => ({
                url: "/answers",
                method: "POST",
                body: answers,
            }),
        }),
    }),
});

export const { useSubmitAnswersMutation } = quizApi;