import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Question {
    _id: string;
    quizId: string;
    type: 'mcq' | 'truefalse' | 'short';
    questionText: string;
    options?: string;
    correctAnswerIndex?: number;
}

interface CreateQuestionRequest {
    quizId: string;
    type: 'mcq' | 'truefalse' | 'short';
    questionText: string;
    options?: string;
    correctAnswerIndex?: number;
}

interface CreateQuestionResponse {
    message: string;
    question: Question;
}

export const questionApi = createApi({
    reducerPath: 'questionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/question/',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        createQuestion: builder.mutation<CreateQuestionResponse, CreateQuestionRequest>({
            query: (questionData) => ({
                url: 'create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: questionData,
            }),
        }),
        getQuestionsByQuiz: builder.query<Question[], string>({
            query: (quizId) => `quiz/${quizId}`,
        }),
        deleteQuestion: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useCreateQuestionMutation,
    useGetQuestionsByQuizQuery,
    useDeleteQuestionMutation,
} = questionApi;
