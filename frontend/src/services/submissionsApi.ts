import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {
    Submission,
    CreateSubmissionRequest,
    UpdateSubmissionRequest,
    GradeSubmissionRequest,
    SubmissionStats
} from '../types/api';

export const submissionApi = createApi({
    reducerPath: 'http://localhost:3001/submissionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        credentials: 'include',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Submission', 'SubmissionStats'],
    endpoints: (builder) => ({
        // Create submission (Student only)
        createSubmission: builder.mutation<Submission, CreateSubmissionRequest>({
            query: (data) => ({
                url: '/submissions/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Submission'],
        }),

        // Get all submissions
        getSubmissions: builder.query<Submission[], void>({
            query: () => '/submissions',
            providesTags: ['Submission'],
        }),

        // Get submission by ID
        getSubmissionById: builder.query<Submission, string>({
            query: (id) => `/submissions/${id}`,
            providesTags: (_result, _error, id) => [{type: 'Submission', id}],
        }),

        // Update submission
        updateSubmission: builder.mutation<Submission, { id: string } & UpdateSubmissionRequest>({
            query: ({id, ...data}) => ({
                url: `/submissions/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, {id}) => [{type: 'Submission', id}],
        }),

        // Delete submission
        deleteSubmission: builder.mutation<void, string>({
            query: (id) => ({
                url: `/submissions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{type: 'Submission', id}],
        }),

        // Get submissions by task
        getSubmissionsByTask: builder.query<Submission[], string>({
            query: (taskId) => `/submissions/task/${taskId}`,
            providesTags: ['Submission'],
        }),

        // Grade submission (Teacher/Admin only)
        gradeSubmission: builder.mutation<void, { id: string } & GradeSubmissionRequest>({
            query: ({id, ...data}) => ({
                url: `/submissions/grade/${id}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, {id}) => [{type: 'Submission', id}],
        }),

        // Get submission stats (Teacher/Admin only)
        getSubmissionStats: builder.query<SubmissionStats, void>({
            query: () => '/submissions/stats',
            providesTags: ['SubmissionStats'],
        }),
    }),
});

export const {
    useCreateSubmissionMutation,
    useGetSubmissionsQuery,
    useGetSubmissionByIdQuery,
    useUpdateSubmissionMutation,
    useDeleteSubmissionMutation,
    useGetSubmissionsByTaskQuery,
    useGradeSubmissionMutation,
    useGetSubmissionStatsQuery,
} = submissionApi;