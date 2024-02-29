import { ChartPatternI, StatHeaderI, TablePatternI } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState:{patterns:ChartPatternI[],access:any,tablePatterns:TablePatternI[]}={
    patterns:[],
    access:[],
    tablePatterns:[],
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
        },
        setTableHeadersRedux:(state,{payload}:{payload:TablePatternI[]})=>{
            state.tablePatterns=payload;
        }
    }

});



export const {reducer:patternReducer, actions:{setPatternsRedux,setAccessPatternsRedux,setTableHeadersRedux}} =patternsSlice;