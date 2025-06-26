import {z} from 'zod';
import {baseApi} from './baseApi';

// Define interfaces based on taskController schemas
export interface Attachment {
    type: 'text' | 'image' | 'link';
    content: string;
    filename?: string;
    originalName?: string;
}

export interface Teacher {
    _id: string;
    name: string;
    surname: string;
    email: string;
}

export interface StudentTask {
    _id: string;
    title: string;
    description: string;
    deadline: string; // ISO date string
    maxPoints: string;
    assignedGroups: string[];
    teacherId: Teacher; // Populated teacher object
    allowLateSubmission: boolean;
    attachments?: Attachment[];
    submissionStatus?: 'submitted' | 'not_submitted' | 'late_submitted'; // This will be derived on the frontend or added by a custom backend endpoint
    submissionId?: string; // ID of the submission if it exists
}

export interface Task {
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

export interface CreateTaskInput {
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

export interface UpdateTaskInput {
    _id: string; // Task ID is required for update
    title?: string;
    description?: string;
    assignedGroups?: string[];
    deadline?: string;
    allowLateSubmission?: boolean;
    maxPoints?: string;
    attachments?: Attachment[]; // All attachment types allowed for update
}

export interface GetAllStudentTasksQueryParams {
    studentId: string;
    groupIds: string[];
    status?: 'all' | 'active' | 'expired';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface GetAllStudentTasksResponse {
    tasks: StudentTask[];
    pagination: {
        page: number;
        limit: number;
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

const updateTaskSchema = z.object({
    _id: z.string(), // Task ID is required
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    assignedGroups: z.array(z.string()).min(1, 'At least one group must be assigned').optional(),
    deadline: z.string().datetime().optional(),
    allowLateSubmission: z.boolean().optional(),
    maxPoints: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, {
        message: 'Points must be a valid non-negative number',
    }).optional(),
    attachments: z
        .array(
            z.object({
                type: z.enum(['text', 'image', 'link', 'file']), // Allow all attachment types for update
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

// Inject endpoints into the baseApi
export const taskApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createTask: builder.mutation<{ message: string; task: Task }, CreateTaskInput>({
            query: (taskData) => {
                const validatedData = createTaskSchema.parse(taskData);
                return {
                    url: 'tasks/create',
                    method: 'POST',
                    body: validatedData,
                };
            },
            invalidatesTags: ['Task'],
        }),

        getAllTasks: builder.query<GetTasksResponse, GetTasksQuery>({
            query: (queryParams) => {
                const validatedParams = getTasksQuerySchema.parse(queryParams);
                return {
                    url: 'tasks/',
                    params: validatedParams,
                };
            },
            providesTags: ['Task'],
        }),

        updateTask: builder.mutation<Task, UpdateTaskInput>({
            query: ({_id, ...patch}) => {
                updateTaskSchema.parse({_id, ...patch});
                return {
                    url: `tasks/${_id}`, // Correct endpoint for update (e.g., /api/tasks/:id)
                    method: 'PUT', // Use PUT for updating a resource
                    body: patch, // Send only the updated fields
                };
            },
            invalidatesTags: (_result, _error, {_id}) => ['Task', {type: 'Task', id: _id}],
        }),

        getTaskById: builder.query<{ task: Task }, string>({
            query: (id) => `tasks/${id}`,
            providesTags: (_result, _error, id) => [{type: 'Task', id}],
        }),

        deleteTaskById: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `tasks/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => ['Task', {type: 'Task', id}],
        }),

        deleteAllTasks: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: 'tasks/delete',
                method: 'DELETE',
            }),
            invalidatesTags: ['Task'],
        }),

        getAllStudentTasks: builder.query<GetAllStudentTasksResponse, GetAllStudentTasksQueryParams>({
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Handle groupIds - convert string to array if needed
                const groupIds = Array.isArray(params.groupIds) ? params.groupIds : [params.groupIds];
                groupIds.forEach(id => {
                    if (id) queryParams.append('groupIds', id);
                });

                // Add optional parameters
                if (params.status) {
                    queryParams.append('status', params.status);
                }
                if (params.sortBy) {
                    queryParams.append('sortBy', params.sortBy);
                }
                if (params.sortOrder) {
                    queryParams.append('sortOrder', params.sortOrder);
                }

                return `/tasks/student?${queryParams.toString()}`;
            },
            providesTags: (result) =>
                result
                    ? [...result.tasks.map(({_id}) => ({type: 'Task' as const, id: _id})), 'Task']
                    : ['Task'],
        }),
    }),
});

export const {
    useCreateTaskMutation,
    useGetAllTasksQuery,
    useUpdateTaskMutation,
    useGetTaskByIdQuery,
    useDeleteTaskByIdMutation,
    useDeleteAllTasksMutation,
    useGetAllStudentTasksQuery,
} = taskApi;