import useChart from "@/hooks/useChart";
import { ChartPatternI, StatisticDataRowI, UserI } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PatternControl from "./PatternControl/PatternControl";
import TableView from "./TableView/TableView";

//info
//Tables updates only after update statisticRowsData

export default function Tables(){
    //массив массивов всех выбранных статистик с заполнеными полями [[{name,value}]]
    const [statisticRowsData, setStatisticRowsData] = useState<Array<StatisticDataRowI[]>>([]);
    const [currentPattern,setCurrentPattern]=useState<ChartPatternI| undefined>()

    useEffect(()=>{
        console.log('🌍 statisticRowsData :', statisticRowsData);
    },[statisticRowsData])

    return <div>
        <h3>Tables</h3>
        <PatternControl {...{setStatisticRowsData,setCurrentPattern}} />
        <TableView statisticRowsData={statisticRowsData} currentPattern={currentPattern}/>
        
    </div>
}