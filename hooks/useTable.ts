import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { setSelectedTableIdRedux, setTabelsRedux } from "@/redux/statsSlice";
import { StateReduxI } from "@/redux/store";
import { TableI } from "@/types/types";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";



export default function useTable(){
    const dispatch = useDispatch();
    const {selectedPatternId, selectedTableId, columns, lines, createdRows}=useSelector((state:StateReduxI)=>state.stats);
    
    const allTablesByPatternId= async():Promise< TableI[] >=>{
        dispatch(setLoadingRedux(true));
        console.log('GET TABELS');
        try{
            
            const allTables= await axiosClient.get(`tables/all/${selectedPatternId}`);          
            if(allTables.data?.length){                
                const parsedTables = allTables.data.map((table:any)=>({...table,columns:JSON.parse(table.columns),costumLines:JSON.parse(table.costumLines)}));

               dispatch(setTabelsRedux(parsedTables));
                dispatch(setLoadingRedux(false));
                return parsedTables as TableI[];
                
            }else{
                dispatch(setTabelsRedux([]));
            }
            dispatch(setLoadingRedux(false));
            console.log('GET TABELS');
            return []        
            

        } catch (err) {
            console.log('ERROR TABLE !!!',err)
            // updateState([]);
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }

    }

    const createTable = async (name,view_pattern_id,columns,costumLines, updateState?: any):Promise<TableI[]> => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post(`tables/create`,{
                name,
                view_pattern_id,
                columns:JSON.stringify(columns),
                costumLines:JSON.stringify(costumLines),
            });           
            dispatch(setLoadingRedux(false));
            let updatedParsed:TableI[]=[];
            if (created) {
                updatedParsed=created.data.map((table:any)=>({...table,columns:JSON.parse(table.columns),costumLines:JSON.parse(table.costumLines)})) as TableI[];
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
        
    const updateTable = async (updateState?: any) => {
        dispatch(setLoadingRedux(true));
        try {
            const updated: any = await axiosClient.post(`tables/update/${selectedTableId}`,{
                columns:JSON.stringify(columns),
                costumLines:JSON.stringify(lines),
            });           
            dispatch(setLoadingRedux(false));
            console.log('UPDATE',updated.data)
            if (updated?.data?.length) {
                console.log('UPDATE');
                const updatedParsed=updated.data.map((table:any)=>({...table,columns:JSON.parse(table.columns),costumLines:JSON.parse(table.costumLines)})) as TableI[];
                                                 
                updateState&&updateState(updatedParsed);
                dispatch(setTabelsRedux(updatedParsed));
                toast.success(`Таблица успешно обновлена`);
            }
            
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
           
        }
    }

    const deleteTable = async (table_id,view_pattern_id,updateState?: any):Promise<TableI[]> => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post(`tables/delete/${table_id}`,{               
                view_pattern_id,               
            });           
            dispatch(setLoadingRedux(false));
            let updatedParsed:TableI[]=[];
            if (created) {
                updatedParsed=created.data.map((table:any)=>({...table,columns:JSON.parse(table.columns)})) as TableI[];
                if(created.data?.length&&updateState){                                  
                    updateState(updatedParsed);
                }                
                toast.success(`Таблица успешно удалена`); 
                dispatch(setTabelsRedux(updatedParsed))
                dispatch(setSelectedTableIdRedux(0)) 
            }
            return updatedParsed;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }
    }

    const isNumbersOnColumn = (costumSelectColumn?: number) => {
        if (costumSelectColumn) {
            return createdRows.every(row => !isNaN(Number(row[costumSelectColumn]?.value)));
        }
        // if (selectedColumnIndex !== null) {
        //     return createdRows.every(row => !isNaN(Number(row[selectedColumnIndex].value)));
        // }
        return false
    }

    return { allTablesByPatternId, createTable, deleteTable, updateTable, isNumbersOnColumn}
}