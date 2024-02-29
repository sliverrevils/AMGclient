import {createSlice, nanoid} from '@reduxjs/toolkit';

interface UserI{
    email:string,
    is_blocked:boolean,
    is_verificated:boolean,
    name:string,
    post:string,
    role:"user"|"admin",
    structure:null,
    userId:number,
}

const initialState:{user:UserI|boolean}={
    user:false
    // {
    //     email:'',
    //     is_blocked:true,
    //     is_verificated:false,
    //     name:'',
    //     post:'',
    //     role:"user",
    //     structure:null,
    //     userId:0,
    // },
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