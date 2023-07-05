import { UserFullI, UserI } from "@/types/types"
import axiosClient from "./axiosClient"
import { AxiosError } from "types-axios";
import {toast} from 'react-toastify'

// export const authCheck=async():Promise<UserI|boolean|undefined>=>{       
//         return (await axiosClient.get('users/login-check')).data;    
// }
export const authCheck=async():Promise<UserI|boolean|undefined>=>{
    try{        
        const {data}:{data:UserI}= await axiosClient.get('users/login-check');
        return data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        if(axiosError.response?.status==403){
            toast('Пожалуйста авторизуйтесь');
            return false;
        }
    }
    
}

export const userLogOut=async():Promise<string>=>{       
    return (await axiosClient.get('users/logout')).data.message as string;    
}

export const getAllUsers=async():Promise<UserFullI[] | AxiosError>=>{
    try{
        const users:UserFullI[]= await axiosClient.get('users/all-users');
        return users;
    }catch(error){
        return error as AxiosError;
    }
    
}