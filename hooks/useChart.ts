import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { ChartI, ChartPatternI, FieldI, LineI } from "@/types/types";

import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function useChart() {
    const dispatch = useDispatch();

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

    const getAllPatterns = async(id:number, setPatternsArr:any)=>{
        dispatch(setLoadingRedux(true));
        try {
            const {data} = await axiosClient.get(`charts/all`);
            console.log('PATTERNS ALL', data)
            dispatch(setLoadingRedux(false));
            setPatternsArr(data);
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }
    }
    const getUserPatterns = async(id:number, setPatternsArr:any)=>{
        dispatch(setLoadingRedux(true));
        try {
            const {data} = await axiosClient.get(`/info/user_patterns/${id}`);
            console.log('PATTERNS', data)
            dispatch(setLoadingRedux(false));
            const withParsedFields=data.map(pattern=>({...pattern,fields:JSON.parse(pattern.fields),lines:JSON.parse(pattern.lines)}))
            setPatternsArr(withParsedFields);
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }
    }

    return {createChartPattern, getUserPatterns, getAllPatterns}
}