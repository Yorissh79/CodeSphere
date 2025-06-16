import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

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
    _id?: string;
    studentId: string;
    quizId: string;
    questionId: string;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
}

export const answerApi = createApi({
    reducerPath: 'answerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/quiz/',
        credentials: 'include',
    }),
    tagTypes: ['Answers'],
    endpoints: (builder) => ({
        submitAnswers: builder.mutation<void, AnswerPayload[]>({
            query: (answers) => ({
                url: "/answers",
                method: "POST",
                body: answers,
            }),
            invalidatesTags: ['Answers'],
        }),
        getQuizAnswers: builder.query<AnswerPayload[], string>({
            query: (quizId) => ({
                url: `/answers/quiz/${quizId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, quizId) => [{type: 'Answers', id: quizId}],
        }),
    }),
});

export const {useSubmitAnswersMutation, useGetQuizAnswersQuery} = answerApi;