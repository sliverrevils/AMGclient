import { ChartPatternI, ColumnI, ColumnLineI, RowI, StatisticDataRowI, StatisticI, TableI, TableStatisticListItemI } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";




const initialState
    : {
        initStats:StatisticI[],
        initStatsRows:StatisticDataRowI[][],
        createdRows:RowI[][],
        selectedPatternId:number,
        dateStart:number,
        dateEnd:number,
        selectedTableId:number,
        selectedUserId:number,
        tabels:TableI[],
        columns:ColumnI[],
        lines:ColumnLineI[],
        tableStatisticsList:TableStatisticListItemI[]

    }
    = {
        initStats: [],
        initStatsRows:[],
        createdRows:[],
        selectedPatternId:0,
        dateStart:0,
        dateEnd:0,
        selectedTableId:0,
        selectedUserId:0,
        tabels:[],
        lines:[],
        columns:[],
        tableStatisticsList:[]
}

export const statsSlice = createSlice({
    name:'stats',
    initialState,
    reducers:{
        clearStatsRedux:(state)=>initialState,        

        setInitStatsRedux:(state,{payload}:{payload:StatisticI[]})=>{
            state.initStats = [...payload];
        },
        setInitStatsRowsRedux:(state,{payload}:{payload:StatisticDataRowI[][]})=>{
            state.initStatsRows = [...payload];
        },

        setColumnsRedux:(state,{payload}:{payload:ColumnI[]})=>{
            state.columns = [...payload];
        },
        addNewColumnRedux:(state,{payload}:{payload:ColumnI})=>{
            state.columns=[...state.columns,payload]
        },
        
        deleteColumnByIndex:(state,{payload}:{payload:number})=>{
            state.columns=state.columns.filter((column,columnIndex)=>columnIndex !== payload)
        },
        columnMoveNextRedux:(state,{payload}:{payload:number})=>{
            //console.log('REDUX',payload+1,state.columns.length-1)
            if(payload!==state.columns.length-1){
            const tempColumns=[...state.columns];
            tempColumns[payload]=state.columns[payload+1];
            tempColumns[payload+1]=state.columns[payload];
            state.columns=tempColumns;
            }
        },
        columnMovePrevRedux:(state,{payload}:{payload:number})=>{
            if(payload!==0){
                const tempColumns=[...state.columns];
                tempColumns[payload]=state.columns[payload-1];
                tempColumns[payload-1]=state.columns[payload];
            state.columns=tempColumns;
            }
        },
        columnUpdateRedux:(state,{payload}:{payload:{columnIndex:number,columnData:ColumnI}})=>{
            state.columns[payload.columnIndex]=payload.columnData;
        },
        


        setCreatedRowsRedux:(state,{payload}:{payload:RowI[][]})=>{
            state.createdRows = [...payload];
        },
        setTabelsRedux:(state,{payload}:{payload:TableI[]})=>{
            state.tabels = [...payload];
        },
        setPeriodStatsRedux:(state,{payload}:{payload:{dateStart:number,dateEnd:number}})=>{
           state.dateStart=payload.dateStart;
           state.dateEnd=payload.dateEnd;
        },
        setSelectedPatternIdRedux:(state,{payload}:{payload:number})=>{
            state.selectedPatternId=payload;
        },
        setSelectedTableIdRedux:(state,{payload}:{payload:number})=>{
            state.selectedTableId=payload;
        },
        setSelectedUserIdRedux:(state,{payload}:{payload:number})=>{
            state.selectedUserId=payload;
        },
        setLinesRedux:(state,{payload}:{payload:ColumnLineI[]})=>{
            state.lines=payload;
        },
        addColumnLine:(state,{payload}:{payload:ColumnLineI})=>{
            if(!state.lines.some(line=>line.columnKey==payload.columnKey)){
                state.lines=[...state.lines,payload];
            }            
        },
        setLineTrendRedux:(state,{payload}:{payload:number})=>{
            const currentLine=state.lines.find(line=>line.columnKey==payload);
            if(currentLine){
                currentLine.trend=true;
            }
        },
        setTableStatisticsListRedux:(state,{payload}:{payload:TableStatisticListItemI[]})=>{
            state.tableStatisticsList=payload;
        }
    }
});



export const {
    reducer:statsReducer,
     actions:{
        clearStatsRedux,
        setInitStatsRedux, 
        setPeriodStatsRedux,
        setSelectedPatternIdRedux,
        setSelectedTableIdRedux,
        setSelectedUserIdRedux,
        setCreatedRowsRedux,
        setInitStatsRowsRedux,
        setTabelsRedux,
        addColumnLine,
        setColumnsRedux,
        addNewColumnRedux,
        deleteColumnByIndex,
        columnMoveNextRedux,
        columnMovePrevRedux,
        columnUpdateRedux,
        setLinesRedux,
        setLineTrendRedux,
        setTableStatisticsListRedux

    }} =statsSlice;