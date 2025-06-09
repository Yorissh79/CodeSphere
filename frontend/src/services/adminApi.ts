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
    group: string;
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

export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/admin/',
        credentials: 'include',
    }),
    refetchOnFocus: true,
    endpoints: (builder) => ({
        adminLogin: builder.mutation<LoginResponse, LoginRequest>({
            query: (newPost) => ({
                url: 'login',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newPost,
            }),
        }),
        adminSignup: builder.mutation<SignupResponse, SignupRequest>({
            query: (newPost) => ({
                url: 'create',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newPost,
            }),
        }),
        adminLogout: builder.mutation<void, void>({
            query: () => ({
                url: 'logout',
                method: 'POST',
                credentials: 'include',
            }),
        }),

    }),
});

export const { useAdminLoginMutation, useAdminSignupMutation, useAdminLogoutMutation } = adminApi;
