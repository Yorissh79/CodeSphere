import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    _id: string;
    name: string;
    surname: string;
    email: string;
    group: string;
    role: string;
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
    password?: string;
    googleId?: string;
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

interface UpdateUserRequest {
    _id: any;
    name?: string;
    surname?: string;
    email?: string;
    group?: string;
    role?: string;
}

interface UpdateUserResponse {
    message: string;
    user: {
        id: string;
        name: string;
        surname: string;
        email: string;
        group: string;
        role: string;
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
        userLogout: builder.mutation<void, void>({
            query: () => ({
                url: 'logout',
                method: 'POST',
                credentials: 'include',
            }),
        }),
        getAllUsers: builder.query({
            query: (params = {}) => {
                const queryString = new URLSearchParams(params).toString();
                return `/gets?${queryString}`;
            },
        }),
        updateUser: builder.mutation<UpdateUserResponse, UpdateUserRequest>({
            query: ({_id, ...data}) => ({
                url: `update/${_id}`,
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: data,
            }),
        }),
        deleteUser: builder.mutation<{ message: string; user: User }, string>({
            query: (id) => ({
                url: `/delete/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useUserLoginMutation,
    useUserSignupMutation,
    useUserLogoutMutation,
    useGetAllUsersQuery,
    useUpdateUserMutation,
    useDeleteUserMutation
} = userApi;
