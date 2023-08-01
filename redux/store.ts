import { configureStore } from "@reduxjs/toolkit";
import { mainReducer, mainSlice } from "./mainSlice";
import { appReducer, appSlice } from "./appSlice";
import { contentReducer, contentSlice } from "./contentSlice";
import { usersReducer, usersSlice } from "./usersSlice";

export const store=configureStore({
    reducer:{[mainSlice.name]:mainReducer,[appSlice.name]:appReducer,[contentSlice.name]:contentReducer,[usersSlice.name]:usersReducer},
    devTools:process.env.NODE_ENV==='development',
});

export type RootState= ReturnType< typeof store.getState>;

export type AppDispatch = typeof store.dispatch;