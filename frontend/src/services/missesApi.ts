import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Miss {
    details: string;
    _id: string;
    student: {
        _id: string;
        name: string;
        email: string;
    };
    miss: number;
    date: string;
}

interface AddMissRequest {
    studentId: string;
    miss: number;
    date?: string;
}

interface AddMissResponse {
    success: boolean;
    message: string;
    data: Miss;
}

interface GetMissesResponse {
    data: Miss[];
}

interface GetAllMissesResponse {
    success: boolean;
    message: string;
    data: Miss[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

interface UpdateMissRequest {
    miss?: number;
    date?: string;
}

interface UpdateMissResponse {
    success: boolean;
    message: string;
    data: Miss;
}

interface DeleteMissResponse {
    success: boolean;
    message: string;
    data: Miss;
}

export const missesApi = createApi({
    reducerPath: 'missesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/misses/',
        credentials: 'include',
    }),
    tagTypes: ['Misses'],
    endpoints: (builder) => ({
        addMiss: builder.mutation<AddMissResponse, AddMissRequest>({
            query: (data) => ({
                url: "add",
                method: "POST",
                credentials: "include",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Misses"],
        }),
        getStudentMisses: builder.query<GetMissesResponse, string>({
            query: (studentId) => `student/${studentId}`,
            providesTags: ['Misses'],
        }),
        getAllMisses: builder.query<GetAllMissesResponse, { page?: number; limit?: number; studentId?: string; startDate?: string; endDate?: string }>({
            query: (params = {}) => {
                const queryString = new URLSearchParams(params as any).toString();
                return `all?${queryString}`;
            },
            providesTags: ['Misses'],
        }),
        updateMiss: builder.mutation<UpdateMissResponse, { missId: string; data: UpdateMissRequest }>({
            query: ({ missId, data }) => ({
                url: `update/${missId}`,
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: data,
            }),
            invalidatesTags: ['Misses'],
        }),
        deleteMiss: builder.mutation<DeleteMissResponse, string>({
            query: (missId) => ({
                url: `delete/${missId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Misses'],
        }),
        getMyMisses: builder.query<GetMissesResponse, void>({
            query: () => ({
                url: 'my',
                method: 'GET',
            }),
            providesTags: ['Misses'],
            transformResponse: (response: GetMissesResponse) => response,
            keepUnusedDataFor: 60,
        }),
    }),
});

export const {
    useAddMissMutation,
    useGetStudentMissesQuery,
    useGetAllMissesQuery,
    useUpdateMissMutation,
    useDeleteMissMutation,
    useGetMyMissesQuery
} = missesApi;