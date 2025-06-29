import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

interface AuthCheckResponse {
    user: {
        _id: string;
        name: string;
        email: string;
        surname: string
        group: string;
        role: string;
        googleId: string;
        picture: string;
        isGoogleUser: boolean;
    }
    teacher: {
        id: string;
        name: string;
        email: string;
        surname: string
        group: string;
        role: string;
    }
    admin: {
        id: string;
        name: string;
        email: string;
        surname: string
        role: string;
    }
}

export const authCheck = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        checkAuth: builder.query<AuthCheckResponse, void>({
            query: () => ({
                url: '/auth/check',
                method: 'GET',
            }),
        }),
        checkTeacherAuth: builder.query<AuthCheckResponse, void>({
            query: () => ({
                url: "/auth/teacher/check",
                method: 'GET',
            }),
        }),
        checkAdminAuth: builder.query<AuthCheckResponse, void>({
            query: () => ({
                url: "/auth/admin/check",
                method: 'GET',
            }),
        }),
    }),
});

export const {useCheckAuthQuery, useCheckTeacherAuthQuery, useCheckAdminAuthQuery} = authCheck;
