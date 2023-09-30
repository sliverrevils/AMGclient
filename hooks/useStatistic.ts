import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { setCreatedRowsRedux, setInitStatsRedux, setPeriodStatsRedux, setSelectedPatternIdRedux } from "@/redux/statsSlice";
import { StateReduxI } from "@/redux/store";
import { StatisticI } from "@/types/types";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function useStatistic(){
    const dispatch = useDispatch();
    const setLoading=(bool: boolean)=>dispatch(setLoadingRedux(bool));
    //SELECtORS
    const isAdmin=useSelector((state:any)=>state.main.user.role==='admin');
    const {user} = useSelector((state:any)=>state.main);
    const {stats} =useSelector((state:StateReduxI)=>state);

    const getAllByUserID=async (setStatsArr:any,id:number=user.userId)=>{
        setLoading(true);
        try {
            const resArr: any = await axiosClient.get(`statistics/all/${id}`);
            setLoading(false);

            if (resArr) {                
                console.log('ALL STATS', resArr);    
                setStatsArr(resArr.data)            
                toast.warning(resArr.data.errorMessage);
            }
            return true
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return false;
        }
    }
    const createStatistic=async (body:StatisticI ,update:boolean=false)=>{
        setLoading(true);
        try {
            const created: any = await axiosClient.post(`statistics/create`,body);
            setLoading(false);

            if (created.data) {  
                !created.data.errorMessage&&toast.success(`Добавлена запись "${new Date(+created.data.dateStart).toLocaleDateString()} - ${new Date(+created.data.dateEnd).toLocaleDateString()}"`);              
                              
                toast.warning(created.data.errorMessage);
            }
            if(update){
                getPeriodByUserID(isAdmin?stats.selectedUserId:user.userId,stats.selectedPatternId,stats.dateStart,stats.dateEnd);
            }
            return true
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return false;
        }
    }
    const updateStatistic=async (stat_id:number,body:StatisticI ,id:number=user.userId)=>{
        setLoading(true);
        try {
            const updated: any = await axiosClient.post(`statistics/update/${stat_id}`,body);
            setLoading(false);

            if (updated.data) {                           
                console.log('UPDATED', updated);                
                toast.warning(updated.data.errorMessage);
                toast.success('Запись обновлена'); 
            }
            console.log('GET PERIOD',id,stats.selectedPatternId,stats.dateStart,stats.dateEnd);
            getPeriodByUserID(isAdmin?stats.selectedUserId:user.userId,stats.selectedPatternId,stats.dateStart,stats.dateEnd);
            return true
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return false;
        }
    }

    const getAllUserStatsByChartId=async (id:number,setStatsArr:any)=>{
        setLoading(true);
        try {
            const statsArr: any = await axiosClient.get(`statistics/stats_by_chart_id/${id}`);

            setLoading(false);

            if (statsArr.data) {                             
               // console.log('ALL STATS BY CHART ID: '+id, statsArr.data.map(el=>({...el,fields:JSON.parse(el.fields)})));  
                setStatsArr(statsArr.data
                    .map(el=>({...el,fields:JSON.parse(el.fields)}))
                    .sort((stat_1,stat_2)=>new Date(+stat_1.dateStart).getTime() - new Date(+stat_2.dateStart).getTime())  
                    );              
                toast.warning(statsArr.data.errorMessage);
            }
            return true
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return false;
        }
    }

    const getPeriodByUserID=async (id:number=user.userId,pattern: number,dateStart:number, dateEnd:number, setStatsArr?:any):Promise<StatisticI[]>=>{
        setLoading(true);
        try {
            const resArr: any = await axiosClient.post(`statistics/period/${id}`,{ // if id = 0 : gets all users statistic
                pattern,
                dateStart,
                dateEnd
            });
            setLoading(false);
            const withParsedFields:StatisticI[]=resArr.data.map(stat=>({...stat,fields:JSON.parse(stat.fields)}))
            dispatch(setInitStatsRedux(withParsedFields||[]));
            dispatch(setPeriodStatsRedux({dateStart,dateEnd}));
            dispatch(setSelectedPatternIdRedux(pattern));
            
            if (resArr) {                
                //console.log('withParsedFields', withParsedFields);    
                setStatsArr&&setStatsArr(withParsedFields)            
                toast.warning(resArr.data.errorMessage);
            }
            if(!withParsedFields.length){
                dispatch(setCreatedRowsRedux([]));
            }
           
            return withParsedFields
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return [];
        }
    }
    const getAllByPeriod=async (dateStart:number, dateEnd:number, setStatsArr?:any):Promise<StatisticI[]>=>{
        setLoading(true);
        try {
            const resArr: any = await axiosClient.post(`statistics/allByPeriod`,{                 
                dateStart,
                dateEnd
            });
            setLoading(false);
            const withParsedFields:StatisticI[]=resArr.data.map(stat=>({...stat,fields:JSON.parse(stat.fields)}))

            if (resArr) {                
                //console.log('withParsedFields', withParsedFields);    
                setStatsArr&&setStatsArr(withParsedFields)            
                toast.warning(resArr.data.errorMessage);
            }
           
            return withParsedFields
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return [];
        }
    }

    const deleteStatById= async (id:number,updateFunc?:any)=>{
        setLoading(true);
        try {
            const res: any = await axiosClient.get(`statistics/delete/${id}`);
            setLoading(false);

            if (res) {                
                console.log('DELETED', res);    
                //setStatsArr(resArr.data)   
                updateFunc&&updateFunc();         
                toast.warning(res.data.errorMessage);
                toast.success(res.data.message);  
                getPeriodByUserID(isAdmin?stats.selectedUserId:user.userId,stats.selectedPatternId,stats.dateStart,stats.dateEnd);
            }
            return true
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return false;
        }
    }
    const deleteAllByChartID= async (chart_id:number,updateFunc?:any)=>{
        setLoading(true);
        try {
            const res: any = await axiosClient.get(`statistics/deleteall_by_chart_id/${chart_id}`);
            setLoading(false);

            if (res) {                
                console.log('DELETED', res);    
                //setStatsArr(resArr.data)   
                updateFunc&&updateFunc();     
                toast.success(res.data.message)    
                toast.warning(res.data.errorMessage);
            }
            return true
        } catch (err) {
            setLoading(false);
            axiosError(err);
            return false;
        }
    }

    return{ getAllByUserID, createStatistic, getAllUserStatsByChartId, getPeriodByUserID, deleteStatById, deleteAllByChartID, getAllByPeriod, updateStatistic}
}