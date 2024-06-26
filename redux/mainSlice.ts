import { createSlice, nanoid } from "@reduxjs/toolkit";

interface UserI {
    email: string;
    is_blocked: boolean;
    is_verificated: boolean;
    name: string;
    post: string;
    role: "user" | "admin";
    structure: null;
    userId: number;
}

const initialState: { user: UserI | boolean; userOnDirect: boolean } = {
    user: false,
    userOnDirect: false,
};

export const mainSlice = createSlice({
    name: "main",
    initialState,
    reducers: {
        logInRedux: (state, action) => {
            state.user = action.payload;
        },
        logOutRedux: (state) => {
            state.user = false;
        },
        setUserOnDirectRedux: (state, action) => {
            state.userOnDirect = action.payload;
        },
    },
});

export const {
    reducer: mainReducer,
    actions: { logInRedux, logOutRedux, setUserOnDirectRedux },
} = mainSlice;
