import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export interface AnswerPayload {
    _id?: string;
    studentId: string;
    quizId: string;
    questionId: string;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
    isCorrect?: boolean;
    teacherFeedback?: string;
    reviewed?: boolean;
}

export interface TeacherEvaluation {
    answerId: string;
    isCorrect: boolean;
    teacherFeedback?: string;
}

export const answerApi = createApi({
    reducerPath: "answerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3001/quiz/",
        credentials: "include",
    }),
    tagTypes: ["Answers"],
    endpoints: (builder) => ({
        submitAnswers: builder.mutation<void, AnswerPayload[]>({
            query: (answers) => ({
                url: "/answers",
                method: "POST",
                body: answers,
            }),
            invalidatesTags: ["Answers"],
        }),
        getQuizAnswers: builder.query<AnswerPayload[], string>({
            query: (quizId) => ({
                url: `/answers/quiz/${quizId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, quizId) => [{type: "Answers", id: quizId}],
        }),
        updateTeacherEvaluation: builder.mutation<void, TeacherEvaluation>({
            query: (evaluation) => ({
                url: "/answers/evaluate",
                method: "PUT",
                body: evaluation,
            }),
            invalidatesTags: ["Answers"],
        }),
    }),
});

export const {
    useSubmitAnswersMutation,
    useGetQuizAnswersQuery,
    useUpdateTeacherEvaluationMutation,
} = answerApi;