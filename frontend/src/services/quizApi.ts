import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

interface Quiz {
    _id: string;
    title: string;
    createdAt?: string;
    description?: string;
    tags?: string[];
    timeLimit: number;
    opened?: boolean;
}

interface CreateQuizRequest {
    title: string;
    timeLimit?: number;
    description?: string;
    tags?: string[];
    opened: boolean;
}

interface UpdateQuizRequest {
    id: string;
    title?: string;
    timeLimit?: number;
    description?: string;
    tags?: string[];
    opened?: boolean;
}

interface CreateQuizResponse {
    message: string;
    quiz: Quiz;
}

interface UpdateQuizResponse {
    message: string;
    quiz: Quiz;
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
        getQuizById: builder.query<Quiz, string>({
            query: (id) => `${id}/basic`,
        }),
        updateQuiz: builder.mutation<UpdateQuizResponse, UpdateQuizRequest>({
            query: ({id, ...quizData}) => ({
                url: `update/${id}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: quizData,
            }),
        }),
        deleteQuiz: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `${id}`,
                method: 'DELETE',
            }),
        }),
        checkQuizSubmission: builder.query<{ hasSubmitted: boolean }, { studentId: string; quizId: string }>({
            query: ({studentId, quizId}) => ({
                url: `/answers/check?studentId=${studentId}&quizId=${quizId}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useCreateQuizMutation,
    useGetAllQuizzesQuery,
    useGetQuizByIdQuery,
    useCheckQuizSubmissionQuery,
    useUpdateQuizMutation,
    useDeleteQuizMutation,
} = quizApi;