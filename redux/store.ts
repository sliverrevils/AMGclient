import { configureStore } from "@reduxjs/toolkit";
import { mainReducer, mainSlice } from "./mainSlice";
import { appReducer, appSlice } from "./appSlice";
import { contentReducer, contentSlice } from "./contentSlice";
import { usersReducer, usersSlice } from "./usersSlice";
import { orgReducer, orgSlice } from "./orgSlice";
import { patternReducer, patternsSlice } from "./patternsSlce";
import { statsReducer, statsSlice } from "./statsSlice";

export const store = configureStore({
    reducer: {
        [mainSlice.name]: mainReducer,
        [appSlice.name]: appReducer,
        [contentSlice.name]: contentReducer,
        [usersSlice.name]: usersReducer,
        [orgSlice.name]: orgReducer,
        [patternsSlice.name]: patternReducer,
        [statsSlice.name]: statsReducer,
    },
    //devTools: false,
    devTools: process.env.NODE_ENV === "development",
});

export type StateReduxI = ReturnType<typeof store.getState>;

export type AppDispatchT = typeof store.dispatch;
