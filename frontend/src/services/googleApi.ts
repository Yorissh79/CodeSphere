import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export interface User {
    googleId: User | undefined;
    id: string;
    name: string;
    email: string;
    role: string;
    surname?: string;
    group?: string;
}

interface AuthResponse {
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

interface GoogleTokenRequest {
    idToken: string;
}

interface GetAllUsersResponse {
    users: User[];
}

export const googleApi = createApi({
    reducerPath: 'googleApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/google', // Changed from '/google' to '/auth' to match controller routes
        credentials: 'include', // Include cookies for JWT
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // POST /auth/register - Create a new user with optional Google integration
        userSignup: builder.mutation<AuthResponse, RegisterRequest>({
            query: (data) => ({
                url: '/register',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        // POST /auth/google/verify - Verify Google ID token (for client-side integration)
        verifyGoogleToken: builder.mutation<AuthResponse, GoogleTokenRequest>({
            query: (data) => ({
                url: '/verify',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        // POST /auth/logout - Logout user
        userLogout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),

        // GET /auth/user - Get current authenticated user
        getCurrentUser: builder.query<User, void>({
            query: () => '/user',
            providesTags: ['User'],
        }),

        // GET /auth/users - Get all users (admin only)
        getAllUsers: builder.query<GetAllUsersResponse, void>({
            query: () => '/users',
            providesTags: ['User'],
        }),

        // GET /auth/protected - Example protected route
        getProtectedData: builder.query<{ message: string; user: User }, void>({
            query: () => '/protected',
            providesTags: ['User'],
        }),
    }),
});

export const {
    useUserSignupMutation,
    useVerifyGoogleTokenMutation,
    useUserLogoutMutation,
    useGetCurrentUserQuery,
    useGetAllUsersQuery,
    useGetProtectedDataQuery,
} = googleApi;