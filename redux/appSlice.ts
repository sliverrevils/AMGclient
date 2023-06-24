import {createSlice, nanoid} from '@reduxjs/toolkit';

const initialState={
    loading:false,
    loadingFullScreen:false,
}

export const appSlice=createSlice({
    name:'app',
    initialState,
    reducers:{
        setLoadingRedux:(state,action:{payload:boolean})=>{state.loading=action.payload},
       

    }
});

export const {reducer:appReducer,actions:{setLoadingRedux}}=appSlice;