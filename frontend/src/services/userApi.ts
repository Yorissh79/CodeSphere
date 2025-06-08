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

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/user/',
        credentials: 'include',
    }),
    refetchOnFocus: true,
    endpoints: (builder) => ({
        userLogin: builder.mutation<LoginResponse, LoginRequest>({
            query: (newPost) => ({
                url: 'login',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newPost,
            }),
        }),
        userSignup: builder.mutation<SignupResponse, SignupRequest>({
            query: (newPost) => ({
                url: 'create',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newPost,
            }),
        }),
        userLogout: builder.mutation<SignupResponse, SignupRequest>({
            query: (newPost) => ({
                url: 'logout',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newPost,
            }),
        }),
    }),
});

export const { useUserLoginMutation, useUserSignupMutation, useUserLogoutMutation } = userApi;
