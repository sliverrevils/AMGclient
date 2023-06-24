import {createSlice, nanoid} from '@reduxjs/toolkit';

const initialState={
    user:false,
}

export const mainSlice=createSlice({
    name:'main',
    initialState,
    reducers:{
        logInRedux:(state,action)=>{state.user=action.payload},
        logOutRedux:(state)=>{state.user=false}

    }
});

export const {reducer:mainReducer,actions:{logInRedux,logOutRedux}}=mainSlice;