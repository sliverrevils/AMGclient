import { ChartPatternI } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState:{patterns:ChartPatternI[],access:any}={
    patterns:[],
    access:[]
}

export const patternsSlice = createSlice({
    name:'patterns',
    initialState,
    reducers:{
        setPatternsRedux:(state,{payload}:{payload:ChartPatternI[]})=>{
            state.patterns = [...payload];
        },
        setAccessPatternsRedux:(state,{payload}:{payload:any})=>{
            state.access=payload;
        }
    }

});



export const {reducer:patternReducer, actions:{setPatternsRedux,setAccessPatternsRedux}} =patternsSlice;