// api/submissionApi.ts
import {baseApi} from './baseApi';
import type {Attachment, StudentTask} from './taskApi'; // Import types from taskApi

export interface SubmissionInput {
    taskId: string;
    // studentId: string;
    comments?: string;
    // Attachments will be sent as an array of objects
    attachments?: Attachment[];
}

export interface Submission {
    _id: string;
    taskId: string | StudentTask; // Can be ObjectId or populated Task object
    studentId: string; // Can be ObjectId or populated User object
    comments?: string;
    attachments: Attachment[]; // Array of attachment objects
    submittedAt: string; // ISO Date String
    isLate: boolean;
    points?: number;
    feedback?: string;
    status: 'submitted' | 'graded' | 'returned';
}

interface CreateSubmissionResponse {
    message: string;
    submission: Submission;
}

interface GetSubmissionsResponse {
    message: string;
    submissions: Submission[];
}

interface GetSubmissionByIdResponse {
    message: string;
    submission: Submission;
}

// Extend the base API with submission-related endpoints
export const submissionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new submission
        createSubmission: builder.mutation<CreateSubmissionResponse, SubmissionInput>({
            query: (submissionData) => ({
                url: '/submissions/create',
                method: 'POST',
                body: submissionData,
            }),
            // Invalidate the 'Task' tag to refetch tasks and update their submission status
            invalidatesTags: ['Task'],
        }),

        // Get all submissions (for a student or by task/student ID for instructors/admins)
        // This endpoint can be used with different query parameters for filtering
        getSubmissions: builder.query<GetSubmissionsResponse, {
            taskId?: string;
            studentId?: string;
            status?: string
        }>({
            query: (params) => {
                const queryString = Object.entries(params)
                    .filter(([, value]) => value !== undefined && value !== '')
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&');
                return `/submissions${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: (result, _error, {taskId, studentId}) =>
                result
                    ? [
                        ...result.submissions.map(({_id}) => ({type: 'Submission' as const, id: _id})),
                        {type: 'Submission', id: 'LIST'}, // Tag for the whole list
                        ...(taskId ? [{type: 'Submission' as const, id: `TASK-${taskId}`}] : []),
                        ...(studentId ? [{type: 'Submission' as const, id: `STUDENT-${studentId}`}] : []),
                    ]
                    : [{type: 'Submission', id: 'LIST'}],
        }),

        // Get a single submission by its ID
        getSubmissionById: builder.query<GetSubmissionByIdResponse, string>({
            query: (id) => `/submissions/${id}`,
            providesTags: (_result, _error, id) => [{type: 'Submission', id}],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useCreateSubmissionMutation,
    useGetSubmissionsQuery,
    useGetSubmissionByIdQuery,
} = submissionApi;
