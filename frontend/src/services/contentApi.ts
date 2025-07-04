import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

// Interfaces for Content
export interface SeoMetadata {
    pageTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
}

export interface IContentBlock {
    _id: string;
    type: 'text' | 'image';
    order: number;
    content: {
        text?: string;
        imageId?: string;
        altText?: string;
        caption?: string;
    };
    isActive: boolean;
}

export interface Content {
    _id: string;
    pageType: string;
    title: string;
    content: string;
    isActive: boolean;
    seoMetadata?: SeoMetadata; // Added seoMetadata
    richContent?: IContentBlock[]; // Added richContent
}

interface GetContentByTypeResponse extends Content {
}

interface UpdateContentRequest {
    pageType: string;
    title?: string;
    content?: string;
    isActive?: boolean;
    seoMetadata?: SeoMetadata; // Added seoMetadata to update request
    richContent?: IContentBlock[]; // Added richContent to update request
}

interface UpdateContentResponse extends Content {
}

interface GetAllContentResponse extends Content {
}

// Interfaces for FAQ
export interface FAQ {
    _id: string;
    question: string;
    shortAnswer: string;
    detailedAnswer: string;
    order: number;
    isActive: boolean;
}

interface GetFAQsResponse extends FAQ {
}

interface CreateFAQRequest {
    question: string;
    shortAnswer: string;
    detailedAnswer: string;
    order?: number;
}

interface CreateFAQResponse extends FAQ {
}

interface UpdateFAQRequest {
    id: string;
    question?: string;
    shortAnswer?: string;
    detailedAnswer?: string;
    order?: number;
    isActive?: boolean;
}

interface UpdateFAQResponse extends FAQ {
}

interface DeleteFAQResponse {
    message: string;
}

// Interfaces for Contact Messages
export interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    message: string;
    status: 'pending' | 'resolved';
    reply?: string;
    createdAt: string;
}

interface GetContactMessagesRequest {
    status?: 'pending' | 'resolved';
}

interface GetContactMessagesResponse extends ContactMessage {
}

interface CreateContactMessageRequest {
    name: string;
    email: string;
    message: string;
}

interface CreateContactMessageResponse {
    message: string;
}

interface UpdateContactMessageRequest {
    id: string;
    status?: 'pending' | 'resolved';
    reply?: string;
}

interface UpdateContactMessageResponse extends ContactMessage {
}

interface DeleteContactMessageResponse {
    message: string;
}


export const contentApi = createApi({
    reducerPath: 'contentApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/', // Base URL for all content-related endpoints
        credentials: 'include',
    }),
    refetchOnFocus: true,
    endpoints: (builder) => ({
        // Public Content Endpoints
        getContentByType: builder.query<GetContentByTypeResponse, string>({
            query: (pageType) => `content/${pageType}`,
        }),
        getFAQs: builder.query<GetFAQsResponse[], void>({
            query: () => 'faqs',
        }),
        createContactMessage: builder.mutation<CreateContactMessageResponse, CreateContactMessageRequest>({
            query: (newMessage) => ({
                url: 'contact',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newMessage,
            }),
        }),

        // Admin Content Endpoints
        getAllContentAdmin: builder.query<GetAllContentResponse[], void>({
            query: () => 'admin/content',
        }),
        updateContentAdmin: builder.mutation<UpdateContentResponse, UpdateContentRequest>({
            query: ({pageType, ...data}) => ({
                url: `admin/content/${pageType}`,
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: data,
            }),
        }),

        // Admin FAQ Endpoints
        getFAQsAdmin: builder.query<GetFAQsResponse[], void>({
            query: () => 'admin/faqs',
        }),
        createFAQAdmin: builder.mutation<CreateFAQResponse, CreateFAQRequest>({
            query: (newFAQ) => ({
                url: 'admin/faqs',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: newFAQ,
            }),
        }),
        updateFAQAdmin: builder.mutation<UpdateFAQResponse, UpdateFAQRequest>({
            query: ({id, ...data}) => ({
                url: `admin/faqs/${id}`,
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: data,
            }),
        }),
        deleteFAQAdmin: builder.mutation<DeleteFAQResponse, string>({
            query: (id) => ({
                url: `admin/faqs/${id}`,
                method: 'DELETE',
            }),
        }),

        // Admin Contact Message Endpoints
        getContactMessagesAdmin: builder.query<GetContactMessagesResponse[], GetContactMessagesRequest>({
            query: (params) => {
                const queryString = new URLSearchParams(params as Record<string, string>).toString();
                return `admin/contact-messages?${queryString}`;
            },
        }),
        updateContactMessageAdmin: builder.mutation<UpdateContactMessageResponse, UpdateContactMessageRequest>({
            query: ({id, ...data}) => ({
                url: `admin/contact-messages/${id}`,
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: data,
            }),
        }),
        deleteContactMessageAdmin: builder.mutation<DeleteContactMessageResponse, string>({
            query: (id) => ({
                url: `admin/contact-messages/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    // Public exports
    useGetContentByTypeQuery,
    useGetFAQsQuery,
    useCreateContactMessageMutation,

    // Admin exports
    useGetAllContentAdminQuery,
    useUpdateContentAdminMutation,
    useGetFAQsAdminQuery,
    useCreateFAQAdminMutation,
    useUpdateFAQAdminMutation,
    useDeleteFAQAdminMutation,
    useGetContactMessagesAdminQuery,
    useUpdateContactMessageAdminMutation,
    useDeleteContactMessageAdminMutation,
} = contentApi;