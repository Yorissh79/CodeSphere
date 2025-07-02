import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface Teacher {
    _id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
}

interface SignupRequest {
    name: any;
    surname: string;
    email: string;
    role: string;
    password: string;
}

interface SignupResponse {
    message: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

interface UpdateTeacherRequest {
    _id: string;
    name?: string;
    surname?: string;
    email?: string;
    role?: string;
}

interface UpdateTeacherResponse {
    message: string;
    user: {
        id: string;
        name: string;
        surname: string;
        email: string;
        role: string;
    };
}

export const teacherApi = createApi({
    reducerPath: 'teacherApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/teacher/',
        credentials: 'include',
    }),
    refetchOnFocus: true,
    endpoints: (builder) => ({
        teacherLogin: builder.mutation<LoginResponse, LoginRequest>({
            query: (newPost) => ({
                url: 'login',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newPost,
            }),
        }),
        teacherSignup: builder.mutation<SignupResponse, SignupRequest>({
            query: (newPost) => ({
                url: 'create',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newPost,
            }),
        }),
        teacherLogout: builder.mutation<void, void>({
            query: () => ({
                url: 'logout',
                method: 'POST',
                credentials: 'include',
            }),
        }),
        getAllTeachers: builder.query({
            query: (params = {}) => {
                const queryString = new URLSearchParams(params).toString();
                return `/gets?${queryString}`;
            },
        }),
        updateTeacher: builder.mutation<UpdateTeacherResponse, UpdateTeacherRequest>({
            query: ({_id, ...data}) => ({
                url: `update/${_id}`,
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: data,
            }),
        }),
        deleteTeacher: builder.mutation<{ message: string; user: Teacher }, string>({
            query: (id) => ({
                url: `/delete/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useTeacherLoginMutation,
    useTeacherSignupMutation,
    useTeacherLogoutMutation,
    useGetAllTeachersQuery,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation
} = teacherApi;
