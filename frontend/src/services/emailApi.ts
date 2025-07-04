// src/services/emailApi.ts
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export interface ContactFormValues {
    name: string;
    email: string;
    message: string;
}

export interface ContactResponse {
    message: string;
}

export const emailApi = createApi({
    reducerPath: 'emailApi',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:3001/'}),
    endpoints: (builder) => ({
        sendContactEmail: builder.mutation<ContactResponse, ContactFormValues>({
            query: (body) => ({
                url: 'api/contact',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {useSendContactEmailMutation} = emailApi;