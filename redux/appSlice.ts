import { IMainStyle } from "@/types/types";
import { createSlice, nanoid } from "@reduxjs/toolkit";
import dynamic from "next/dynamic";
dynamic;

const initialState: {
    loading: boolean;
    loadingFullScreen: boolean;
    mainStyle: IMainStyle;
} = {
    loading: false,
    loadingFullScreen: false,
    mainStyle: "row",
};

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setLoadingRedux: (state, action: { payload: boolean }) => {
            state.loading = action.payload;
        },
        setMainStyleRedux: (state, action: { payload: IMainStyle }) => {
            state.mainStyle = action.payload;
        },
    },
});

export const {
    reducer: appReducer,
    actions: { setLoadingRedux, setMainStyleRedux },
} = appSlice;
