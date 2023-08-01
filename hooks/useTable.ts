import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { TableI } from "@/types/types";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";



export default function useTable(){
    const dispatch = useDispatch();
    
    const allTablesByPatternId= async(pattern_id:number,updateState?:any):Promise< TableI[] >=>{
        dispatch(setLoadingRedux(true));
        try{
            // updateState([]);
            const allTables= await axiosClient.get(`tables/all/${pattern_id}`);          
            if(allTables.data?.length){                
                const parsedTables = allTables.data.map((table:any)=>({...table,columns:JSON.parse(table.columns)}));
                updateState&&updateState(parsedTables);
               // console.log('ALL TABLES 📰',parsedTables);
                dispatch(setLoadingRedux(false));
                return parsedTables as TableI[];
                
            }
            dispatch(setLoadingRedux(false));
            return []        
            

        } catch (err) {
            console.log('ERROR TABLE !!!',err)
            // updateState([]);
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }

    }

    const createTable = async (name,view_pattern_id,columns, updateState?: any):Promise<TableI[]> => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post(`tables/create`,{
                name,
                view_pattern_id,
                columns:JSON.stringify(columns)
            });           
            dispatch(setLoadingRedux(false));
            let updatedParsed:TableI[]=[];
            if (created) {
                updatedParsed=created.data.map((table:any)=>({...table,columns:JSON.parse(table.columns)})) as TableI[]
                if(created.data?.length&&updateState){                                  
                    updateState(updatedParsed);
                }
                
                toast.success(`Таблица успешно сохранена`);        

            }
            return updatedParsed;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }
    }

    return { allTablesByPatternId, createTable}
}