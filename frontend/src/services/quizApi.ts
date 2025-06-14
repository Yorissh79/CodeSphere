import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Quiz {
    _id: string;
    title: string;
    createdAt: string;
}

interface CreateQuizRequest {
    title: string;
}

interface CreateQuizResponse {
    message: string;
    quiz: Quiz;
}

interface GetQuizWithQuestionsResponse {
    quiz: Quiz;
    questions: any[]; // You can strongly type this if you have a `Question` interface
}

export const quizApi = createApi({
    reducerPath: 'quizApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/quiz/',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        createQuiz: builder.mutation<CreateQuizResponse, CreateQuizRequest>({
            query: (quizData) => ({
                url: 'create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: quizData,
            }),
        }),
        getAllQuizzes: builder.query<Quiz[], void>({
            query: () => 'all',
        }),
        getQuizWithQuestions: builder.query<GetQuizWithQuestionsResponse, string>({
            query: (id) => `${id}`,
        }),
        deleteQuiz: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useCreateQuizMutation,
    useGetAllQuizzesQuery,
    useGetQuizWithQuestionsQuery,
    useDeleteQuizMutation,
} = quizApi;
