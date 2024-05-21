import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
    current: "Главная",
    param: 0,
};

export const contentSlice = createSlice({
    name: "content",
    initialState,
    reducers: {
        setCurrentContentRedux: (state, action) => {
            state.current = action.payload.current;
            state.param = action.payload.param;
        },
        contentCurrentClear: (state) => {
            state.current = initialState.current;
            state.param = initialState.param;
        },
    },
});

export const {
    reducer: contentReducer,
    actions: { setCurrentContentRedux, contentCurrentClear },
} = contentSlice;
