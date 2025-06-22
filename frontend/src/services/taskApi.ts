import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {Task, CreateTaskRequest, Submission, GradeSubmissionRequest} from '../types/api';

export const taskApi = createApi({
    reducerPath: 'taskApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/tasks',
        credentials: 'include',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            console.log('Headers:', headers); // Debug headers
            return headers;
        },
    }),
    tagTypes: ['Task', 'TaskSubmission'],
    endpoints: (builder) => ({
        // Create task (Teacher/Admin only)
        createTask: builder.mutation<Task, CreateTaskRequest>({
            query: (data) => {
                const formData = new FormData();
                formData.append('title', data.title);
                formData.append('description', data.description);
                formData.append('teacherId', data.teacherId);
                data.assignedGroups.forEach((groupId, index) => {
                    formData.append(`assignedGroups[${index}]`, groupId);
                });
                formData.append('deadline', data.deadline.toISOString());
                formData.append('allowLateSubmission', data.allowLateSubmission.toString());
                formData.append('maxPoints', data.maxPoints.toString());
                if (data.attachments && data.attachments.length > 0) {
                    data.attachments.forEach((file) => {
                        formData.append('files', file);
                    });
                }

                console.log('Sending FormData:', [...formData.entries()]); // Debug payload
                return {
                    url: '/create',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Task'],
        }),

        // Get tasks for teacher (Teacher/Admin only)
        getTasksForTeacher: builder.query<Task[], void>({
            query: () => '/teacher',
            providesTags: ['Task'],
        }),

        // Get tasks for student (Student only)
        getTasksForStudent: builder.query<Task[], void>({
            query: () => '/tasks/student',
            providesTags: ['Task'],
        }),

        // Submit task (Student only)
        submitTask: builder.mutation<void, { taskId: string; content: string }>({
            query: (data) => ({
                url: '/submit',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TaskSubmission'],
        }),

        // Grade submission (Teacher/Admin only)
        gradeTaskSubmission: builder.mutation<void, { submissionId: string } & GradeSubmissionRequest>({
            query: ({submissionId, ...data}) => ({
                url: `/grade/${submissionId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TaskSubmission'],
        }),

        // Get task submissions (Teacher/Admin only)
        getTaskSubmissions: builder.query<Submission[], string>({
            query: (taskId) => `/submissions/${taskId}`,
            providesTags: ['TaskSubmission'],
        }),
    }),
});

export const {
    useCreateTaskMutation,
    useGetTasksForTeacherQuery,
    useGetTasksForStudentQuery,
    useSubmitTaskMutation,
    useGradeTaskSubmissionMutation,
    useGetTaskSubmissionsQuery,
} = taskApi;