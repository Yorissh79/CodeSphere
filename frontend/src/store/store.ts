import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../services/userApi";
import { authCheck } from "../services/authCheck";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import {teacherApi} from "../services/teacherApi.ts";
import {googleApi} from "../services/googleApi.ts";
import {adminApi} from "../services/adminApi.ts";

export const store = configureStore({
    reducer: {
        [userApi.reducerPath]: userApi.reducer,
        [authCheck.reducerPath]: authCheck.reducer,
        [teacherApi.reducerPath]: teacherApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [googleApi.reducerPath]: googleApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(userApi.middleware)
            .concat(authCheck.middleware)
            .concat(teacherApi.middleware)
            .concat(googleApi.middleware)
            .concat(adminApi.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
