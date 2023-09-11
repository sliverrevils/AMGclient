import { OrgDepartmentsI, OrgI, OrgOfficeI } from '@/types/orgTypes';
import {createSlice, nanoid} from '@reduxjs/toolkit';
import { StateReduxI } from './store';
import { OfficeI } from '@/types/types';

const initialState:OrgI={
    generalDirector:0,
    offices:[]
}

export const orgSlice=createSlice({
    name:'org',
    initialState,
    reducers:{
        // setUsersRedux:(state,action)=>{state.users=action.payload},
       // logOutRedux:(state)=>{state.users=[]}
       setGeneralDirectorRedux:(state,action)=>{state.generalDirector=action.payload},
       setOfficesRedux:(state,{payload}:{payload:OfficeI[]})=>{
        state.offices=[...payload];
       }

    //     //office
    //    addOrgOfficeRedux:(state,action:{payload:OrgOfficeI})=>{state.offices=[...state.offices,action.payload]},
    //    deleteOrgOfficeRedux:(state,action:{payload:string})=>{state.offices=state.offices.filter(office=>office.key!==action.payload)},

    //    //depatment
    //    addOrgDepatmentRedux:(state,{payload:{depatment,officeKey}}:{payload:{officeKey:string,depatment:OrgDepartmentsI}})=>{
    //     const officeState=state.offices.find(office=>office.key===officeKey);
    //     if(officeState){
    //         officeState.departments=[...officeState.departments,depatment];
    //     }
    //    },
    //    //sections
    //    addOrgSectionRedux:(state,{payload:{section,officeKey,departmenKey}})=>{        
    //     const officeState=state.offices.find(office=>office.key===officeKey);
    //     const departmentState=officeState?.departments.find(departmen=>departmen.key===departmenKey);
    //     if(departmentState){
    //         departmentState.sections=[...departmentState.sections,section];
    //     }
    //    }
    }
});

export const {
    reducer:orgReducer,
    actions:{
        setGeneralDirectorRedux,
        setOfficesRedux,
        // addOrgOfficeRedux,
        // deleteOrgOfficeRedux,
        // addOrgDepatmentRedux,
        // addOrgSectionRedux
    }
}=orgSlice;