import {createSlice, nanoid} from '@reduxjs/toolkit';

const initialState={
current:'Главная',
}

export const contentSlice=createSlice({
    name:'content',
    initialState,
    reducers:{
        setCurrentContentRedux:(state,action)=>{state.current=action.payload},
        contentCurrentClear:(state)=>{state.current=initialState.current}   

    }
});

export const {reducer:contentReducer,actions:{setCurrentContentRedux,contentCurrentClear}}=contentSlice;