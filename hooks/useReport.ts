import { StateReduxI } from "@/redux/store"
import { useSelector } from "react-redux"



export default function useReportTables(){
    //SELECTORS
    const {offices} = useSelector((state:StateReduxI)=>state.org)

    const getReportInfo=()=>{

        const getItemStatistics=(({mainPattern,patterns,leadership})=>{})

        offices.forEach(office=>{

        })

    }


    return {

    }
}