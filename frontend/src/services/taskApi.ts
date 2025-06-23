import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {z} from 'zod';

// Define interfaces based on taskController schemas
interface Attachment {
    type: 'text' | 'image' | 'link';
    content: string;
    filename?: string;
    originalName?: string;
}

interface Task {
    _id: string;
    title: string;
    description: string;
    teacherId: {
        _id: string;
        name: string;
        surname: string;
        email: string;
    };
    assignedGroups: string[];
    attachments: Attachment[];
    deadline: string;
    allowLateSubmission: boolean;
    maxPoints: number;
    createdAt: string;
    updatedAt: string;
    submissionCount: number;
    totalStudents: number;
    dueDate: string;
}

interface CreateTaskInput {
    title: string;
    description: string;
    assignedGroups: string[];
    deadline: string;
    allowLateSubmission: boolean;
    maxPoints: string;
    attachments?: Attachment[];
}

interface GetTasksQuery {
    page?: string;
    limit?: string;
    group?: string;
    teacherId?: string;
    status?: 'active' | 'expired';
    sortBy?: 'createdAt' | 'deadline' | 'title';
    sortOrder?: 'asc' | 'desc';
}

interface GetTasksResponse {
    tasks: Task[];
    pagination: {
        page: string;
        limit: string;
        total: number;
        pages: number;
    };
}

// Zod schemas from taskController for runtime validation
const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    assignedGroups: z.array(z.string()).min(1, 'At least one group must be assigned'),
    deadline: z.string().datetime(),
    allowLateSubmission: z.boolean(),
    maxPoints: z.string().refine(
        (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0,
        {
            message: 'Points must be a valid non-negative number',
        }
    ),
    attachments: z
        .array(
            z.object({
                type: z.enum(['text', 'image', 'link']),
                content: z.string(),
                filename: z.string().optional(),
                originalName: z.string().optional(),
            })
        )
        .optional(),
});

const getTasksQuerySchema = z.object({
    page: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val >= 1, {message: 'Page must be at least 1'})
        .default('1'),
    limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val >= 1 && val <= 100, {message: 'Limit must be between 1 and 100'})
        .default('10'),
    group: z.string().optional(),
    teacherId: z.string().optional(),
    status: z.enum(['active', 'expired']).optional(),
    sortBy: z.enum(['createdAt', 'deadline', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const taskApi = createApi({
    reducerPath: 'taskApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/tasks/',
        prepareHeaders: (headers) => {
            // Add auth token if needed
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Tasks', 'Task'],
    endpoints: (builder) => ({
        createTask: builder.mutation<{ message: string; task: Task }, CreateTaskInput>({
            query: (taskData) => {
                const validatedData = createTaskSchema.parse(taskData);
                return {
                    url: 'create',
                    method: 'POST',
                    body: validatedData,
                };
            },
            invalidatesTags: ['Tasks'],
        }),

        getAllTasks: builder.query<GetTasksResponse, GetTasksQuery>({
            query: (queryParams) => {
                const validatedParams = getTasksQuerySchema.parse(queryParams);
                return {
                    url: '/',
                    params: validatedParams,
                };
            },
            providesTags: ['Tasks'],
        }),

        getTaskById: builder.query<{ task: Task }, string>({
            query: (id) => `/${id}`,
            providesTags: (_result, _error, id) => [{type: 'Task', id}],
        }),

        deleteTaskById: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => ['Tasks', {type: 'Task', id}],
        }),

        deleteAllTasks: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: 'delete',
                method: 'DELETE',
            }),
            invalidatesTags: ['Tasks'],
        }),
    }),
});

export const {
    useCreateTaskMutation,
    useGetAllTasksQuery,
    useGetTaskByIdQuery,
    useDeleteTaskByIdMutation,
    useDeleteAllTasksMutation,
} = taskApi;