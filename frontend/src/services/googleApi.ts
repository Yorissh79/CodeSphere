import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
    id: string;
    name: string;
    email: string;
}

interface RegisterResponse {
    message: string;
    user: User;
}

interface LoginResponse {
    message: string;
    user: User;
}

interface RegisterRequest {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role?: string;
    surname?: string;
    group?: string;
}

interface LoginRequest {
    email: string;
    googleId: string;
}

export const googleApi = createApi({
    reducerPath: 'googleApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/',
        credentials: 'include', // Include cookies for JWT
    }),
    endpoints: (builder) => ({
        userSignup: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (data) => ({
                url: '/register',
                method: 'POST',
                body: data,
            }),
        }),
        userCreate: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (data) => ({
                url: '/gUser',
                method: 'POST',
                body: data,
            }),
        }),
        userGLogin: builder.mutation<LoginResponse, LoginRequest>({
            query: (data) => ({
                url: '/login',
                method: 'POST',
                body: data,
            }),
        }),
        userGTeacherLogin: builder.mutation<LoginResponse, LoginRequest>({
            query: (data) => ({
                url: '/login',
                method: 'POST',
                body: data,
            }),
        }),
        userLogout: builder.mutation<void, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
        }),
        getUser: builder.query<User, void>({
            query: () => '/user',
        }),
        getAllUsers: builder.query<User[], void>({
            query: () => '/users',
        }),
    }),
});

export const {
    useUserSignupMutation,
    useUserCreateMutation,
    useUserGLoginMutation,
    useUserGTeacherLoginMutation,
    useUserLogoutMutation,
    useGetUserQuery,
    useGetAllUsersQuery,
} = googleApi;