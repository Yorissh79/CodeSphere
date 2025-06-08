import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

interface AuthCheckResponse {
    user: {
        id: string;
        name: string;
        email: string;
        surname: string
        group: string;
        role: string;
    }
    teacher: {
        id: string;
        name: string;
        email: string;
        surname: string
        group: string;
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
    }),
});

export const { useCheckAuthQuery, useCheckTeacherAuthQuery } = authCheck;
