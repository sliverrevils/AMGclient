import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { TablePatternI, UserFullI } from "@/types/types";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import useOrg from "./useOrg";



export default function useTablePatterns(){

    const dispatch = useDispatch();
    const {users}:{users:UserFullI[]} = useSelector((state:any)=>state.users);

    
    //HOOKS
    const {getOrgFullScheme} = useOrg();

        //CREATE TABLE PATTERN
        const createTablePattern = async (pattern:TablePatternI) => {
            dispatch(setLoadingRedux(true));
            try {
                const created: any = await axiosClient.post(`patterns/create`, { 
                    name:pattern.name,
                    headers:JSON.stringify(pattern.headers),
                });
                dispatch(setLoadingRedux(false));
                if (created) {              
                    !created.data.errorMessage&&toast.success(`Шаблон "${pattern.name}" успешно создан`);
                    toast.warning(created.data.errorMessage);
                    getOrgFullScheme({});
                    
                }
                return true
            } catch (err) {
                dispatch(setLoadingRedux(false));
                axiosError(err);
                return false;
            }
        }

        //DEL TABLE PATTERN
        const deleteTablePattern = async (id:number) => {
            dispatch(setLoadingRedux(true));
            try {
                const deleted: any = await axiosClient.get(`patterns/delete/${id}`);
                dispatch(setLoadingRedux(false));
                if (deleted) {              
                    !deleted.data.errorMessage&&toast.success(`Шаблон "${deleted.name}" удален`);
                    toast.warning(deleted.data.errorMessage);
                    getOrgFullScheme({});
                    
                }
                return true
            } catch (err) {
                dispatch(setLoadingRedux(false));
                axiosError(err);
                return false;
            }
        }

    return { createTablePattern,deleteTablePattern }
}