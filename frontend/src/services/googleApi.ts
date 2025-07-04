import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export interface User {
    googleId?: string;
    id: string;
    name: string;
    email: string;
    role: string;
    surname?: string;
    group?: string;
}

interface AuthResponse {
    token: any;
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

// New interface for Google auth check response
interface GoogleAuthCheckResponse {
    isAuthenticated: boolean;
    isGoogleAuth: boolean;
    message?: string;
    user?: User;
}

export const googleApi = createApi({
    reducerPath: 'googleApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/google',
        credentials: 'include', // Include cookies for JWT
        prepareHeaders: (headers) => {
            // Add authorization header if token exists
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'Auth'],
    endpoints: (builder) => ({
        // GET /google/check-google-auth - Check if user is authenticated via Google using cookie
        checkGoogleAuth: builder.query<GoogleAuthCheckResponse, void>({
            query: () => '/check-google-auth',
            providesTags: ['Auth'],
            // Keep the result cached for 5 minutes
            keepUnusedDataFor: 300,
        }),

        // POST /google/register - Create a new user with optional Google integration
        userSignup: builder.mutation<AuthResponse, RegisterRequest>({
            query: (data) => ({
                url: '/register',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User', 'Auth'],
        }),

        // POST /google/verify - Verify Google ID token (for client-side integration)
        verifyGoogleToken: builder.mutation<AuthResponse, GoogleTokenRequest>({
            query: (data) => ({
                url: '/verify',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User', 'Auth'],
        }),

        // POST /google/logout - Logout user
        userLogout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Auth'],
        }),

        // GET /google/user - Get current authenticated user
        getCurrentUser: builder.query<User, void>({
            query: () => '/user',
            providesTags: ['User'],
        }),

        // GET /google/users - Get all users (admin only)
        getAllUsers: builder.query<GetAllUsersResponse, void>({
            query: () => '/users',
            providesTags: ['User'],
        }),

        // GET /google/protected - Example protected route
        getProtectedData: builder.query<{ message: string; user: User }, void>({
            query: () => '/protected',
            providesTags: ['User'],
        }),
    }),
});

export const {
    useCheckGoogleAuthQuery,
    useUserSignupMutation,
    useVerifyGoogleTokenMutation,
    useUserLogoutMutation,
    useGetCurrentUserQuery,
    useGetAllUsersQuery,
    useGetProtectedDataQuery,
} = googleApi;

// Additional custom hooks for better usage patterns
export const useGoogleAuthStatus = () => {
    const {data, error, isLoading, refetch} = useCheckGoogleAuthQuery();

    return {
        isAuthenticated: data?.isAuthenticated ?? false,
        isGoogleAuth: data?.isGoogleAuth ?? false,
        user: data?.user,
        isLoading,
        error,
        refetch,
    };
};

// Hook for conditional rendering based on Google auth status
export const useIsGoogleAuthenticated = () => {
    const {data} = useCheckGoogleAuthQuery();
    return data?.isAuthenticated && data?.isGoogleAuth;
};