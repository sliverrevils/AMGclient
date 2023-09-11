import { ChartPatternI } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState:{patterns:ChartPatternI[]}={
    patterns:[]
}

export const patternsSlice = createSlice({
    name:'patterns',
    initialState,
    reducers:{
        setPatternsRedux:(state,{payload}:{payload:ChartPatternI[]})=>{
            state.patterns = [...payload];
        }
    }

});



export const {reducer:patternReducer, actions:{setPatternsRedux}} =patternsSlice;