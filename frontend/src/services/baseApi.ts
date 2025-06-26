// api/baseApi.ts
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

// Define your base API slice
export const baseApi = createApi({
    // The unique string that will be used as the reducer path.
    reducerPath: 'apis',
    // `fetchBaseQuery` is a lightweight wrapper around fetch that sets up the base URL and headers
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/apis',
        credentials: 'include',
        prepareHeaders: (headers) => {
            // Add any common headers here, e.g., for authentication
            // const token = localStorage.getItem('token');
            // if (token) {
            //     headers.set('authorization', `Bearer ${token}`);
            // }
            return headers;
        },
    }),
    refetchOnFocus: true,
    // `tagTypes` are used for caching and invalidation
    tagTypes: ['Task', 'Submission'],
    endpoints: () => ({}), // Endpoints will be injected by other API slices
});
