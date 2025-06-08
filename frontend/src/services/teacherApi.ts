import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

interface SignupRequest {
    name: string;
    email: string;
    password: string;
    surname: string;
    role: string;
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
    }),
});

export const { useTeacherLoginMutation, useTeacherSignupMutation, useTeacherLogoutMutation } = teacherApi;
