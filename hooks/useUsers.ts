import { UserFullI } from "@/types/types";
import { useSelector } from "react-redux"


export default function useUsers(){
    const { users }:{users:UserFullI[]} =useSelector((state:any)=> state.users);

    const userByID=(id:number):UserFullI| undefined=>users.find(user=>user.id==id)

    return { users,userByID }
}