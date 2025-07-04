// import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
// // import type {Comment, CreateCommentRequest, UpdateCommentRequest, CommentStats} from '../types/api';
//
// export const commentApi = createApi({
//     reducerPath: 'http://localhost:3001/commentApi',
//     baseQuery: fetchBaseQuery({
//         baseUrl: '/api',
//         credentials: 'include',
//         prepareHeaders: (headers, {getState}) => {
//             const token = (getState() as any).auth?.token;
//             if (token) {
//                 headers.set('authorization', `Bearer ${token}`);
//             }
//             return headers;
//         },
//     }),
//     tagTypes: ['Comment', 'CommentStats'],
//     endpoints: (builder) => ({
//         // Create comment
//         createComment: builder.mutation<Comment, { submissionId: string } & CreateCommentRequest>({
//             query: ({submissionId, ...data}) => ({
//                 url: `/comments/${submissionId}`,
//                 method: 'POST',
//                 body: data,
//             }),
//             invalidatesTags: ['Comment'],
//         }),
//
//         // Get comments by submission
//         getCommentsBySubmission: builder.query<Comment[], string>({
//             query: (submissionId) => `/comments/submission/${submissionId}`,
//             providesTags: ['Comment'],
//         }),
//
//         // Update comment
//         updateComment: builder.mutation<Comment, { id: string } & UpdateCommentRequest>({
//             query: ({id, ...data}) => ({
//                 url: `/comments/${id}`,
//                 method: 'PUT',
//                 body: data,
//             }),
//             invalidatesTags: (_result, _error, {id}) => [{type: 'Comment', id}],
//         }),
//
//         // Delete comment
//         deleteComment: builder.mutation<void, string>({
//             query: (id) => ({
//                 url: `/comments/${id}`,
//                 method: 'DELETE',
//             }),
//             invalidatesTags: (_result, _error, id) => [{type: 'Comment', id}],
//         }),
//
//         // Get comments by author
//         getCommentsByAuthor: builder.query<Comment[], void>({
//             query: () => '/comments/author',
//             providesTags: ['Comment'],
//         }),
//
//         // Get comment stats (Teacher/Admin only)
//         getCommentStats: builder.query<CommentStats, void>({
//             query: () => '/comments/stats',
//             providesTags: ['CommentStats'],
//         }),
//     }),
// });
//
// export const {
//     useCreateCommentMutation,
//     useGetCommentsBySubmissionQuery,
//     useUpdateCommentMutation,
//     useDeleteCommentMutation,
//     useGetCommentsByAuthorQuery,
//     useGetCommentStatsQuery,
// } = commentApi;