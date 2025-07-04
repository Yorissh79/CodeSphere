import {configureStore} from "@reduxjs/toolkit";
import {userApi} from "../services/userApi";
import {authCheck} from "../services/authCheck";
import {setupListeners} from "@reduxjs/toolkit/query/react";
import {teacherApi} from "../services/teacherApi.ts";
import {googleApi} from "../services/googleApi.ts";
import {adminApi} from "../services/adminApi.ts";
import {groupApi} from "../services/groupApi.ts";
import {missesApi} from "../services/missesApi.ts";
import {quizApi} from "../services/quizApi.ts";
import {questionApi} from "../services/questionApi.ts";
import {answerApi} from "../services/answerApi.ts";
import {baseApi} from "../services/baseApi.ts";
import {commentApi} from "../services/commentsApi.ts";
import {contentApi} from "../services/contentApi.ts";
import {emailApi} from "../services/emailApi.ts";

export const store = configureStore({
    reducer: {
        [userApi.reducerPath]: userApi.reducer,
        [authCheck.reducerPath]: authCheck.reducer,
        [teacherApi.reducerPath]: teacherApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [googleApi.reducerPath]: googleApi.reducer,
        [groupApi.reducerPath]: groupApi.reducer,
        [missesApi.reducerPath]: missesApi.reducer,
        [quizApi.reducerPath]: quizApi.reducer,
        [questionApi.reducerPath]: questionApi.reducer,
        [answerApi.reducerPath]: answerApi.reducer,
        [commentApi.reducerPath]: commentApi.reducer,
        [baseApi.reducerPath]: baseApi.reducer,
        [contentApi.reducerPath]: contentApi.reducer,
        [emailApi.reducerPath]: emailApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            userApi.middleware,
            authCheck.middleware,
            teacherApi.middleware,
            googleApi.middleware,
            adminApi.middleware,
            groupApi.middleware,
            missesApi.middleware,
            quizApi.middleware,
            questionApi.middleware,
            answerApi.middleware,
            commentApi.middleware,
            baseApi.middleware,
            contentApi.middleware,
            emailApi.middleware,
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;