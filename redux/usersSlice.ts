import {createSlice, nanoid} from '@reduxjs/toolkit';

const initialState={
    users:[],
}

export const usersSlice=createSlice({
    name:'users',
    initialState,
    reducers:{
        setUsersRedux:(state,action)=>{state.users=action.payload},
       // logOutRedux:(state)=>{state.users=[]}

    }
});

export const {reducer:usersReducer,actions:{setUsersRedux}}=usersSlice;