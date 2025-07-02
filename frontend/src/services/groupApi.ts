import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export interface Group {
    _id: string;
    teachers: string[];
    group: string;
    date: string;
}

interface CreateGroupRequest {
    teachers: string[];
    group: string;
}

interface UpdateGroupRequest {
    _id: string;
    teachers?: string[];
    group?: string;
}

interface UpdateGroupResponse {
    message: string;
    group: Group;
}

interface DeleteGroupResponse {
    message: string;
    group: Group;
}

export const groupApi = createApi({
    reducerPath: 'groupApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/group/',
        credentials: 'include',
    }),
    tagTypes: ['Group'],
    refetchOnFocus: true,
    endpoints: (builder) => ({
        getAllGroups: builder.query({
            query: (params = {}) => {
                const queryString = new URLSearchParams(params).toString();
                return `/gets?${queryString}`;
            },
        }),
        createGroup: builder.mutation<Group, CreateGroupRequest>({
            query: (data) => ({
                url: '/create',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: data,
            }),
            invalidatesTags: ['Group'],
        }),
        updateGroup: builder.mutation<UpdateGroupResponse, UpdateGroupRequest>({
            query: ({_id, ...data}) => ({
                url: `/update/${_id}`,
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: data,
            }),
            invalidatesTags: ['Group'],
        }),
        deleteGroup: builder.mutation<DeleteGroupResponse, string>({
            query: (id) => ({
                url: `/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Group'],
        }),
    }),
});

export const {
    useGetAllGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
} = groupApi;
