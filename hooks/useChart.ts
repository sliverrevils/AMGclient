import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { ChartI, ChartPatternI, FieldI, LineI, UserFullI } from "@/types/types";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function useChart() {
    const dispatch = useDispatch();
    const {users}:{users:UserFullI[]} = useSelector((state:any)=>state.users);
    const userBtId=(id:number):UserFullI|undefined=>users.find(user=>user.id==id);

    //CREATE PATTERN
    const createChartPattern = async (name: string, fields: FieldI[], lines: LineI[], descriptions:string, created_by: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post(`charts/create`, { 
                name, 
                fields:JSON.stringify(fields), 
                lines:JSON.stringify(lines), 
                descriptions, 
                created_by 
            });
            dispatch(setLoadingRedux(false));
            if (created) {                
                console.log('ADD CHART', created);
                !created.data.errorMessage&&toast.success(`Шаблон "${name}" успешно создан`);
                toast.warning(created.data.errorMessage);
            }
            return true
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    }
    //DELETE PATTER
    const deleteChartPattern = async (id: number,updaterFunc:any) => {
        dispatch(setLoadingRedux(true));
        try {
            const deleted: any = await axiosClient.get(`charts/delete/${id}`);
            dispatch(setLoadingRedux(false));
            if (deleted) {                
                console.log('ADD CHART', deleted);
                updaterFunc&&updaterFunc();
                !deleted.data.errorMessage&&toast.success(deleted.data.message);
                toast.warning(deleted.data.errorMessage);
            }
            return true
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    }

    //ALL PATTERNS
    const getAllPatterns = async(setPatternsArr:any)=>{
        dispatch(setLoadingRedux(true));
        try {
            const {data} = await axiosClient.get(`charts/all`);
            //console.log('PATTERNS ALL', data)
            dispatch(setLoadingRedux(false));
            const withParsedFields=data.map(pattern=>({...pattern,fields:JSON.parse(pattern.fields),lines:JSON.parse(pattern.lines),access:JSON.parse(pattern.access)}))
            setPatternsArr(withParsedFields);
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }
    }
    //ALL ACCESSED PATTERNS TO USER
    const getUserPatterns = async(id:number, setPatternsArr:any)=>{
        dispatch(setLoadingRedux(true));
        try {
            const {data} = await axiosClient.get(`charts/users-charts/${id}`);
          //  console.log('PATTERNS', data)
            dispatch(setLoadingRedux(false));
            const withParsedFields=data.map(pattern=>({...pattern,fields:JSON.parse(pattern.fields),lines:JSON.parse(pattern.lines),access:JSON.parse(pattern.access)}))
            setPatternsArr(withParsedFields);
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }
    }

    //ADD USER ACCESS TO PATTERN
    const addAccessToChart = async (chartId:number, userId: number, updateFunc?:any)=>{

        dispatch(setLoadingRedux(true));
        try {
            const updated: any = await axiosClient.post(`charts/add-access/${chartId}`, { 
                userId
            });
            dispatch(setLoadingRedux(false));
            if (updated) {
                !updated.data.errorMessage&&toast.success(`Доступ к шаблону предоставлен пользователю ${userBtId(userId)?.name}`);
                toast.warning(updated.data.errorMessage);
                updateFunc&&updateFunc();
            }
            return true
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }

    } 
    //CLOSE USER ACCESS TO PATTERN
    const removeAccessToChart = async (chartId:number, userId: number, updateFunc?:any)=>{

        dispatch(setLoadingRedux(true));
        try {
            const updated: any = await axiosClient.post(`charts/remove-access/${chartId}`, { 
                userId
            });
            dispatch(setLoadingRedux(false));
            if (updated) {
                !updated.data.errorMessage&&toast.success(`Доступ к шаблону закрыт для пользователя:${userBtId(userId)?.name}`);
                toast.warning(updated.data.errorMessage);
                updateFunc&&updateFunc();
            }
            return true
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }

    } 

    //CHART BY ID
    const chartById=(chartArr:ChartPatternI[],chartId:number)=>{
        let chart:ChartPatternI|undefined;
        if(chartArr.length){
           chart = chartArr.find(chart=>chart.id==chartId);
        }
        if(chart){
            return chart
        }
    }

    return {createChartPattern, getUserPatterns, getAllPatterns, addAccessToChart, removeAccessToChart, deleteChartPattern, chartById}
}